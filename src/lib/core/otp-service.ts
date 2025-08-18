/**
 * Phase 7: Centralized OTP Service
 * 
 * Consolidates 8 different OTP implementations into a single service
 * Features: Generation, validation, rate limiting, expiry management, security
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/core/logging-service'
import { ErrorManager } from '@/lib/core/error-manager'
import { OTP_TIMING, timeUtils } from '@/lib/constants'
import { getBusinessRules } from '@/lib/core/business-rules'
import { Features } from '@/lib/features'

export interface OTPConfig {
  length: number
  expiry: number // minutes
  maxAttempts: number
  cooldownPeriod: number // seconds between requests
  alphanumeric: boolean
  caseSensitive: boolean
}

export interface OTPData {
  code: string
  email: string
  type: 'client' | 'designer' | 'admin'
  purpose: 'login' | 'signup' | 'reset' | 'verify'
  expiresAt: Date
  attempts: number
  verified: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

export interface OTPValidationResult {
  isValid: boolean
  message?: string
  code?: string
  remainingAttempts?: number
  expiresIn?: number // seconds
}

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number // seconds
  message?: string
}

/**
 * Centralized OTP Service for all authentication flows
 * Replaces multiple OTP implementations with a single, secure service
 */
export class OTPService {
  private static instance: OTPService
  private supabase: any
  private config: OTPConfig
  private rateLimitMap: Map<string, number> = new Map()
  private attemptMap: Map<string, number> = new Map()

  private constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    this.supabase = createClient(supabaseUrl, supabaseKey)

    // Default configuration using centralized timing
    this.config = {
      length: OTP_TIMING.LENGTH,
      expiry: OTP_TIMING.EXPIRY_MINUTES,
      maxAttempts: OTP_TIMING.MAX_ATTEMPTS_PER_HOUR,
      cooldownPeriod: OTP_TIMING.COOLDOWN_SECONDS,
      alphanumeric: false,
      caseSensitive: false
    }

