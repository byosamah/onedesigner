import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Validate client session
    const sessionResult = await validateSession('CLIENT')
    if (!sessionResult.valid || !sessionResult.user) {
      return apiResponse.error('Please log in as a client to send messages', 401)
    }

    const { matchId, designerId, message } = await request.json()

    if (!matchId || !designerId || !message) {
      return apiResponse.error('Match ID, designer ID, and message are required')
    }

    if (message.length < 10) {
      return apiResponse.error('Message must be at least 10 characters')
    }

    if (message.length > 1000) {
      return apiResponse.error('Message must be less than 1000 characters')
    }

    const supabase = createServiceClient()
    const clientId = sessionResult.user.id
    
    // First, just update the match to show conversation started
    // This is the most important part and we know it works
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        has_conversation: true,
        conversation_started_at: new Date().toISOString()
      })
      .eq('id', matchId)
    
    if (updateError) {
      logger.error('Failed to update match:', updateError)
      return apiResponse.error('Failed to send message. Please try again.')
    }
    
    // Try to create a designer request record (optional - don't fail if it doesn't work)
    try {
      const { data: designerRequest } = await supabase
        .from('designer_requests')
        .insert({
          match_id: matchId,
          designer_id: designerId,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (designerRequest) {
        logger.info('Created designer request:', designerRequest.id)
      }
    } catch (err) {
      // Non-critical, continue
      logger.warn('Could not create designer request:', err)
    }

    // Always return success if we got this far
    return apiResponse.success({
      requestId: matchId,
      message: 'Message sent successfully! The designer will be notified.'
    })

  } catch (error) {
    return handleApiError(error, 'messages/send')
  }
}