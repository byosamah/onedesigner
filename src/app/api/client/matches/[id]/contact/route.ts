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

    // First, get the match - simpler query first
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', params.id)
      .single()
      
    // If match exists, get the brief details separately
    let briefData = null
    if (match && match.brief_id) {
      const { data: brief } = await supabase
        .from('briefs')
        .select(`
          *,
          clients(
            email,
            company_name
          )
        `)
        .eq('id', match.brief_id)
        .single()
      briefData = brief
    }

    logger.info('Match query result:', {
      matchId: params.id,
      found: !!match,
      error: matchError?.message,
      matchClientId: match?.client_id,
      briefClientId: briefData?.client_id,
      matchStatus: match?.status
    })

    if (matchError || !match) {
      logger.error('Match not found:', {
        matchId: params.id,
        error: matchError,
        errorMessage: matchError?.message,
        errorCode: matchError?.code
      })
      
      // Try to see if match exists at all
      const { data: allMatches } = await supabase
        .from('matches')
        .select('id, client_id, status')
        .eq('id', params.id)
      
      logger.error('Debug - Direct match check:', {
        matchId: params.id,
        matchExists: allMatches && allMatches.length > 0,
        matchData: allMatches?.[0]
      })
      
      return apiResponse.notFound('Match')
    }

    // Check if the match belongs to the client (via the brief's client_id)
    const matchClientId = match.client_id || briefData?.client_id
    
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
        briefClientId: briefData?.client_id,
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

    // Check if a request already exists and its status
    const { data: existingRequest } = await supabase
      .from('project_requests')
      .select('status')
      .eq('match_id', params.id)
      .eq('client_id', clientId)
      .eq('designer_id', designerId)
      .single()
    
    if (existingRequest) {
      if (existingRequest.status === 'accepted' || existingRequest.status === 'approved') {
        return apiResponse.badRequest('This designer has already accepted your request')
      } else if (existingRequest.status === 'pending') {
        return apiResponse.badRequest('You already have a pending request with this designer')
      } else if (existingRequest.status === 'declined') {
        // Allow resending if previous request was declined
        // Delete the old declined request
        await supabase
          .from('project_requests')
          .delete()
          .eq('match_id', params.id)
          .eq('client_id', clientId)
          .eq('designer_id', designerId)
          .eq('status', 'declined')
      }
    }

    // Auto-generate professional message based on project type
    const projectType = briefData?.project_type || briefData?.design_category || 'design'
    const autoMessage = `Client is interested in working with you on their ${projectType} project.`

    // Create a complete snapshot of the brief for the designer
    // Use actual field names from the briefs table
    const briefSnapshot = {
      // Basic project info (using correct field names)
      project_type: briefData?.project_type || 'Design Project',
      timeline: briefData?.timeline || 'Not specified',
      budget: briefData?.budget || 'Not specified',
      
      // Detailed requirements (requirements is the actual field name)
      project_description: briefData?.requirements || briefData?.project_description || briefData?.industry || '',
      target_audience: briefData?.target_audience || '',
      project_goal: briefData?.project_goal || '',
      industry: briefData?.industry || '',
      
      // Design preferences
      styles: briefData?.styles || [],
      style_keywords: briefData?.style_keywords || [],
      competitors: briefData?.competitors || '',
      inspiration: briefData?.inspiration || '',
      
      // Additional details
      deliverables: briefData?.deliverables || '',
      brand_guidelines: briefData?.brand_guidelines || '',
      existing_assets: briefData?.existing_assets || '',
      specific_requirements: briefData?.specific_requirements || '',
      
      // Communication preferences
      communication: briefData?.communication || [],
      timezone: briefData?.timezone || '',
      
      // Category-specific fields
      category_specific_fields: briefData?.category_specific_fields || {},
      
      // Client info (if available)
      company_name: briefData?.clients?.company_name || '',
      
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
      brief_details: briefData, // Keep original for backward compatibility
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