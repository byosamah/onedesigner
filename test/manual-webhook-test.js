#!/usr/bin/env node

// Manual webhook test - simulate LemonSqueezy webhook call
async function testWebhook() {
  const testPayload = {
    meta: {
      event_name: 'order_created'
    },
    data: {
      id: 'test-order-' + Date.now(),
      attributes: {
        total: 500, // $5.00
        currency: 'USD',
        checkout_data: {
          custom: {
            client_id: 'your-test-client-id', // Replace with actual client ID
            credits: '3',
            match_id: '', // Optional
            product_key: 'STARTER_PACK'
          }
        },
        first_order_item: {
          product: {
            name: '3 Designer Matches'
          }
        }
      }
    }
  }

  try {
    const response = await fetch('https://566226795fdc.ngrok-free.app/api/webhooks/lemonsqueezy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'skip-verification' // Will be skipped if no webhook secret
      },
      body: JSON.stringify(testPayload)
    })

    const result = await response.json()
    console.log('Webhook Response:', result)
    console.log('Status:', response.status)
  } catch (error) {
    console.error('Webhook Test Error:', error)
  }
}

console.log('Testing webhook manually...')
testWebhook()