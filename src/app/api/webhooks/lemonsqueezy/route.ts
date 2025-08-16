import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

// Webhook event types we care about (one-time payments only)
const RELEVANT_EVENTS = [
  'order_created',
  'order_refunded'
]

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

export async function POST(request: NextRequest) {
  try {
    logger.info('🎯 Webhook received at:', new Date().toISOString())
    const body = await request.text()
    const signature = request.headers.get('x-signature') || ''
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    // Verify webhook signature - MANDATORY for security
    if (!secret) {
      logger.error('🚨 SECURITY ALERT: LEMONSQUEEZY_WEBHOOK_SECRET not configured!')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    if (!verifyWebhookSignature(body, signature, secret)) {
      logger.error('🚨 SECURITY ALERT: Webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    logger.info('✅ Webhook signature verified')

    const event = JSON.parse(body)
    const eventType = event.meta.event_name

    if (!RELEVANT_EVENTS.includes(eventType)) {
      return NextResponse.json({ received: true })
    }

    const supabase = createServiceClient()

    switch (eventType) {
      case 'order_created': {
        const order = event.data
        // Custom data is in meta.custom_data for webhooks
        const customData = event.meta?.custom_data
        
        logger.info('📦 Processing order:', order.id)
        logger.info('📝 Custom data from webhook:', customData)
        
        if (!customData?.client_id || !customData?.credits) {
          logger.error('❌ Missing custom data in webhook')
          logger.error('Meta:', event.meta)
          break
        }

        // IMPORTANT: Check if this order has already been processed to prevent duplicate credits
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('order_id', order.id)
          .single()
        
        if (existingPayment) {
          logger.info(`⚠️ Order ${order.id} already processed - skipping to prevent duplicate credits`)
          return NextResponse.json({ received: true, status: 'already_processed' })
        }

        const credits = parseInt(customData.credits)
        
        // Record payment FIRST - this will fail if order_id already exists (UNIQUE constraint)
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            client_id: customData.client_id,
            order_id: order.id,
            amount: order.attributes.total,
            currency: order.attributes.currency,
            status: 'completed',
            product_name: order.attributes.first_order_item?.product?.name || 'Unknown Product',
            credits_purchased: credits,
            lemonsqueezy_data: order
          })
        
        if (paymentError) {
          // If it's a duplicate key error, the order was already processed
          if (paymentError.code === '23505' || paymentError.message?.includes('duplicate')) {
            logger.info(`⚠️ Order ${order.id} already exists in payments table - skipping`)
            return NextResponse.json({ received: true, status: 'already_processed' })
          }
          logger.error('Failed to record payment:', paymentError)
          throw new Error('Failed to record payment')
        }
        
        logger.info(`✅ Payment recorded: Order ${order.id} for ${credits} credits`)

        // Now add credits to client (only happens if payment record was successful)
        const { data: client } = await supabase
          .from('clients')
          .select('id, match_credits')
          .eq('id', customData.client_id)
          .single()

        if (client) {
          const newCredits = (client.match_credits || 0) + credits
          const { error: updateError } = await supabase
            .from('clients')
            .update({ 
              match_credits: newCredits
            })
            .eq('id', client.id)
          
          if (updateError) {
            logger.error('Failed to update client credits:', updateError)
            // Rollback the payment record since credits couldn't be added
            await supabase
              .from('payments')
              .delete()
              .eq('order_id', order.id)
            throw new Error('Failed to update client credits')
          }
          
          logger.info(`✅ Credits updated: Client ${client.id} now has ${newCredits} credits (added ${credits})`)
        } else {
          logger.error('❌ Client not found with ID:', customData.client_id)
          // Rollback the payment record since client doesn't exist
          await supabase
            .from('payments')
            .delete()
            .eq('order_id', order.id)
          throw new Error('Client not found')
        }

        // If there's a specific match to unlock
        if (customData.match_id && customData.match_id !== 'temp-id' && customData.match_id !== 'none') {
          // Verify the match exists and get designer info
          const { data: matchData } = await supabase
            .from('matches')
            .select('id, designer_id')
            .eq('id', customData.match_id)
            .single()
          
          if (matchData) {
            // Deduct 1 credit for auto-unlock since match is included in purchase
            const autoUnlockCredits = Math.max(0, newCredits - 1)
            const { error: creditDeductError } = await supabase
              .from('clients')
              .update({ match_credits: autoUnlockCredits })
              .eq('id', customData.client_id)
            
            if (creditDeductError) {
              logger.error('Failed to deduct credit for auto-unlock:', creditDeductError)
            } else {
              logger.info(`✅ Deducted 1 credit for auto-unlock: Client now has ${autoUnlockCredits} credits`)
            }

            await supabase
              .from('match_unlocks')
              .insert({
                match_id: customData.match_id,
                client_id: customData.client_id,
                payment_id: order.id,
                amount: order.attributes.total
              })

            await supabase
              .from('matches')
              .update({ status: 'unlocked' })
              .eq('id', customData.match_id)
            
            logger.info(`✅ Match ${customData.match_id} unlocked`)
            
            // Track this designer as unlocked by this client to prevent future matches
            // First check if the record already exists
            const { data: existingRecord } = await supabase
              .from('client_designers')
              .select('id')
              .eq('client_id', customData.client_id)
              .eq('designer_id', matchData.designer_id)
              .single()
            
            if (!existingRecord) {
              // Only insert if it doesn't exist
              const { error: clientDesignerError } = await supabase
                .from('client_designers')
                .insert({
                  client_id: customData.client_id,
                  designer_id: matchData.designer_id,
                  unlocked_at: new Date().toISOString()
                })
              
              if (clientDesignerError) {
                logger.error('Error tracking unlocked designer:', clientDesignerError)
              } else {
                logger.info('✅ Tracked designer as unlocked for client')
              }
            }
          } else {
            logger.info(`⚠️ Match ID ${customData.match_id} not found, credits added but no specific match unlocked`)
          }
        }

        logger.info(`Order ${order.id} processed: ${credits} credits added to client ${customData.client_id}`)
        break
      }

      case 'order_refunded': {
        const order = event.data
        
        // Get the payment record to find credits to remove
        const { data: payment } = await supabase
          .from('payments')
          .select('client_id, credits_purchased')
          .eq('order_id', order.id)
          .single()
        
        if (payment) {
          // Remove credits from client
          const { data: client } = await supabase
            .from('clients')
            .select('id, match_credits')
            .eq('id', payment.client_id)
            .single()
          
          if (client) {
            const newCredits = Math.max(0, (client.match_credits || 0) - (payment.credits_purchased || 0))
            await supabase
              .from('clients')
              .update({ match_credits: newCredits })
              .eq('id', client.id)
            
            logger.info(`✅ Refund processed: Removed ${payment.credits_purchased} credits from client ${client.id}`)
          }
        }
        
        // Update payment status
        await supabase
          .from('payments')
          .update({ status: 'refunded' })
          .eq('order_id', order.id)
        
        logger.info(`Order ${order.id} refunded`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}