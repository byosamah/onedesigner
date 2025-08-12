import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const supabase = createServiceClient()

    // Fetch project requests for this designer
    const { data: projectRequests, error } = await supabase
      .from('project_requests')
      .select(`
        *,
        matches (
          id,
          score,
          reasons,
          briefs (
            project_type,
            timeline,
            budget,
            description,
            industry,
            design_styles
          )
        ),
        clients (
          id,
          email
        )
      `)
      .eq('designer_id', session.designerId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching project requests:', error)
      return apiResponse.serverError('Failed to fetch project requests')
    }

    // Format the requests for the frontend
    const formattedRequests = (projectRequests || []).map(request => ({
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