import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate client session
    const sessionResult = await validateSession('CLIENT')
    if (!sessionResult.success || !sessionResult.clientId) {
      return apiResponse.unauthorized()
    }

    const conversationId = params.id
    const clientId = sessionResult.clientId
    const supabase = createServiceClient()

    // Get conversation with messages
    const { data: conversation, error: convError } = await supabase
      .from('project_requests')
      .select(`
        *,
        designer:designers(
          id,
          first_name,
          last_name,
          title,
          avatar_url,
          email
        ),
        messages(
          id,
          content,
          sender_type,
          sender_id,
          created_at,
          is_read
        )
      `)
      .eq('id', conversationId)
      .eq('client_id', clientId)
      .single()

    if (convError || !conversation) {
      logger.error('Conversation not found:', convError)
      return apiResponse.notFound('Conversation')
    }

    // Mark messages as read
    await supabase
      .from('project_requests')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'designer')
      .eq('is_read', false)

    // Reset unread count for client
    await supabase
      .from('project_requests')
      .update({ client_unread_count: 0 })
      .eq('id', conversationId)

    // Sort messages by created_at
    conversation.messages.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    return apiResponse.success(conversation)

  } catch (error) {
    return handleApiError(error, 'conversations/get')
  }
}