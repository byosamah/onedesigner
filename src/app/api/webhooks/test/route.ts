import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logger } from '@/lib/core/logging-service'

/**
 * Test endpoint to simulate LemonSqueezy webhook calls
 * Use this to verify webhook processing without making actual payments
 *
 * Example usage:
 * POST /api/webhooks/test
 * {
 *   "client_id": "actual-client-uuid",
 *   "credits": 3,
 *   "match_id": "optional-match-uuid"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.client_id || !body.credits) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id and credits' },
        { status: 400 }
      )
    }

    logger.info('🧪 Test webhook initiated', body)

    // Create a simulated LemonSqueezy webhook payload
    // This matches the exact structure that LemonSqueezy sends
    const simulatedWebhook = {
      meta: {
        event_name: 'order_created',
        webhook_id: `test-${Date.now()}`
      },
      data: {
        id: `test-order-${Date.now()}`,
        attributes: {
          total: body.price || 500, // Default $5.00 in cents
          currency: 'USD',
          user_email: body.email || 'test@example.com',
          // CRITICAL: Custom data is in checkout_data.custom
          checkout_data: {
            email: body.email || 'test@example.com',
            custom: {
              client_id: body.client_id,
              credits: body.credits.toString(),
              match_id: body.match_id || 'none',
              product_key: body.product_key || 'starter'
            }
          },
          first_order_item: {
            product: {
              name: 'Test Package'
            }
          }
        }
      }
    }

    // Calculate webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || 'test-secret'
    const payload = JSON.stringify(simulatedWebhook)
    const hmac = crypto.createHmac('sha256', secret)
    const signature = hmac.update(payload).digest('hex')

    logger.info('📦 Sending test webhook to handler...')

    // Call the actual webhook handler
    const webhookUrl = new URL('/api/webhooks/lemonsqueezy', request.url)
    const webhookResponse = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: payload
    })

    const result = await webhookResponse.json()

    if (!webhookResponse.ok) {
      logger.error('❌ Webhook handler returned error:', result)
      return NextResponse.json(
        {
          error: 'Webhook processing failed',
          details: result,
          payload: simulatedWebhook
        },
        { status: webhookResponse.status }
      )
    }

    logger.info('✅ Test webhook processed successfully')

    return NextResponse.json({
      success: true,
      message: 'Test webhook processed successfully',
      result,
      test_order_id: simulatedWebhook.data.id,
      payload_structure: {
        custom_data_location: 'data.attributes.checkout_data.custom',
        client_id: body.client_id,
        credits_added: body.credits
      }
    })

  } catch (error) {
    logger.error('Test webhook error:', error)
    return NextResponse.json(
      { error: 'Test webhook failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to show test instructions
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/test',
    method: 'POST',
    description: 'Test endpoint to simulate LemonSqueezy webhook calls',
    required_fields: {
      client_id: 'UUID of the client to add credits to',
      credits: 'Number of credits to add (e.g., 3, 10, 25)'
    },
    optional_fields: {
      match_id: 'UUID of a match to auto-unlock',
      email: 'Customer email address',
      price: 'Price in cents (default: 500)',
      product_key: 'Product key: starter, growth, or scale'
    },
    example_request: {
      client_id: '123e4567-e89b-12d3-a456-426614174000',
      credits: 3,
      match_id: '456e7890-e89b-12d3-a456-426614174000',
      email: 'test@company.com'
    },
    notes: [
      'This endpoint simulates the exact webhook structure from LemonSqueezy',
      'Custom data is placed in data.attributes.checkout_data.custom',
      'The webhook signature is automatically calculated',
      'Check server logs for detailed processing information'
    ]
  })
}