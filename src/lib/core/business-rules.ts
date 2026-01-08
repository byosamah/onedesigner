/**
 * Phase 5: Business Logic Consolidation
 * 
 * Centralized business rules and validation logic for OneDesigner
 * This class consolidates all business logic previously scattered across the application
 */

import { getOneDesignerConfig } from '@/lib/config/init'

// Business rule types
export interface CreditPackage {
  id: string
  name: string
  price: number
  credits: number
  description?: string
}

export interface MatchingCriteria {
  minScore: number
  maxDesigners: number
  exclusions: string[]
  requirements: string[]
}

export interface ValidationResult {
  isValid: boolean
  message?: string
  code?: string
  details?: any
}

export interface PricingResult {
  package: CreditPackage
  totalCost: number
  discount?: number
  savingsPercent?: number
}

/**
 * Centralized Business Rules Engine
 * Consolidates all business logic from across the application
 */
export class BusinessRules {
  private static instance: BusinessRules

  private constructor() {
    // Singleton pattern to ensure consistent business rules
  }

  /**
   * Get singleton instance
   */
  static getInstance(): BusinessRules {
    if (!this.instance) {
      this.instance = new BusinessRules()
    }
    return this.instance
  }

  // ==================== CREDIT & PAYMENT RULES ====================

  /**
   * Get all available credit packages
   */
  getCreditPackages(): CreditPackage[] {
    return [
      {
        id: 'starter',
        name: 'Starter',
        price: getOneDesignerConfig('payment.packages.starter.price', 5),
        credits: getOneDesignerConfig('payment.packages.starter.credits', 3),
        description: 'Perfect for small projects'
      },
      {
        id: 'growth',
        name: 'Growth',
        price: getOneDesignerConfig('payment.packages.growth.price', 15),
        credits: getOneDesignerConfig('payment.packages.growth.credits', 10),
        description: 'Great for multiple projects'
      },
      {
        id: 'scale',
        name: 'Scale',
        price: getOneDesignerConfig('payment.packages.scale.price', 30),
        credits: getOneDesignerConfig('payment.packages.scale.credits', 25),
        description: 'Best value for agencies'
      }
    ]
  }

  /**
   * Calculate pricing for a package
   */
  calculatePricing(packageId: string): PricingResult | null {
    const packages = this.getCreditPackages()
    const selectedPackage = packages.find(p => p.id === packageId)
    
    if (!selectedPackage) {
      return null
    }

    // Calculate value per credit
    const pricePerCredit = selectedPackage.price / selectedPackage.credits
    const starterPricePerCredit = packages[0].price / packages[0].credits
    
    // Calculate savings compared to starter package
    const savings = starterPricePerCredit - pricePerCredit
    const savingsPercent = Math.round((savings / starterPricePerCredit) * 100)

    return {
      package: selectedPackage,
      totalCost: selectedPackage.price,
      savingsPercent: savingsPercent > 0 ? savingsPercent : 0
    }
  }

  /**
   * Validate credit deduction
   */
  validateCreditDeduction(currentCredits: number, requiredCredits: number = 1): ValidationResult {
    if (currentCredits < requiredCredits) {
      return {
        isValid: false,
        message: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        details: {
          currentCredits,
          requiredCredits,
          shortfall: requiredCredits - currentCredits
        }
      }
    }

    return { isValid: true }
  }

  /**
   * Calculate credit usage and recommendations
   */
  calculateCreditUsage(clientId: string, projectedMatches: number = 1): {
    recommended: CreditPackage
    alternatives: CreditPackage[]
    reasoning: string
  } {
    const packages = this.getCreditPackages()
    
    // Find the most cost-effective package for projected usage
    const recommended = packages.reduce((best, current) => {
      const currentValuePerCredit = current.price / current.credits
      const bestValuePerCredit = best.price / best.credits
      
      if (current.credits >= projectedMatches && currentValuePerCredit < bestValuePerCredit) {
        return current
      }
      
      return best
    })

    const alternatives = packages.filter(p => p.id !== recommended.id && p.credits >= projectedMatches)

    return {
      recommended,
      alternatives,
      reasoning: `Based on ${projectedMatches} projected matches, ${recommended.name} offers the best value at $${(recommended.price / recommended.credits).toFixed(2)} per match`
    }
  }

