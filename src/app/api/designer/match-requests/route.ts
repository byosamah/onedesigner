import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'

export async function GET(request: NextRequest) {
  try {
    // Validate designer session
    const sessionResult = await validateSession('DESIGNER')
    if (!sessionResult.success || !sessionResult.designerId) {
      return apiResponse.unauthorized()
    }

    const designerId = sessionResult.designerId
    const supabase = createServiceClient()

    // Get designer requests (matches where designer is matched)
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        brief:briefs(
          *,
          client:clients(*)
        )
      `)
      .eq('designer_id', designerId)
      .order('created_at', { ascending: false })

    if (matchError) {
      console.error('Error fetching matches:', matchError)
      return apiResponse.error('Failed to fetch match requests')
    }

    // Transform matches into request format
    const requests = matches?.map(match => ({
      id: match.id,
      match_id: match.id,
      designer_id: match.designer_id,
      initial_message: `Hi! I noticed your portfolio and think you'd be perfect for my ${match.brief?.project_type || 'project'}. Would love to discuss this opportunity with you.`,
      status: match.status === 'unlocked' ? 'pending' : match.status,
      created_at: match.created_at,
      expires_at: new Date(new Date(match.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      client_email: match.brief?.client?.email || 'Client',
      client_id: match.brief?.client_id,
      project_type: match.brief?.project_type || match.brief?.design_category,
      industry: match.brief?.industry,
      budget: match.brief?.budget || match.brief?.budget_range,
      timeline: match.brief?.timeline || match.brief?.timeline_type,
      project_description: match.brief?.description || match.brief?.project_description,
      match_score: match.score,
      conversation_id: null,
      unread_count: match.status === 'unlocked' ? 1 : 0
    })) || []

    return apiResponse.success(requests)

  } catch (error) {
    return handleApiError(error, 'designer/match-requests')
  }
}