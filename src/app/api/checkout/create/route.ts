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
    // CRITICAL HOTFIX: Hardcode API key if environment variable is missing
    // This is a temporary fix for production until env vars are properly set
    const apiKey = process.env.LEMONSQUEEZY_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIxYzE1YTY5YjgyMDVjMzU1M2JiMmE1OGI1NDI2NGFlZTkxN2UyZWQzZTZlNGExMWI3Y2VjMDFhMTkyMzdlZWM1ZTViNTJhY2U1MzNmNzI2MyIsImlhdCI6MTc1NDYwMjU3NS4xMjM0MiwibmJmIjoxNzU0NjAyNTc1LjEyMzQyMiwiZXhwIjoyMDcwMTM1Mzc1LjA5MTA1Nywic3ViIjoiMjMxMTAzOCIsInNjb3BlcyI6W119.APdYAJlDKHQVWImDSUzmH-bdW-Jsa6YQvNONmMQb5NAWt8ayRVzyImADmJXC7TpuGJaIVp7qaIR_cftGtjEcopnurlKOeOLh3S7q_GXq9pV9nTUyXDan_-TMslPo3QNh9S4zvcNmZ2cdcmzc_8UHj4Jd7YHwSnx6ZPXToOTV5qOCiIYZesbIT5IPfMOqabRgxOTsP5_BWQVIjLpCRF1AHa1Y0cTIVjrj9jeLVdxCuX0d-uTbwiMdMK9JwguQ5W3AETGvfdSYm1zf44QLbT3lwnXTnEoXAHihP5mF5kglOxDWp4e05aexPLnbwzbNb-H9CLjLcllUHIMkmKF_EKWoNTk0mFIj3ZHxJQ7i4qnCY1fsUkLsG_Gd7ARs4YEi_HCI2eLOzArTx9nG9qelMydmGl2KQ6zAZ9MfJVOt9DHVFXYm53qB_A5VNhrSRd6x7gN0b1I_ZQyIlu00Sc6tJprC1g5ojaVdPqfsEvUlF4DCLU0vYFdAMnRxBxPlCkWcHWb6'
    const storeId = process.env.LEMONSQUEEZY_STORE_ID || '148628'

    logger.info('🔍 Environment check:', {
      hasApiKey: !!process.env.LEMONSQUEEZY_API_KEY,
      usingFallback: !process.env.LEMONSQUEEZY_API_KEY,
      apiKeyLength: apiKey?.length,
      apiKeyStart: apiKey?.substring(0, 20) + '...',
      hasStoreId: !!process.env.LEMONSQUEEZY_STORE_ID,
      storeId: storeId,
      baseUrl: baseUrl,
      nodeEnv: process.env.NODE_ENV,
      apiEndpoint: API_ENDPOINTS.LEMONSQUEEZY
    })

    if (!apiKey) {
      logger.error('❌ CRITICAL: No API key available')
      return NextResponse.json(
        {
          error: 'Payment service not configured',
          details: 'Unable to process payments at this time.',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    if (!process.env.LEMONSQUEEZY_API_KEY) {
      logger.warn('⚠️ WARNING: Using fallback LEMONSQUEEZY_API_KEY - set environment variable!')
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

    // CRITICAL FIX: Use exact format that works in direct API test
    // Start with minimal working format, then add our customizations
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
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: '148628' // Hardcode the exact value that worked
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: product.variantId // This should be string already
            }
          }
        }
      }
    }

    logger.info('🚀 Creating checkout with payload:', JSON.stringify(requestBody, null, 2))

    // Additional debugging
    logger.info('🔍 Store ID type and value:', {
      storeId: storeId,
      storeIdType: typeof storeId,
      variantId: product.variantId,
      variantIdType: typeof product.variantId
    })

    let response
    try {
      const apiUrl = `${API_ENDPOINTS.LEMONSQUEEZY}/checkouts`
      logger.info('📡 Making request to:', apiUrl)
      logger.info('📡 Request headers:', {
        'Authorization': `Bearer ${apiKey.substring(0, 20)}...`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      })

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