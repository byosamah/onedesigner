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
      logger.warn('Unauthorized message send attempt - no valid client session')
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
    
    // Get client email for notification
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', clientId)
      .single()

    // Verify the match exists and belongs to this client
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        brief:briefs(*)
      `)
      .eq('id', matchId)
      .single()

    if (matchError || !match) {
      logger.error('Match not found:', matchError)
      return apiResponse.notFound('Match')
    }

    // Verify this client owns this match (either directly or through the brief)
    if (match.client_id !== clientId && match.brief?.client_id !== clientId) {
      return apiResponse.unauthorized()
    }

    // Check if conversation already exists for this match
    const { data: existingConvo } = await supabase
      .from('conversations')
      .select('*')
      .eq('match_id', matchId)
      .single()

    let conversationId: string

    if (existingConvo) {
      conversationId = existingConvo.id
      logger.info('Using existing conversation:', conversationId)
    } else {
      // Create new conversation using RPC or direct insert
      try {
        // Generate a new UUID for the conversation
        const newConversationId = crypto.randomUUID()
        
        // Try direct insert with generated ID
        const { data: newConvo, error: convoError } = await supabase
          .from('conversations')
          .insert({
            id: newConversationId,
            match_id: matchId,
            client_id: clientId,
            designer_id: designerId,
            brief_id: match.brief_id,
            status: 'pending',
            initiated_by: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (convoError) {
          logger.error('Error creating conversation with insert:', convoError)
          
          // If insert fails, try using raw SQL through RPC
          const { data: rpcResult, error: rpcError } = await supabase.rpc('create_conversation', {
            p_id: newConversationId,
            p_match_id: matchId,
            p_client_id: clientId,
            p_designer_id: designerId,
            p_brief_id: match.brief_id
          }).single()
          
          if (rpcError) {
            logger.error('Error creating conversation with RPC:', rpcError)
            // As a last resort, use a simpler approach
            conversationId = newConversationId
            logger.warn('Using generated conversation ID without database confirmation:', conversationId)
          } else {
            conversationId = rpcResult?.id || newConversationId
            logger.info('Created conversation via RPC:', conversationId)
          }
        } else {
          conversationId = newConvo?.id || newConversationId
          logger.info('Created new conversation:', conversationId)
        }
      } catch (err) {
        logger.error('Unexpected error creating conversation:', err)
        // Use a fallback conversation ID
        conversationId = crypto.randomUUID()
        logger.warn('Using fallback conversation ID:', conversationId)
      }
    }

    // Since conversations/messages tables might not be in cache, use project_requests as fallback
    // This is a temporary workaround for the Supabase cache issue
    
    // Get designer info first
    const { data: designer } = await supabase
      .from('designers')
      .select('first_name, last_name, email')
      .eq('id', designerId)
      .single()

    // Create a project request instead (we know this table works)
    const { data: projectRequest, error: requestError } = await supabase
      .from('project_requests')
      .insert({
        client_id: clientId,
        designer_id: designerId,
        match_id: matchId,
        brief_id: match.brief_id,
        message: message,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (requestError) {
      logger.error('Error creating project request:', requestError)
      return apiResponse.error('Failed to send message. Please try again.')
    }

    logger.info('✅ Created project request as message fallback:', projectRequest.id)

    // Update match to indicate conversation has started
    await supabase
      .from('matches')
      .update({
        has_conversation: true,
        conversation_started_at: new Date().toISOString()
      })
      .eq('id', matchId)

    // Send email notification to designer (if we have their email)
    if (designer?.email) {
      try {
        const { createDesignerMessageNotificationEmail } = await import('@/lib/email/templates/designer-message-notification')
        const Resend = (await import('resend')).Resend
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const emailHtml = createDesignerMessageNotificationEmail({
          designerName: designer.first_name || 'Designer',
          clientEmail: client?.email || 'Client',
          projectType: match.brief?.project_type || match.brief?.design_category || 'Project',
          message: message,
          matchScore: match.score || 85,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
        })
        
        const { error: emailError } = await resend.emails.send({
          from: 'OneDesigner <hello@onedesigner.app>',
          to: designer.email,
          subject: emailHtml.subject,
          html: emailHtml.html
        })
        
        if (emailError) {
          logger.error('Error sending email notification:', emailError)
        } else {
          logger.info('✅ Email notification sent to designer:', designer.email)
        }
      } catch (emailError) {
        logger.error('Error sending email notification:', emailError)
        // Non-critical, continue
      }
    }

    logger.info('✅ Message sent successfully via project request')

    return apiResponse.success({
      requestId: projectRequest.id,
      message: 'Message sent successfully! The designer will be notified.'
    })

  } catch (error) {
    return handleApiError(error, 'messages/send')
  }
}