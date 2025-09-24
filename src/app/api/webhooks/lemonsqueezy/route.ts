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

        // CRITICAL FIX: Custom data is in checkout_data.custom, not meta.custom_data
        // Try multiple locations for backward compatibility
        const customData =
          order.attributes?.checkout_data?.custom || // Primary location
          event.meta?.custom_data || // Legacy location
          order.attributes?.custom // Alternative location

        // Enhanced debugging
        logger.info('📦 Processing order:', order.id)
        logger.info('🔍 Full order attributes:', JSON.stringify(order.attributes, null, 2))
        logger.info('📝 Extracted custom data:', JSON.stringify(customData, null, 2))
        logger.info('📧 Customer email:', order.attributes?.user_email)

        if (!customData?.client_id || !customData?.credits) {
          logger.error('❌ Missing custom data in webhook')
          logger.error('Order attributes:', JSON.stringify(order.attributes, null, 2))
          logger.error('Event meta:', JSON.stringify(event.meta, null, 2))
          logger.error('Looking for client_id and credits in custom data')
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
        logger.info(`💰 Parsed credits to add: ${credits}`)

        // Record payment FIRST - this will fail if order_id already exists (UNIQUE constraint)
        logger.info('📝 Recording payment to database...')
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

        // Now add credits using CENTRALIZED DataService method
        logger.info('💳 Adding credits to client account...')
        logger.info(`Client ID: ${customData.client_id}, Credits to add: ${credits}`)

        try {
          // Import DataService singleton
          const { DataService } = await import('@/lib/services/data-service')
          const dataService = DataService.getInstance()

          // Get current credits before adding
          const { data: clientBefore } = await supabase
            .from('clients')
            .select('match_credits')
            .eq('id', customData.client_id)
            .single()

          logger.info(`Current credits before addition: ${clientBefore?.match_credits || 0}`)

          // Add credits using centralized method
          await dataService.addCredits(customData.client_id, credits)

          // Verify credits were added
          const { data: clientAfter } = await supabase
            .from('clients')
            .select('match_credits')
            .eq('id', customData.client_id)
            .single()

          logger.info(`✅ Credits after addition: ${clientAfter?.match_credits || 0}`)
          logger.info(`🎉 Successfully added ${credits} credits to client ${customData.client_id}`)

        } catch (creditError) {
          logger.error('Failed to add credits:', creditError)
          // Rollback the payment record since credits couldn't be added
          await supabase
            .from('payments')
            .delete()
            .eq('order_id', order.id)
          throw new Error('Failed to add credits to client')
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
            // Deduct 1 credit for auto-unlock using CENTRALIZED method
            try {
              const { DataService } = await import('@/lib/services/data-service')
              const dataService = DataService.getInstance()
              await dataService.deductCredits(customData.client_id, 1)
              logger.info(`✅ Deducted 1 credit for auto-unlock using centralized method`)
            } catch (deductError) {
              logger.error('Failed to deduct credit for auto-unlock:', deductError)
              // Non-critical error, continue
            }

            await supabase
              .from('client_designers')
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
        
        if (payment && payment.credits_purchased) {
          // Remove credits using CENTRALIZED DataService method
          try {
            const { DataService } = await import('@/lib/services/data-service')
            const dataService = DataService.getInstance()
            await dataService.deductCredits(payment.client_id, payment.credits_purchased)
            logger.info(`✅ Refund processed: Removed ${payment.credits_purchased} credits using centralized method`)
          } catch (deductError) {
            logger.error('Failed to remove credits for refund:', deductError)
            // If insufficient credits, just log it - don't fail the refund processing
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