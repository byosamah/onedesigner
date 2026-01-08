import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api/responses'
import { Features } from '@/lib/features'
import { getBusinessRules } from '@/lib/core/business-rules'
import { getPricingPackages, calculatePackagePricing, getCreditRecommendations } from '@/lib/pricing'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    if (!Features.USE_BUSINESS_RULES) {
      return apiResponse.success({
        message: 'BusinessRules not enabled',
        featureEnabled: false,
        legacyMode: true
      })
    }

    logger.info('✨ Testing BusinessRules functionality')
    
    const businessRules = getBusinessRules()
    
    // Test basic business rules
    const creditPackages = businessRules.getCreditPackages()
    const matchingCriteria = businessRules.getMatchingCriteria()
    const businessRuleSummary = businessRules.getBusinessRuleSummary()
    
    // Test validation functions
    const creditValidation = businessRules.validateCreditDeduction(5, 1)
    const insufficientCreditValidation = businessRules.validateCreditDeduction(0, 1)
    const scoreValidation = businessRules.validateMatchScore(75)
    const lowScoreValidation = businessRules.validateMatchScore(30)
    const otpValidation = businessRules.validateOTP('123456')
    const invalidOtpValidation = businessRules.validateOTP('abc')
    
    // Test pricing calculations
    const starterPricing = businessRules.calculatePricing('starter')
    const growthPricing = businessRules.calculatePricing('growth')
    const scalePricing = businessRules.calculatePricing('scale')
    
    // Test credit usage recommendations
    const recommendationsFor1 = businessRules.calculateCreditUsage('test-client', 1)
    const recommendationsFor5 = businessRules.calculateCreditUsage('test-client', 5)
    const recommendationsFor15 = businessRules.calculateCreditUsage('test-client', 15)
    
    // Test pricing service integration
    const pricingPackages = getPricingPackages()
    const starterCalculation = calculatePackagePricing('STARTER_PACK')
    const creditRecommendations = getCreditRecommendations(3)
    
    // Test expiry calculations
    const matchExpiry = businessRules.calculateMatchExpiry()
    const designerRequestExpiry = businessRules.calculateDesignerRequestExpiry()
    
    return apiResponse.success({
      message: 'BusinessRules functionality test completed',
      featureEnabled: true,
      
      // Basic data
      creditPackages,
      matchingCriteria,
      businessRuleSummary,
      
      // Validation tests
      validations: {
        sufficientCredits: creditValidation,
        insufficientCredits: insufficientCreditValidation,
        goodScore: scoreValidation,
        lowScore: lowScoreValidation,
        validOtp: otpValidation,
        invalidOtp: invalidOtpValidation
      },
      
      // Pricing calculations
      pricingCalculations: {
        starter: starterPricing,
        growth: growthPricing,
        scale: scalePricing
      },
      
      // Credit recommendations
      creditUsageRecommendations: {
        for1Match: recommendationsFor1,
        for5Matches: recommendationsFor5,
        for15Matches: recommendationsFor15
      },
      
      // Pricing service integration
      pricingService: {
        packages: pricingPackages.length,
        starterCalculation,
        creditRecommendations
      },
      
      // Expiry calculations
      expiry: {
        matchExpiry: matchExpiry.toISOString(),
        designerRequestExpiry: designerRequestExpiry.toISOString()
      },
      
      // Feature flags
      features: {
        businessRules: Features.USE_BUSINESS_RULES,
        dataService: Features.USE_NEW_DATA_SERVICE,
        errorManager: Features.USE_ERROR_MANAGER,
        requestPipeline: Features.USE_REQUEST_PIPELINE,
        configManager: Features.USE_CONFIG_MANAGER
      }
    })

  } catch (error) {
    logger.error('BusinessRules test error:', error)
    return apiResponse.error('Failed to test BusinessRules functionality', 500, 'BUSINESS_RULES_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// POST endpoint to test specific validations
export async function POST(request: NextRequest) {
  try {
    if (!Features.USE_BUSINESS_RULES) {
      return apiResponse.error('BusinessRules not enabled')
    }

    const { action, data } = await request.json()
    const businessRules = getBusinessRules()

    switch (action) {
      case 'validateCredits':
        const { credits, required } = data
        return apiResponse.success({
          validation: businessRules.validateCreditDeduction(credits, required)
        })

      case 'validateScore':
        const { score } = data
        return apiResponse.success({
          validation: businessRules.validateMatchScore(score)
        })

      case 'validateOTP':
        const { otp } = data
        return apiResponse.success({
          validation: businessRules.validateOTP(otp)
        })

      case 'calculatePricing':
        const { packageId } = data
        return apiResponse.success({
          pricing: businessRules.calculatePricing(packageId)
        })

      case 'recommendCredits':
        const { matches } = data
        return apiResponse.success({
          recommendations: businessRules.calculateCreditUsage('', matches)
        })

      default:
        return apiResponse.error('Unknown action', 400)
    }

  } catch (error) {
    logger.error('BusinessRules validation error:', error)
    return apiResponse.error('Failed to validate with BusinessRules')
  }
}