import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@/lib/lemonsqueezy/checkout'
import { ProductKey } from '@/lib/lemonsqueezy/client'

export async function POST(request: NextRequest) {
  try {
    const { productKey, email, clientId, matchId } = await request.json()

    if (!productKey || !email || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate product key
    if (!['STARTER_PACK', 'GROWTH_PACK', 'SCALE_PACK'].includes(productKey)) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      )
    }

    // Create checkout URL
    const checkoutUrl = await createCheckout({
      productKey: productKey as ProductKey,
      email,
      clientId,
      matchId,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/payment/success`
    })

    return NextResponse.json({ 
      success: true, 
      checkoutUrl 
    })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    )
  }
}