import { NextRequest } from 'next/server'
import { createServiceClientWithoutCookies } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const supabase = createServiceClientWithoutCookies()

    // Get the project request with full details
    const { data: projectRequest, error: requestError } = await supabase
      .from('project_requests')
      .select(`
        *,
        matches (
          id,
          score,
          reasons,
          briefs (
            *,
            clients (
              company_name
            )
          )
        ),
        clients (
          id,
          email
        )
      `)
      .eq('id', params.id)
      .eq('designer_id', session.designerId)
      .single()

    if (requestError || !projectRequest) {
      return apiResponse.notFound('Project request not found')
    }

    // Mark as viewed if not already viewed
    if (!projectRequest.viewed_at) {
      const { error: updateError } = await supabase
        .from('project_requests')
        .update({
          viewed_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('designer_id', session.designerId)

      if (updateError) {
        logger.error('Failed to mark request as viewed:', updateError)
        // Continue anyway - not critical
      }
    }

    // Calculate time remaining until deadline
    const now = new Date()
    const deadline = new Date(projectRequest.response_deadline)
    const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))

    // Prepare the response with brief snapshot or fallback to original brief
    const briefData = projectRequest.brief_snapshot || projectRequest.matches?.briefs || projectRequest.brief_details

    return apiResponse.success({
      request: {
        id: projectRequest.id,
        status: projectRequest.status,
        message: projectRequest.message,
        created_at: projectRequest.created_at,
        viewed_at: projectRequest.viewed_at || new Date().toISOString(),
        response_deadline: projectRequest.response_deadline,
        hours_remaining: hoursRemaining,
        is_expired: hoursRemaining === 0
      },
      brief: briefData,
      match: {
        score: projectRequest.matches?.score,
        reasons: projectRequest.matches?.reasons
      },
      client: {
        email: projectRequest.status === 'approved' ? projectRequest.clients?.email : null,
        company_name: briefData?.company_name || projectRequest.matches?.briefs?.clients?.company_name
      }
    })

  } catch (error) {
    return handleApiError(error, 'designer/project-requests/view')
  }
}

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

    const supabase = createServiceClientWithoutCookies()

    // Mark as viewed
    const { error: updateError } = await supabase
      .from('project_requests')
      .update({
        viewed_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('designer_id', session.designerId)
      .eq('status', 'pending') // Only update if still pending

    if (updateError) {
      logger.error('Failed to mark request as viewed:', updateError)
      return apiResponse.serverError('Failed to update view status')
    }

    logger.info('✅ Project request marked as viewed:', {
      requestId: params.id,
      designerId: session.designerId
    })

    return apiResponse.success({
      message: 'Request marked as viewed',
      viewed_at: new Date().toISOString()
    })

  } catch (error) {
    return handleApiError(error, 'designer/project-requests/view')
  }
}