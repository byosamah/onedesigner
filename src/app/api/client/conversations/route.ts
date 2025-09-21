import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    // Validate client session
    const sessionResult = await validateSession('CLIENT')
    if (!sessionResult.success || !sessionResult.clientId) {
      return apiResponse.unauthorized()
    }

    const clientId = sessionResult.clientId
    const supabase = createServiceClient()

    // First check if conversations table exists
    const { data: testConversations, error: testError } = await supabase
      .from('project_requests')
      .select('*')
      .limit(1)

    // If table doesn't exist, return empty array
    if (testError && testError.message.includes('does not exist')) {
      logger.info('Conversations table does not exist yet')
      return apiResponse.success([])
    }

    // Get all conversations for this client
    const { data: conversations, error: convError } = await supabase
      .from('project_requests')
      .select(`
        *,
        designer:designers(
          id,
          first_name,
          last_name,
          title,
          avatar_url
        ),
        match:matches(
          score
        )
      `)
      .eq('client_id', clientId)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (convError) {
      logger.error('Error fetching conversations:', convError)
      // If error is because table doesn't exist, return empty array
      if (convError.message.includes('does not exist')) {
        return apiResponse.success([])
      }
      return apiResponse.error('Failed to fetch conversations')
    }

    // Format the conversations for the frontend
    const formattedConversations = (conversations || []).map(conv => ({
      id: conv.id,
      match_id: conv.match_id,
      status: conv.status,
      last_message_at: conv.last_message_at,
      last_message_preview: conv.last_message_preview,
      unread_count: conv.client_unread_count || 0,
      designer: conv.designer,
      match_score: conv.match?.score || 85
    }))

    return apiResponse.success(formattedConversations)

  } catch (error) {
    return handleApiError(error, 'client/conversations')
  }
}