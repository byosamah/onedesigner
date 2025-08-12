import { NextRequest } from 'next/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { projectRequestService } from '@/lib/database/project-request-service'
import { createProjectApprovedEmail, createProjectRejectedEmail } from '@/lib/email/templates/project-request'
import { emailService } from '@/lib/core/email-service'
import { logger } from '@/lib/core/logging-service'

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

    // Get the project request with relations using centralized service
    const projectRequest = await projectRequestService.getById(params.id, session.designerId)
    
    if (!projectRequest) {
      return apiResponse.notFound('Project request not found')
    }

    if (projectRequest.status !== 'pending') {
      return apiResponse.badRequest('This request has already been responded to')
    }

    // Update the project request status using centralized service
    let success = false
    if (action === 'approve') {
      success = await projectRequestService.approve(params.id, session.designerId)
    } else {
      success = await projectRequestService.reject(params.id, session.designerId, rejectionReason)
    }

    if (!success) {
      return apiResponse.serverError('Failed to update project request')
    }

    // Send email notification to client using centralized templates
    if (projectRequest.clients?.email && projectRequest.designers) {
      const emailHtml = action === 'approve' 
        ? createProjectApprovedEmail({
            designerName: `${projectRequest.designers.first_name} ${projectRequest.designers.last_name}`,
            designerEmail: projectRequest.designers.email
          })
        : createProjectRejectedEmail({
            designerName: `${projectRequest.designers.first_name} ${projectRequest.designers.last_name}`,
            rejectionReason: rejectionReason,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard`
          })

      await emailService.sendEmail({
        to: projectRequest.clients.email,
        subject: action === 'approve' 
          ? `✅ Your project request has been approved!`
          : `Project Request Update from ${projectRequest.designers.first_name}`,
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