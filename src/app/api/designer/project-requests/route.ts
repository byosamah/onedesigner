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
      created_at: request.created_at,
      viewed_at: request.viewed_at,
      response_deadline: request.response_deadline,
      approvedAt: request.approved_at,
      rejectedAt: request.rejected_at,
      rejectionReason: request.rejection_reason,
      
      // Include the complete brief snapshot (the single source of truth)
      brief_snapshot: request.brief_snapshot,
      
      // Client info (only show email if approved/accepted)
      clients: {
        id: request.clients?.id,
        email: (request.status === 'approved' || request.status === 'accepted') ? request.clients?.email : null,
        contactAvailable: (request.status === 'approved' || request.status === 'accepted')
      },
      
      // Match info
      matches: {
        id: request.matches?.id,
        score: request.matches?.score || request.brief_snapshot?.match_score,
        reasons: request.matches?.reasons || request.brief_snapshot?.match_reasons,
        
        // Legacy brief info for backward compatibility
        briefs: request.matches?.briefs ? {
          project_type: request.matches.briefs.project_type,
          timeline: request.matches.briefs.timeline,
          budget: request.matches.briefs.budget,
          industry: request.matches.briefs.industry,
          styles: request.matches.briefs.styles
        } : null
      }
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