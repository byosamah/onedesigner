import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/core/logging-service'
import { BusinessRules } from '@/lib/core/business-rules'
import { DataService } from '@/lib/core/data-service'
import { ConfigManager } from '@/lib/core/config-manager'
import { DISCOUNT_CODES, PRICING_PACKAGES } from '@/lib/constants'
import { validateClientSession } from '@/lib/auth/session-handlers'

/**
 * Add free credits to client account using discount codes (like OSAMA for testing)
 * This bypasses LemonSqueezy payment processing entirely for 100% discount codes
 */
export async function POST(req: NextRequest) {
  const correlationId = crypto.randomUUID()
  logger.info('🎉 Free credits API called', { correlationId })

  try {
    const { packageId, discountCode } = await req.json()
    logger.info('📋 Request data:', { packageId, discountCode, correlationId })

    // Validate required fields
    if (!packageId || !discountCode) {
      logger.warn('❌ Missing required fields', { packageId, discountCode, correlationId })
      return NextResponse.json(
        { error: 'Package ID and discount code are required' },
        { status: 400 }
      )
    }

    // Validate client session
    let sessionResult
    try {
      sessionResult = await validateClientSession(req)
    } catch (error) {
      logger.warn('🔐 Session validation error:', { error: error.message, correlationId })
      return NextResponse.json(
        { error: 'Please sign in to add credits' },
        { status: 401 }
      )
    }

    if (!sessionResult.valid || !sessionResult.clientId) {
      logger.warn('🔐 Invalid or missing client session', { sessionResult, correlationId })
      return NextResponse.json(
        { error: 'Please sign in to add credits' },
        { status: 401 }
      )
    }

    const clientId = sessionResult.clientId
    logger.info('✅ Client authenticated:', { clientId, correlationId })

    // Validate discount code
    const discount = Object.values(DISCOUNT_CODES).find(
      d => d.code === discountCode.toUpperCase() && d.active
    )

    if (!discount) {
      logger.warn('❌ Invalid discount code:', { discountCode, correlationId })
      return NextResponse.json(
        { error: 'Invalid or expired discount code' },
        { status: 400 }
      )
    }

    // Only allow 100% discount codes for free credits
    if (discount.discount !== 100 || !discount.isTestingCode) {
      logger.warn('❌ Discount code not eligible for free credits:', {
        discountCode,
        discount: discount.discount,
        isTestingCode: discount.isTestingCode,
        correlationId
      })
      return NextResponse.json(
        { error: 'This discount code is not eligible for free credits' },
        { status: 400 }
      )
    }

    // Validate package
    const packageData = PRICING_PACKAGES.find(pkg => pkg.id === packageId)
    if (!packageData) {
      logger.warn('❌ Invalid package ID:', { packageId, correlationId })
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      )
    }

    logger.info('📦 Package validated:', {
      packageId: packageData.id,
      credits: packageData.credits,
      correlationId
    })

    // Use DataService to add credits to client account
    const dataService = DataService.getInstance()

    // Get current client data
    const currentClient = await dataService.getClientById(clientId)
    if (!currentClient) {
      logger.error('❌ Client not found:', { clientId, correlationId })
      return NextResponse.json(
        { error: 'Client account not found' },
        { status: 404 }
      )
    }

    const currentCredits = currentClient.match_credits || 0
    const newCredits = currentCredits + packageData.credits

    // Update client credits
    await dataService.updateClient(clientId, {
      match_credits: newCredits
    })

    logger.info('✅ Credits added successfully:', {
      clientId,
      packageId,
      discountCode,
      creditsAdded: packageData.credits,
      previousCredits: currentCredits,
      newCredits,
      correlationId
    })

    // Log this transaction for audit purposes
    logger.info('🎯 Free credits transaction completed', {
      type: 'free_credits',
      clientId,
      packageId,
      discountCode,
      creditsAdded: packageData.credits,
      totalCredits: newCredits,
      timestamp: new Date().toISOString(),
      correlationId
    })

    return NextResponse.json({
      success: true,
      message: 'Free credits added successfully!',
      data: {
        creditsAdded: packageData.credits,
        totalCredits: newCredits,
        discountCode,
        packageName: packageData.name
      }
    })

  } catch (error) {
    logger.error('❌ Free credits API error:', {
      error: error.message,
      stack: error.stack,
      correlationId
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}