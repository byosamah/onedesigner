import { NextRequest } from 'next/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { projectRequestService } from '@/lib/database/project-request-service'

export async function GET(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    // Fetch project requests using centralized service
    const projectRequests = await projectRequestService.getByDesigner(session.designerId)

    // Format the requests for the frontend
    const formattedRequests = projectRequests.map(request => ({
      id: request.id,
      matchId: request.match_id,
      message: request.message,
      status: request.status,
      createdAt: request.created_at,
      approvedAt: request.approved_at,
      rejectedAt: request.rejected_at,
      rejectionReason: request.rejection_reason,
      
      // Client info (only show email if approved)
      client: {
        id: request.clients?.id,
        email: request.status === 'approved' ? request.clients?.email : 'Hidden until approved',
        contactAvailable: request.status === 'approved'
      },
      
      // Match info
      match: {
        id: request.matches?.id,
        score: request.matches?.score,
        reasons: request.matches?.reasons
      },
      
      // Brief info
      brief: request.matches?.briefs ? {
        projectType: request.matches.briefs.project_type,
        timeline: request.matches.briefs.timeline,
        budget: request.matches.briefs.budget,
        description: request.matches.briefs.description,
        industry: request.matches.briefs.industry,
        designStyles: request.matches.briefs.design_styles
      } : null
    }))

    return apiResponse.success({
      projectRequests: formattedRequests,
      total: formattedRequests.length,
      pending: formattedRequests.filter(r => r.status === 'pending').length,
      approved: formattedRequests.filter(r => r.status === 'approved').length,
      rejected: formattedRequests.filter(r => r.status === 'rejected').length
    })

  } catch (error) {
    return handleApiError(error, 'designer/project-requests')
  }
}