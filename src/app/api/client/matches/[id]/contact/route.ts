import { NextRequest } from 'next/server'
import { createServiceClientWithoutCookies } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { projectRequestService } from '@/lib/database/project-request-service'
import { createProjectRequestEmail } from '@/lib/email/templates/project-request'
import { emailService } from '@/lib/core/email-service'
import { logger } from '@/lib/core/logging-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate client session
    const sessionResult = await validateSession('CLIENT')
    
    // If session validation fails, try a direct approach
    let clientId = sessionResult.clientId || sessionResult.user?.id
    let clientEmail = sessionResult.user?.email || sessionResult.session?.email
    
    // If we don't have a client ID but have an email, look it up directly
    if (!clientId && clientEmail) {
      logger.info('Session missing clientId, looking up by email:', clientEmail)
      const supabase = createServiceClientWithoutCookies()
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('email', clientEmail)
        .single()
      
      if (clientData) {
        clientId = clientData.id
        logger.info('Found client ID from database:', clientId)
      }
    }
    
    if (!sessionResult.valid || !clientId) {
      logger.error('Authentication failed - no valid session or client ID found')
      return apiResponse.unauthorized('Please log in as a client')
    }
    
    logger.info('Using client ID:', clientId)

    // We don't actually need designerId from the request body
    // We'll get it from the match itself for security
    const requestBody = await request.json()
    
    logger.info('Contact request received:', {
      matchId: params.id,
      clientId: clientId,
      requestBody: requestBody
    })

    const supabase = createServiceClientWithoutCookies()

    // First, get the match with designer info to check if it exists
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *, 
        designer_id,
        briefs(
          *,
          client_id,
          clients(
            email,
            company_name
          )
        )
      `)
      .eq('id', params.id)
      .single()

    logger.info('Match query result:', {
      matchId: params.id,
      found: !!match,
      error: matchError?.message,
      matchClientId: match?.client_id,
      briefClientId: match?.briefs?.client_id
    })

    if (matchError || !match) {
      logger.error('Match not found:', {
        matchId: params.id,
        error: matchError,
        errorMessage: matchError?.message
      })
      return apiResponse.notFound('Match')
    }

    // Check if the match belongs to the client (via the brief's client_id)
    const matchClientId = match.client_id || match.briefs?.client_id
    
    logger.info('Ownership check:', {
      matchClientId: matchClientId,
      sessionClientId: clientId,
      isMatch: matchClientId === clientId
    })
    
    if (matchClientId !== clientId) {
      logger.error('Match ownership mismatch:', {
        matchId: params.id,
        matchClientId: matchClientId,
        sessionClientId: clientId,
        briefClientId: match.briefs?.client_id,
        matchStatus: match.status
      })
      return apiResponse.notFound('Match')
    }

    // Verify the match is unlocked
    if (match.status !== 'unlocked') {
      return apiResponse.badRequest('You must unlock the designer before contacting them')
    }

    // Get the designer ID from the match itself (more secure)
    const designerId = match.designer_id
    if (!designerId) {
      logger.error('No designer_id in match:', { matchId: params.id })
      return apiResponse.serverError('Match data is incomplete')
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('email, id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return apiResponse.notFound('Client')
    }

    // Get designer details
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .select('id, email, first_name, last_name')
      .eq('id', designerId)
      .single()

    if (designerError || !designer) {
      return apiResponse.notFound('Designer')
    }

    // Check if a request already exists
    const exists = await projectRequestService.checkExisting(params.id, clientId, designerId)
    if (exists) {
      return apiResponse.badRequest('You have already sent a working request to this designer')
    }

    // Auto-generate professional message based on project type
    const projectType = match.briefs?.project_type || match.briefs?.design_category || 'design'
    const autoMessage = `Client is interested in working with you on their ${projectType} project.`

    // Create a complete snapshot of the brief for the designer
    const briefSnapshot = {
      // Basic project info
      project_type: match.briefs?.project_type || match.briefs?.design_category,
      timeline: match.briefs?.timeline || match.briefs?.timeline_type,
      budget: match.briefs?.budget || match.briefs?.budget_range,
      
      // Detailed requirements
      project_description: match.briefs?.project_description || match.briefs?.requirements,
      target_audience: match.briefs?.target_audience,
      project_goal: match.briefs?.project_goal,
      industry: match.briefs?.industry,
      
      // Design preferences
      styles: match.briefs?.styles || [],
      style_keywords: match.briefs?.style_keywords || [],
      competitors: match.briefs?.competitors,
      inspiration: match.briefs?.inspiration,
      
      // Additional details
      deliverables: match.briefs?.deliverables,
      brand_guidelines: match.briefs?.brand_guidelines,
      existing_assets: match.briefs?.existing_assets,
      specific_requirements: match.briefs?.specific_requirements,
      
      // Category-specific fields
      category_specific_fields: match.briefs?.category_specific_fields || {},
      
      // Client info (if available)
      company_name: match.briefs?.clients?.company_name,
      
      // Match context
      match_score: match.score,
      match_reasons: match.reasons || [],
      match_id: match.id
    }

    // Calculate response deadline (72 hours from now)
    const responseDeadline = new Date()
    responseDeadline.setHours(responseDeadline.getHours() + 72)

    // Create a project request using centralized service with enhanced data
    const projectRequest = await projectRequestService.create({
      match_id: params.id,
      client_id: clientId,
      designer_id: designerId,
      message: autoMessage,
      status: 'pending',
      client_email: client.email,
      brief_details: match.briefs, // Keep original for backward compatibility
      brief_snapshot: briefSnapshot, // New comprehensive snapshot
      response_deadline: responseDeadline.toISOString()
    })

    if (!projectRequest) {
      logger.error('Failed to create project request')
      // Continue anyway to send the email
    }

    // Send email notification using centralized template with enhanced info
    const emailHtml = createProjectRequestEmail({
      designerName: designer.first_name || 'Designer',
      clientMessage: autoMessage,
      projectType: briefSnapshot.project_type,
      timeline: briefSnapshot.timeline,
      budget: briefSnapshot.budget,
      matchScore: match.score,
      responseDeadline: responseDeadline.toLocaleString(),
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
    })

    // Send the email
    await emailService.sendEmail({
      to: designer.email,
      subject: `🎯 New Project Request from OneDesigner Client`,
      html: emailHtml
    })

    logger.info('✅ Project request sent:', {
      matchId: params.id,
      clientId: clientId,
      designerId: designerId
    })

    return apiResponse.success({
      message: 'Contact request sent successfully',
      projectRequestId: projectRequest?.id
    })

  } catch (error) {
    return handleApiError(error, 'client/matches/contact')
  }
}