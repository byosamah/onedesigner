import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

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
    console.log('🎯 Webhook received at:', new Date().toISOString())
    const body = await request.text()
    const signature = request.headers.get('x-signature') || ''
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    // Verify webhook signature (skip temporarily for testing)
    if (secret && secret !== 'your-webhook-secret-here' && secret !== 'temp-skip-for-now') {
      if (!verifyWebhookSignature(body, signature, secret)) {
        console.error('Webhook signature verification failed')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    } else {
      console.warn('⚠️ Webhook signature verification skipped - configure LEMONSQUEEZY_WEBHOOK_SECRET in production!')
    }

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
        
        console.log('📦 Processing order:', order.id)
        console.log('📝 Custom data from webhook:', customData)
        
        if (!customData?.client_id || !customData?.credits) {
          console.error('❌ Missing custom data in webhook')
          console.error('Meta:', event.meta)
          break
        }

        // Add credits to client
        const credits = parseInt(customData.credits)
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
            console.error('Failed to update client credits:', updateError)
            throw new Error('Failed to update client credits')
          }
          
          console.log(`✅ Credits updated: Client ${client.id} now has ${newCredits} credits (added ${credits})`)
        } else {
          console.error('❌ Client not found with ID:', customData.client_id)
          throw new Error('Client not found')
        }

        // Record payment
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
          console.error('Failed to record payment:', paymentError)
          // Don't throw here - credits were already added
          console.warn('⚠️ Payment recorded to database failed, but credits were added')
        } else {
          console.log(`✅ Payment recorded: Order ${order.id} for ${credits} credits`)
        }

        // If there's a specific match to unlock
        if (customData.match_id && customData.match_id !== 'temp-id' && customData.match_id !== 'none') {
          // Verify the match exists
          const { data: matchExists } = await supabase
            .from('matches')
            .select('id')
            .eq('id', customData.match_id)
            .single()
          
          if (matchExists) {
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
            
            console.log(`✅ Match ${customData.match_id} unlocked`)
          } else {
            console.log(`⚠️ Match ID ${customData.match_id} not found, credits added but no specific match unlocked`)
          }
        }

        console.log(`Order ${order.id} processed: ${credits} credits added to client ${customData.client_id}`)
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
            
            console.log(`✅ Refund processed: Removed ${payment.credits_purchased} credits from client ${client.id}`)
          }
        }
        
        // Update payment status
        await supabase
          .from('payments')
          .update({ status: 'refunded' })
          .eq('order_id', order.id)
        
        console.log(`Order ${order.id} refunded`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}