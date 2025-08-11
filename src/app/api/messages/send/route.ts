import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

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
      // Create new conversation
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({
          match_id: matchId,
          client_id: clientId,
          designer_id: designerId,
          brief_id: match.brief_id,
          status: 'pending',
          initiated_by: 'client'
        })
        .select()
        .single()

      if (convoError || !newConvo) {
        logger.error('Error creating conversation:', convoError)
        return apiResponse.error('Failed to create conversation')
      }

      conversationId = newConvo.id
      logger.info('Created new conversation:', conversationId)
    }

    // Create the message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: clientId,
        sender_type: 'client',
        content: message
      })
      .select()
      .single()

    if (messageError || !newMessage) {
      logger.error('Error creating message:', messageError)
      return apiResponse.error('Failed to send message')
    }

    // Create match request if this is the first message
    if (!existingConvo) {
      // Get brief details for the match request
      const briefSummary = {
        project_type: match.brief?.project_type || match.brief?.design_category,
        industry: match.brief?.industry,
        budget: match.brief?.budget || match.brief?.budget_range,
        timeline: match.brief?.timeline || match.brief?.timeline_type,
        description: match.brief?.description || match.brief?.project_description
      }

      const { error: requestError } = await supabase
        .from('match_requests')
        .insert({
          match_id: matchId,
          conversation_id: conversationId,
          client_id: clientId,
          designer_id: designerId,
          initial_message: message,
          project_details: briefSummary,
          status: 'pending'
        })

      if (requestError) {
        logger.error('Error creating match request:', requestError)
        // Non-critical, continue
      }

      // Update match to indicate conversation has started
      await supabase
        .from('matches')
        .update({
          has_conversation: true,
          conversation_started_at: new Date().toISOString()
        })
        .eq('id', matchId)
    }

    // Get designer info for email notification
    const { data: designer } = await supabase
      .from('designers')
      .select('first_name, last_name, email')
      .eq('id', designerId)
      .single()

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

    logger.info('✅ Message sent successfully')

    return apiResponse.success({
      conversationId,
      messageId: newMessage.id,
      message: 'Message sent successfully'
    })

  } catch (error) {
    return handleApiError(error, 'messages/send')
  }
}