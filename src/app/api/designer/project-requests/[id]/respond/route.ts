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
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const { action, rejectionReason } = await request.json()
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return apiResponse.badRequest('Invalid action')
    }

    const supabase = createServiceClient()

    // Get the project request
    const { data: projectRequest, error: fetchError } = await supabase
      .from('project_requests')
      .select(`
        *,
        clients (
          id,
          email
        ),
        designers (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', params.id)
      .eq('designer_id', session.designerId)
      .single()

    if (fetchError || !projectRequest) {
      return apiResponse.notFound('Project request not found')
    }

    if (projectRequest.status !== 'pending') {
      return apiResponse.badRequest('This request has already been responded to')
    }

    // Update the project request status
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString()
    }

    if (action === 'approve') {
      updateData.approved_at = new Date().toISOString()
    } else {
      updateData.rejected_at = new Date().toISOString()
      updateData.rejection_reason = rejectionReason || 'Not available for this project'
    }

    const { error: updateError } = await supabase
      .from('project_requests')
      .update(updateData)
      .eq('id', params.id)

    if (updateError) {
      logger.error('Error updating project request:', updateError)
      return apiResponse.serverError('Failed to update project request')
    }

    // Send email notification to client
    if (projectRequest.clients?.email) {
      const emailHtml = action === 'approve' ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; font-size: 24px; margin: 0;">✅ Project Request Approved!</h1>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
            <p style="color: #666; line-height: 1.6;">
              Great news! ${projectRequest.designers?.first_name} ${projectRequest.designers?.last_name} has approved your project request.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #333; margin: 0 0 10px 0;"><strong>Designer Contact:</strong></p>
              <p style="color: #666; margin: 5px 0;">
                Email: <a href="mailto:${projectRequest.designers?.email}" style="color: #f0ad4e;">${projectRequest.designers?.email}</a>
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              You can now communicate directly with the designer to discuss your project details and next steps.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>© OneDesigner - Connecting Clients with Perfect Designers</p>
          </div>
        </div>
      ` : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ef4444; font-size: 24px; margin: 0;">Project Request Update</h1>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
            <p style="color: #666; line-height: 1.6;">
              Unfortunately, ${projectRequest.designers?.first_name} ${projectRequest.designers?.last_name} is not available for your project at this time.
            </p>
            
            ${rejectionReason ? `
            <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #333; margin: 0 0 10px 0;"><strong>Reason:</strong></p>
              <p style="color: #666; margin: 0;">${rejectionReason}</p>
            </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6; margin-top: 20px;">
              Don't worry! You can find another designer match or browse our other talented designers.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard" style="display: inline-block; background: #f0ad4e; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold;">
                Find Another Designer →
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>© OneDesigner - Connecting Clients with Perfect Designers</p>
          </div>
        </div>
      `

      await emailService.sendEmail({
        to: projectRequest.clients.email,
        subject: action === 'approve' 
          ? `✅ Your project request has been approved!`
          : `Project Request Update from ${projectRequest.designers?.first_name}`,
        html: emailHtml
      })
    }

    logger.info(`✅ Project request ${action}d:`, {
      requestId: params.id,
      designerId: session.designerId,
      action
    })

    return apiResponse.success({
      message: `Project request ${action}d successfully`,
      clientEmail: action === 'approve' ? projectRequest.clients?.email : null
    })

  } catch (error) {
    return handleApiError(error, 'designer/project-requests/respond')
  }
}