import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
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
    const { valid, session } = await validateSession('CLIENT')
    if (!valid || !session?.clientId) {
      return apiResponse.unauthorized('Please log in as a client')
    }

    const { designerId, message } = await request.json()
    
    if (!designerId) {
      return apiResponse.badRequest('Designer ID is required')
    }

    const supabase = createServiceClient()

    // Get the match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*, briefs(*)')
      .eq('id', params.id)
      .eq('client_id', session.clientId)
      .single()

    if (matchError || !match) {
      return apiResponse.notFound('Match not found')
    }

    // Verify the match is unlocked
    if (match.status !== 'unlocked') {
      return apiResponse.badRequest('You must unlock the designer before contacting them')
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('email, id')
      .eq('id', session.clientId)
      .single()

    if (clientError || !client) {
      return apiResponse.notFound('Client not found')
    }

    // Get designer details
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .select('id, email, first_name, last_name')
      .eq('id', designerId)
      .single()

    if (designerError || !designer) {
      return apiResponse.notFound('Designer not found')
    }

    // Check if a request already exists
    const exists = await projectRequestService.checkExisting(params.id, session.clientId, designerId)
    if (exists) {
      return apiResponse.badRequest('You have already contacted this designer')
    }

    // Create a project request using centralized service
    const projectRequest = await projectRequestService.create({
      match_id: params.id,
      client_id: session.clientId,
      designer_id: designerId,
      message: message || 'I would like to work with you on my project.',
      status: 'pending',
      client_email: client.email,
      brief_details: match.briefs
    })

    if (!projectRequest) {
      logger.error('Failed to create project request')
      // Continue anyway to send the email
    }

    // Send email notification using centralized template
    const emailHtml = createProjectRequestEmail({
      designerName: designer.first_name || 'Designer',
      clientMessage: message || 'I would like to work with you on my project.',
      projectType: match.briefs?.project_type,
      timeline: match.briefs?.timeline,
      budget: match.briefs?.budget,
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
      clientId: session.clientId,
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