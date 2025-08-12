import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'
import { emailService } from '@/lib/core/email-service'

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

    // Create a project request record
    const { data: projectRequest, error: requestError } = await supabase
      .from('project_requests')
      .insert({
        match_id: params.id,
        client_id: session.clientId,
        designer_id: designerId,
        message: message || 'I would like to work with you on my project.',
        status: 'pending',
        client_email: client.email,
        brief_details: match.briefs
      })
      .select()
      .single()

    if (requestError) {
      logger.error('Error creating project request:', requestError)
      // If table doesn't exist, we'll send the email anyway
    }

    // Send email notification to designer
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
    
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f0ad4e; font-size: 24px; margin: 0;">🎯 New Project Request!</h1>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; font-size: 18px; margin-top: 0;">Hi ${designer.first_name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Great news! A client is interested in working with you on their project.
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #333; margin: 0;"><strong>Client Message:</strong></p>
            <p style="color: #666; margin: 10px 0; font-style: italic;">
              "${message || 'I would like to work with you on my project.'}"
            </p>
          </div>
          
          <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #333; margin: 0 0 10px 0;"><strong>Project Details:</strong></p>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Category: ${match.briefs?.project_type || 'Not specified'}</li>
              <li>Timeline: ${match.briefs?.timeline || 'Not specified'}</li>
              <li>Budget: ${match.briefs?.budget || 'Not specified'}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: #f0ad4e; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold;">
              View in Dashboard →
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Once you approve this project request, you'll receive the client's contact information.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>© OneDesigner - Connecting Clients with Perfect Designers</p>
        </div>
      </div>
    `

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