/**
 * Pricing service that bridges BusinessRules with legacy constants
 * This allows gradual migration to centralized business rules
 */

import { Features } from '@/lib/features'
import { PRICING_PACKAGES as LEGACY_PRICING_PACKAGES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

/**
 * Get pricing packages using BusinessRules if enabled, otherwise use legacy constants
 */
export function getPricingPackages() {
  if (Features.USE_BUSINESS_RULES) {
    logger.info('✨ Using BusinessRules for pricing packages')
    
    try {
      const { getBusinessRules } = require('@/lib/core/business-rules')
      const businessRules = getBusinessRules()
      const packages = businessRules.getCreditPackages()
      
      // Convert BusinessRules format to legacy format for compatibility
      return packages.map(pkg => ({
        id: `${pkg.id.toUpperCase()}_PACK`,
        name: `${pkg.name} Pack`,
        description: pkg.description || '',
        price: pkg.price,
        credits: pkg.credits,
        pricePerMatch: pkg.price / pkg.credits,
        features: getLegacyFeatures(pkg.id, pkg.credits),
        popular: pkg.id === 'growth' // Growth is most popular
      }))
    } catch (error) {
      logger.warn('⚠️ BusinessRules not available, falling back to legacy pricing')
      return LEGACY_PRICING_PACKAGES
    }
  }
  
  logger.info('📦 Using legacy pricing packages')
  return LEGACY_PRICING_PACKAGES
}

/**
 * Get legacy features for compatibility
 */
function getLegacyFeatures(packageId: string, credits: number): string[] {
  const baseFeatures = [
    `${credits} designer matches`,
    'AI-powered matching',
    'Direct contact info',
    '48-hour guarantee',
    'No platform fees'
  ]

  switch (packageId) {
    case 'starter':
      return baseFeatures

    case 'growth':
      return [
        ...baseFeatures,
        'Priority matching',
        'Bulk project briefs',
        'Save 10% per match'
      ]

    case 'scale':
      return [
        ...baseFeatures,
        'Priority matching',
        'Bulk project briefs',
        'Dedicated support',
        'Team access (3 seats)',
        'Save 28% per match'
      ]

    default:
      return baseFeatures
  }
}

/**
 * Calculate pricing for a specific package
 */
export function calculatePackagePricing(packageId: string) {
  if (Features.USE_BUSINESS_RULES) {
    try {
      const { getBusinessRules } = require('@/lib/core/business-rules')
      const businessRules = getBusinessRules()
      
      // Convert legacy format to business rules format
      const businessRuleId = packageId.replace('_PACK', '').toLowerCase()
      return businessRules.calculatePricing(businessRuleId)
    } catch (error) {
      logger.warn('⚠️ BusinessRules calculation failed, using legacy')
    }
  }
  
  // Legacy calculation
  const packages = LEGACY_PRICING_PACKAGES
  const selectedPackage = packages.find(p => p.id === packageId)
  
  if (!selectedPackage) {
    return null
  }

  return {
    package: {
      id: packageId,
      name: selectedPackage.name,
      price: selectedPackage.price,
      credits: selectedPackage.credits
    },
    totalCost: selectedPackage.price,
    savingsPercent: 0 // Legacy doesn't calculate savings
  }
}

/**
 * Get credit usage recommendations
 */
export function getCreditRecommendations(projectedMatches: number = 1) {
  if (Features.USE_BUSINESS_RULES) {
    try {
      const { getBusinessRules } = require('@/lib/core/business-rules')
      const businessRules = getBusinessRules()
      return businessRules.calculateCreditUsage('', projectedMatches)
    } catch (error) {
      logger.warn('⚠️ BusinessRules recommendations failed, using legacy')
    }
  }
  
  // Legacy recommendation (simple)
  const packages = getPricingPackages()
  const recommended = packages.find(p => p.credits >= projectedMatches) || packages[0]
  
  return {
    recommended: {
      id: recommended.id,
      name: recommended.name,
      price: recommended.price,
      credits: recommended.credits
    },
    alternatives: packages.filter(p => p.id !== recommended.id),
    reasoning: `Legacy recommendation based on ${projectedMatches} matches`
  }
}

/**
 * Validate credit deduction
 */
export function validateCreditDeduction(currentCredits: number, requiredCredits: number = 1) {
  if (Features.USE_BUSINESS_RULES) {
    try {
      const { getBusinessRules } = require('@/lib/core/business-rules')
      const businessRules = getBusinessRules()
      return businessRules.validateCreditDeduction(currentCredits, requiredCredits)
    } catch (error) {
      logger.warn('⚠️ BusinessRules validation failed, using legacy')
    }
  }
  
  // Legacy validation
  if (currentCredits < requiredCredits) {
    return {
      isValid: false,
      message: 'Insufficient credits',
      code: 'INSUFFICIENT_CREDITS'
    }
  }
  
  return { isValid: true }
}