  // ==================== DESIGNER & MATCHING RULES ====================

  /**
   * Validate designer eligibility for matching
   */
  validateDesignerEligibility(designer: any): ValidationResult {
    // Must be approved
    if (!designer.is_approved) {
      return {
        isValid: false,
        message: 'Designer not approved',
        code: 'DESIGNER_NOT_APPROVED'
      }
    }

    // Must have required fields
    const requiredFields = ['first_name', 'last_name', 'email']
    const missingFields = requiredFields.filter(field => !designer[field])
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: 'Designer profile incomplete',
        code: 'INCOMPLETE_PROFILE',
        details: { missingFields }
      }
    }

    return { isValid: true }
  }

  /**
   * Check if client can be matched with designer
   */
  validateClientDesignerMatch(clientId: string, designerId: string, unlockedDesigners: string[]): ValidationResult {
    // Check if designer already unlocked by this client
    if (unlockedDesigners.includes(designerId)) {
      return {
        isValid: false,
        message: 'Designer already unlocked by this client',
        code: 'DESIGNER_ALREADY_UNLOCKED'
      }
    }

    return { isValid: true }
  }

  /**
   * Get matching criteria based on configuration
   */
  getMatchingCriteria(): MatchingCriteria {
    return {
      minScore: getOneDesignerConfig('matching.score.min', 50),
      maxDesigners: getOneDesignerConfig('matching.designers.limit', 5),
      exclusions: ['not_approved', 'incomplete_profile'],
      requirements: ['first_name', 'last_name', 'email', 'is_approved']
    }
  }

  /**
   * Validate match score
   */
  validateMatchScore(score: number): ValidationResult {
    const minScore = getOneDesignerConfig('matching.score.min', 50)
    const threshold = getOneDesignerConfig('matching.score.threshold', 85)

    if (score < minScore) {
      return {
        isValid: false,
        message: 'Match score below minimum threshold',
        code: 'SCORE_TOO_LOW',
        details: { score, minScore, threshold }
      }
    }

    return {
      isValid: true,
      details: {
        score,
        quality: score >= threshold ? 'excellent' : score >= 70 ? 'good' : 'acceptable'
      }
    }
  }

  // ==================== APPROVAL & WORKFLOW RULES ====================

  /**
   * Validate designer approval workflow
   */
  validateDesignerApproval(designer: any): ValidationResult {
    const requireApproval = getOneDesignerConfig('business.designer.approval.required', true)
    
    if (!requireApproval) {
      return { isValid: true }
    }

    // Check if designer has submitted complete application
    const requiredFields = [
      'first_name', 'last_name', 'email', 'country', 'city',
      'years_experience', 'title'
    ]
    
    const missingFields = requiredFields.filter(field => !designer[field])
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: 'Incomplete designer application',
        code: 'INCOMPLETE_APPLICATION',
        details: { missingFields, requiredFields }
      }
    }

    return { isValid: true }
  }

  /**
   * Check if designer request is expired
   */
  isDesignerRequestExpired(requestDate: Date): boolean {
    const expirySeconds = getOneDesignerConfig('business.designer.request.expiry', 604800) // 7 days
    const expiryMs = expirySeconds * 1000
    
    return Date.now() - requestDate.getTime() > expiryMs
  }

  /**
   * Check if match is expired
   */
  isMatchExpired(matchDate: Date): boolean {
    const expirySeconds = getOneDesignerConfig('business.match.expiry', 604800) // 7 days
    const expiryMs = expirySeconds * 1000
    
    return Date.now() - matchDate.getTime() > expiryMs
  }

  // ==================== SECURITY & VALIDATION RULES ====================

  /**
   * Validate session expiry
   */
  isSessionExpired(sessionDate: Date): boolean {
    const expirySeconds = getOneDesignerConfig('security.session.expiry', 2592000) // 30 days
    const expiryMs = expirySeconds * 1000
    
    return Date.now() - sessionDate.getTime() > expiryMs
  }

  /**
   * Validate OTP format
   */
  validateOTP(otp: string): ValidationResult {
    const expectedLength = getOneDesignerConfig('security.otp.length', 6)
    
    if (!otp || otp.length !== expectedLength) {
      return {
        isValid: false,
        message: `OTP must be ${expectedLength} digits`,
        code: 'INVALID_OTP_FORMAT'
      }
    }

    if (!/^\d+$/.test(otp)) {
      return {
        isValid: false,
        message: 'OTP must contain only numbers',
        code: 'INVALID_OTP_FORMAT'
      }
    }

    return { isValid: true }
  }

  /**
   * Check if OTP is expired
   */
  isOTPExpired(otpDate: Date): boolean {
    const expirySeconds = getOneDesignerConfig('email.templates.otp.expiry', 300) // 5 minutes
    const expiryMs = expirySeconds * 1000
    
    return Date.now() - otpDate.getTime() > expiryMs
  }

  // ==================== BUSINESS LOGIC HELPERS ====================

  /**
   * Calculate match expiry date
   */
  calculateMatchExpiry(): Date {
    const expirySeconds = getOneDesignerConfig('business.match.expiry', 604800) // 7 days
    return new Date(Date.now() + (expirySeconds * 1000))
  }

  /**
   * Calculate designer request expiry
   */
  calculateDesignerRequestExpiry(): Date {
    const expirySeconds = getOneDesignerConfig('business.designer.request.expiry', 604800) // 7 days
    return new Date(Date.now() + (expirySeconds * 1000))
  }

  /**
   * Get business rule summary for debugging
   */
  getBusinessRuleSummary(): Record<string, any> {
    return {
      creditPackages: this.getCreditPackages().length,
      matchingCriteria: this.getMatchingCriteria(),
      securitySettings: {
        sessionExpiry: getOneDesignerConfig('security.session.expiry', 2592000),
        otpLength: getOneDesignerConfig('security.otp.length', 6),
        otpExpiry: getOneDesignerConfig('email.templates.otp.expiry', 300)
      },
      businessSettings: {
        requireDesignerApproval: getOneDesignerConfig('business.designer.approval.required', true),
        matchExpiry: getOneDesignerConfig('business.match.expiry', 604800),
        designerRequestExpiry: getOneDesignerConfig('business.designer.request.expiry', 604800)
      }
    }
  }

  // ==================== VALIDATION SHORTCUTS ====================

  /**
   * Validate complete match unlock workflow
   */
  validateMatchUnlock(
    clientCredits: number,
    designerId: string,
    unlockedDesigners: string[],
    matchScore: number
  ): ValidationResult {
    // Check credits
    const creditCheck = this.validateCreditDeduction(clientCredits)
    if (!creditCheck.isValid) return creditCheck

    // Check designer availability
    const designerCheck = this.validateClientDesignerMatch('', designerId, unlockedDesigners)
    if (!designerCheck.isValid) return designerCheck

    // Check match quality
    const scoreCheck = this.validateMatchScore(matchScore)
    if (!scoreCheck.isValid) return scoreCheck

    return { isValid: true }
  }

  /**
   * Validate complete designer application
   */
  validateDesignerApplication(designerData: any): ValidationResult {
    const profileCheck = this.validateDesignerEligibility(designerData)
    if (!profileCheck.isValid) return profileCheck

    const approvalCheck = this.validateDesignerApproval(designerData)
    if (!approvalCheck.isValid) return approvalCheck

    return { isValid: true }
  }
}

// Export singleton instance and factory function
let businessRulesInstance: BusinessRules | null = null

/**
 * Get BusinessRules singleton instance
 */
export function getBusinessRules(): BusinessRules {
  if (!businessRulesInstance) {
    businessRulesInstance = BusinessRules.getInstance()
  }
  return businessRulesInstance
}

/**
 * Business rules factory with configuration
 */
export function createBusinessRules(): BusinessRules {
  return new BusinessRules()
}

// Export commonly used functions
export const businessRules = {
  getCreditPackages: () => getBusinessRules().getCreditPackages(),
  validateCreditDeduction: (credits: number) => getBusinessRules().validateCreditDeduction(credits),
  validateMatchScore: (score: number) => getBusinessRules().validateMatchScore(score),
  validateOTP: (otp: string) => getBusinessRules().validateOTP(otp),
  isSessionExpired: (date: Date) => getBusinessRules().isSessionExpired(date),
  isMatchExpired: (date: Date) => getBusinessRules().isMatchExpired(date)
}