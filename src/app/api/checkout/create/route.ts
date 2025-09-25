import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PRODUCTS } from '@/lib/lemonsqueezy/client'
import { AUTH_COOKIES, API_ENDPOINTS } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    logger.info('🛒 Checkout API called')
    const { productKey, matchId } = await request.json()
    logger.info('📦 Request data:', { productKey, matchId })

    if (!productKey || !PRODUCTS[productKey as keyof typeof PRODUCTS]) {
      logger.error('Invalid product key:', productKey)
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      )
    }

    // Get client session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(AUTH_COOKIES.CLIENT)
    logger.info('Session cookie exists:', !!sessionCookie)
    
    if (!sessionCookie) {
      logger.error('No session cookie found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let session
    try {
      session = JSON.parse(sessionCookie.value)
      logger.info('Session parsed:', { email: session.email, clientId: session.clientId })
    } catch (e) {
      logger.error('Failed to parse session:', e)
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { email, clientId } = session
    
    if (!email || !clientId) {
      logger.error('Missing email or clientId in session:', { email: !!email, clientId: !!clientId })
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }

    const product = PRODUCTS[productKey as keyof typeof PRODUCTS]
    logger.info('Product selected:', { productKey, credits: product.credits, variantId: product.variantId })

    // Create checkout URL - simplified format for Lemon Squeezy
    const checkoutData = {
      email: email,
      name: email.split('@')[0] // Use part before @ as name
    }

    // Verify environment variables
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'

    // More detailed environment check
    const apiKey = process.env.LEMONSQUEEZY_API_KEY
    const storeId = process.env.LEMONSQUEEZY_STORE_ID || '148628'

    logger.info('🔍 Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyStart: apiKey?.substring(0, 20) + '...' || 'NOT SET',
      hasStoreId: !!process.env.LEMONSQUEEZY_STORE_ID,
      storeId: storeId,
      baseUrl: baseUrl,
      nodeEnv: process.env.NODE_ENV,
      apiEndpoint: API_ENDPOINTS.LEMONSQUEEZY
    })

    if (!apiKey) {
      logger.error('❌ CRITICAL: Missing LEMONSQUEEZY_API_KEY')
      logger.error('❌ Available LEMON env vars:', Object.keys(process.env).filter(k => k.includes('LEMON')).join(', '))
      logger.error('❌ All env vars count:', Object.keys(process.env).length)
      return NextResponse.json(
        {
          error: 'Payment service not configured',
          details: 'LEMONSQUEEZY_API_KEY environment variable is missing. Please contact support.',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    if (!process.env.LEMONSQUEEZY_STORE_ID) {
      logger.warn('⚠️ Using default LEMONSQUEEZY_STORE_ID:', storeId)
      logger.warn('⚠️ Set LEMONSQUEEZY_STORE_ID environment variable for production')
    }

    if (!product.variantId) {
      logger.error('❌ Missing variantId for product:', productKey)
      return NextResponse.json(
        { error: `Product ${productKey} not properly configured` },
        { status: 500 }
      )
    }

    // Create checkout using correct LemonSqueezy API format
    // Based on our testing: custom_data is not valid in attributes, move it to checkout_data.custom
    const requestBody = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: email,
            name: email.split('@')[0],
            custom: {
              client_id: clientId,
              credits: product.credits.toString(),
              match_id: matchId || 'none',
              product_key: productKey
            }
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true
          },
          product_options: {
            name: product.name,
            description: `Get ${product.credits} designer matches for your projects`,
            media: [],
            redirect_url: `${baseUrl}/payment/success`,
            receipt_thank_you_note: 'Thanks for your purchase! Your credits have been added to your account.'
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId.toString()
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: product.variantId.toString()
            }
          }
        }
      }
    }

    logger.info('🚀 Creating checkout with payload:', JSON.stringify(requestBody, null, 2))

    let response
    try {
      const apiUrl = `${API_ENDPOINTS.LEMONSQUEEZY}/checkouts`
      logger.info('📡 Making request to:', apiUrl)

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify(requestBody)
      })
    } catch (fetchError: any) {
      logger.error('❌ Fetch failed:', fetchError)
      logger.error('❌ Fetch error type:', fetchError?.name)
      logger.error('❌ Fetch error message:', fetchError?.message)
      logger.error('❌ Fetch error cause:', fetchError?.cause)
      throw new Error(`Network error: ${fetchError?.message || 'Failed to connect to LemonSqueezy'}`)
    }

    logger.info('✅ LemonSqueezy response status:', response.status)
    logger.info('✅ Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const error = await response.text()
      logger.error('❌ Lemon Squeezy API Error:')
      logger.error('Status:', response.status)
      logger.error('Response:', error)
      logger.error('Headers:', Object.fromEntries(response.headers.entries()))
      
      // Try to parse JSON error for more details
      try {
        const errorJson = JSON.parse(error)
        logger.error('Parsed error:', JSON.stringify(errorJson, null, 2))
      } catch (e) {
        logger.error('Raw error text:', error)
      }
      
      throw new Error(`LemonSqueezy API failed with status ${response.status}: ${error}`)
    }

    const data = await response.json()

    if (!data.data?.attributes?.url) {
      throw new Error('Failed to create checkout URL')
    }

    return NextResponse.json({
      checkoutUrl: data.data.attributes.url
    })
  } catch (error: any) {
    logger.error('❌ Checkout creation error:', error)
    logger.error('❌ Error type:', typeof error)
    logger.error('❌ Error message:', error?.message)
    logger.error('❌ Error stack:', error?.stack)
    
    // Return specific error based on type
    let errorMessage = 'Failed to create checkout'
    if (error?.message?.includes('Network error')) {
      errorMessage = 'Cannot connect to payment service'
    } else if (error?.message?.includes('LemonSqueezy API failed')) {
      errorMessage = 'Payment service configuration error'
    } else if (error?.message?.includes('not configured')) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error?.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}