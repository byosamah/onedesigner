import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate client session
    const sessionResult = await validateSession('CLIENT')
    if (!sessionResult.success || !sessionResult.clientId) {
      return apiResponse.unauthorized()
    }

    const { content } = await request.json()
    
    if (!content || content.trim().length < 1) {
      return apiResponse.error('Message content is required')
    }

    if (content.length > 5000) {
      return apiResponse.error('Message must be less than 5000 characters')
    }

    const conversationId = params.id
    const clientId = sessionResult.clientId
    const supabase = createServiceClient()

    // Verify conversation belongs to this client
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, designer_id, status')
      .eq('id', conversationId)
      .eq('client_id', clientId)
      .single()

    if (convError || !conversation) {
      console.error('Conversation not found:', convError)
      return apiResponse.notFound('Conversation')
    }

    // Create the message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: clientId,
        sender_type: 'client',
        content: content.trim()
      })
      .select()
      .single()

    if (messageError || !newMessage) {
      console.error('Error creating message:', messageError)
      return apiResponse.error('Failed to send message')
    }

    // If conversation was pending, update status to active
    if (conversation.status === 'pending') {
      await supabase
        .from('conversations')
        .update({ status: 'active' })
        .eq('id', conversationId)
    }

    console.log('✅ Message sent successfully')

    return apiResponse.success(newMessage)

  } catch (error) {
    return handleApiError(error, 'conversations/messages/send')
  }
}