    // Load custom configuration if available
    this.loadConfiguration()
  }

  static getInstance(): OTPService {
    if (!this.instance) {
      this.instance = new OTPService()
    }
    return this.instance
  }

  /**
   * Load configuration from environment or ConfigManager
   */
  private loadConfiguration(): void {
    try {
      if (Features.USE_CONFIG_MANAGER) {
        const { getOneDesignerConfig } = require('@/lib/config/init')
        
        this.config = {
          length: getOneDesignerConfig('otp.length', OTP_TIMING.LENGTH),
          expiry: getOneDesignerConfig('otp.expiry.minutes', OTP_TIMING.EXPIRY_MINUTES),
          maxAttempts: getOneDesignerConfig('otp.maxAttempts.hour', OTP_TIMING.MAX_ATTEMPTS_PER_HOUR),
          cooldownPeriod: getOneDesignerConfig('otp.cooldown.seconds', OTP_TIMING.COOLDOWN_SECONDS),
          alphanumeric: getOneDesignerConfig('otp.alphanumeric', false),
          caseSensitive: getOneDesignerConfig('otp.caseSensitive', false)
        }
      } else {
        // Fallback to environment variables with centralized defaults
        this.config.length = parseInt(process.env.OTP_LENGTH || String(OTP_TIMING.LENGTH))
        this.config.expiry = parseInt(process.env.OTP_EXPIRY_MINUTES || String(OTP_TIMING.EXPIRY_MINUTES))
        this.config.maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS_HOUR || String(OTP_TIMING.MAX_ATTEMPTS_PER_HOUR))
        this.config.cooldownPeriod = parseInt(process.env.OTP_COOLDOWN_SECONDS || String(OTP_TIMING.COOLDOWN_SECONDS))
      }
    } catch (error) {
      logger.warn('Failed to load OTP configuration, using defaults', { error })
    }
  }

  /**
   * Generate OTP code
   */
  generateCode(): string {
    if (this.config.alphanumeric) {
      // Generate alphanumeric code
      const chars = this.config.caseSensitive 
        ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      
      let code = ''
      for (let i = 0; i < this.config.length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    } else {
      // Generate numeric code
      const min = Math.pow(10, this.config.length - 1)
      const max = Math.pow(10, this.config.length) - 1
      return Math.floor(min + Math.random() * (max - min + 1)).toString()
    }
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(identifier: string): RateLimitResult {
    const now = Date.now()
    const lastRequest = this.rateLimitMap.get(identifier)

    if (lastRequest) {
      const elapsed = (now - lastRequest) / 1000 // seconds
      if (elapsed < this.config.cooldownPeriod) {
        const retryAfter = Math.ceil(this.config.cooldownPeriod - elapsed)
        return {
          allowed: false,
          retryAfter,
          message: `Please wait ${retryAfter} seconds before requesting another OTP`
        }
      }
    }

    this.rateLimitMap.set(identifier, now)
    return { allowed: true }
  }

  /**
   * Generate and store OTP
   */
  async generateOTP(
    email: string,
    type: 'client' | 'designer' | 'admin',
    purpose: 'login' | 'signup' | 'reset' | 'verify',
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    try {
      logger.info('Generating OTP', { email, type, purpose })

      // Check rate limiting
      const rateLimitKey = `${email}:${type}:${purpose}`
      const rateLimit = this.checkRateLimit(rateLimitKey)
      
      if (!rateLimit.allowed) {
        logger.warn('OTP rate limit exceeded', { email, retryAfter: rateLimit.retryAfter })
        return { 
          success: false, 
          error: rateLimit.message 
        }
      }

      // Generate code
      const code = this.generateCode()
      const expiresAt = new Date(Date.now() + this.config.expiry * 60 * 1000)

      // Store in database
      const { error: dbError } = await this.supabase
        .from('otp_codes')
        .insert({
          email: email.toLowerCase(),
          code: this.config.caseSensitive ? code : code.toUpperCase(),
          type,
          purpose,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          verified: false,
          metadata
        })

      if (dbError) {
        // If table doesn't exist, use alternative storage
        if (dbError.code === '42P01') {
          logger.info('OTP table not found, using auth_tokens table')
          
          const { error: fallbackError } = await this.supabase
            .from('auth_tokens')
            .upsert({
              email: email.toLowerCase(),
              token: code,
              token_type: `otp_${type}_${purpose}`,
              expires_at: expiresAt.toISOString(),
              metadata: { ...metadata, attempts: 0 }
            })

          if (fallbackError) {
            throw fallbackError
          }
        } else {
          throw dbError
        }
      }

      // Clear old attempts counter
      this.attemptMap.delete(rateLimitKey)

      logger.info('OTP generated successfully', { 
        email, 
        expiresIn: `${this.config.expiry} minutes` 
      })

      return { success: true, code }

    } catch (error) {
      logger.error('Failed to generate OTP', error, { email })
      
      if (Features.USE_ERROR_MANAGER) {
        const errorManager = ErrorManager.getInstance()
        await errorManager.handle(error, {
          operation: 'generateOTP',
          params: { email, type, purpose }
        })
      }

      return { 
        success: false, 
        error: 'Failed to generate OTP. Please try again.' 
      }
    }
  }

  /**
   * Validate OTP
   */
  async validateOTP(
    email: string,
    code: string,
    type: 'client' | 'designer' | 'admin',
    purpose: 'login' | 'signup' | 'reset' | 'verify'
  ): Promise<OTPValidationResult> {
    try {
      logger.info('Validating OTP', { email, type, purpose })

      const normalizedEmail = email.toLowerCase()
      const normalizedCode = this.config.caseSensitive ? code : code.toUpperCase()

      // Check attempts
      const attemptKey = `${normalizedEmail}:${type}:${purpose}`
      const attempts = this.attemptMap.get(attemptKey) || 0

      if (attempts >= this.config.maxAttempts) {
        logger.warn('Max OTP attempts exceeded', { email, attempts })
        return {
          isValid: false,
          message: 'Maximum attempts exceeded. Please request a new code.',
          remainingAttempts: 0
        }
      }

      // Fetch OTP from database
      let otpData: any = null
      
      // Try primary table first
      const { data: primaryData, error: primaryError } = await this.supabase
        .from('otp_codes')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('type', type)
        .eq('purpose', purpose)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!primaryError && primaryData) {
        otpData = primaryData
      } else if (primaryError?.code === '42P01') {
        // Fallback to auth_tokens table
        const { data: fallbackData } = await this.supabase
          .from('auth_tokens')
          .select('*')
          .eq('email', normalizedEmail)
          .eq('token_type', `otp_${type}_${purpose}`)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (fallbackData) {
          otpData = {
            code: fallbackData.token,
            expires_at: fallbackData.expires_at,
            attempts: fallbackData.metadata?.attempts || 0
          }
        }
      }

      if (!otpData) {
        // Increment attempts
        this.attemptMap.set(attemptKey, attempts + 1)
        
        logger.warn('OTP not found or expired', { email })
        return {
          isValid: false,
          message: 'Invalid or expired code',
          remainingAttempts: this.config.maxAttempts - attempts - 1
        }
      }

      // Validate code
      const storedCode = this.config.caseSensitive ? otpData.code : otpData.code.toUpperCase()
      
      if (storedCode !== normalizedCode) {
        // Increment attempts
        this.attemptMap.set(attemptKey, attempts + 1)
        
        // Update attempts in database
        if (otpData.id) {
          await this.supabase
            .from('otp_codes')
            .update({ attempts: attempts + 1 })
            .eq('id', otpData.id)
        }

        logger.warn('Invalid OTP code', { email, attempts: attempts + 1 })
        return {
          isValid: false,
          message: 'Invalid code',
          remainingAttempts: this.config.maxAttempts - attempts - 1
        }
      }

      // Mark as verified
      if (otpData.id) {
        await this.supabase
          .from('otp_codes')
          .update({ verified: true, verified_at: new Date().toISOString() })
          .eq('id', otpData.id)
      } else {
        // Update auth_tokens
        await this.supabase
          .from('auth_tokens')
          .delete()
          .eq('email', normalizedEmail)
          .eq('token_type', `otp_${type}_${purpose}`)
      }

      // Clear attempts
      this.attemptMap.delete(attemptKey)

      // Calculate expiry
      const expiresIn = Math.floor((new Date(otpData.expires_at).getTime() - Date.now()) / 1000)

      logger.info('OTP validated successfully', { email })
      return {
        isValid: true,
        code: otpData.code,
        expiresIn
      }

    } catch (error) {
      logger.error('Failed to validate OTP', error, { email })
      
      if (Features.USE_ERROR_MANAGER) {
        const errorManager = ErrorManager.getInstance()
        await errorManager.handle(error, {
          operation: 'validateOTP',
          params: { email, type, purpose }
        })
      }

      return {
        isValid: false,
        message: 'Failed to validate OTP. Please try again.'
      }
    }
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpired(): Promise<number> {
    try {
      logger.info('Cleaning up expired OTPs')

      // Clean primary table
      const { data: primaryData, error: primaryError } = await this.supabase
        .from('otp_codes')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id')

      let cleaned = primaryData?.length || 0

      // Clean fallback table
      if (primaryError?.code === '42P01' || !primaryError) {
        const { data: fallbackData } = await this.supabase
          .from('auth_tokens')
          .delete()
          .like('token_type', 'otp_%')
          .lt('expires_at', new Date().toISOString())
          .select('id')

        cleaned += fallbackData?.length || 0
      }

      logger.info(`Cleaned up ${cleaned} expired OTPs`)
      return cleaned

    } catch (error) {
      logger.error('Failed to cleanup expired OTPs', error)
      return 0
    }
  }

  /**
   * Get OTP status
   */
  async getOTPStatus(
    email: string,
    type: 'client' | 'designer' | 'admin'
  ): Promise<{
    hasActiveOTP: boolean
    expiresIn?: number
    attempts?: number
    canRequestNew: boolean
  }> {
    try {
      const normalizedEmail = email.toLowerCase()
      
      // Check rate limit
      const rateLimitKey = `${normalizedEmail}:${type}:status`
      const lastRequest = this.rateLimitMap.get(rateLimitKey)
      const now = Date.now()
      const canRequestNew = !lastRequest || 
        (now - lastRequest) / 1000 >= this.config.cooldownPeriod

      // Check for active OTP
      const { data } = await this.supabase
        .from('otp_codes')
        .select('expires_at, attempts')
        .eq('email', normalizedEmail)
        .eq('type', type)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        const expiresIn = Math.floor(
          (new Date(data.expires_at).getTime() - Date.now()) / 1000
        )

        return {
          hasActiveOTP: true,
          expiresIn,
          attempts: data.attempts,
          canRequestNew
        }
      }

      return {
        hasActiveOTP: false,
        canRequestNew
      }

    } catch (error) {
      logger.error('Failed to get OTP status', error, { email })
      return {
        hasActiveOTP: false,
        canRequestNew: true
      }
    }
  }

  /**
   * Resend OTP (with rate limiting)
   */
  async resendOTP(
    email: string,
    type: 'client' | 'designer' | 'admin',
    purpose: 'login' | 'signup' | 'reset' | 'verify'
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    // Invalidate existing OTP
    await this.invalidateOTP(email, type, purpose)
    
    // Generate new OTP
    return this.generateOTP(email, type, purpose)
  }

  /**
   * Invalidate OTP
   */
  async invalidateOTP(
    email: string,
    type: 'client' | 'designer' | 'admin',
    purpose: 'login' | 'signup' | 'reset' | 'verify'
  ): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase()

      // Delete from primary table
      await this.supabase
        .from('otp_codes')
        .delete()
        .eq('email', normalizedEmail)
        .eq('type', type)
        .eq('purpose', purpose)
        .eq('verified', false)

      // Delete from fallback table
      await this.supabase
        .from('auth_tokens')
        .delete()
        .eq('email', normalizedEmail)
        .eq('token_type', `otp_${type}_${purpose}`)

      logger.info('OTP invalidated', { email, type, purpose })
      return true

    } catch (error) {
      logger.error('Failed to invalidate OTP', error, { email })
      return false
    }
  }

  /**
   * Clear rate limit (for testing)
   */
  clearRateLimit(identifier: string): void {
    this.rateLimitMap.delete(identifier)
    this.attemptMap.delete(identifier)
  }

  /**
   * Get configuration
   */
  getConfig(): OTPConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OTPConfig>): void {
    this.config = { ...this.config, ...config }
    logger.info('OTP configuration updated', { config: this.config })
  }
}

// Export singleton instance
export const otpService = OTPService.getInstance()

// Export convenience functions for migration
export const otp = {
  generate: (email: string, type: any, purpose: any, metadata?: any) => 
    otpService.generateOTP(email, type, purpose, metadata),
  
  validate: (email: string, code: string, type: any, purpose: any) =>
    otpService.validateOTP(email, code, type, purpose),
  
  resend: (email: string, type: any, purpose: any) =>
    otpService.resendOTP(email, type, purpose),
  
  invalidate: (email: string, type: any, purpose: any) =>
    otpService.invalidateOTP(email, type, purpose),
  
  status: (email: string, type: any) =>
    otpService.getOTPStatus(email, type),
  
  cleanup: () => otpService.cleanupExpired()
}