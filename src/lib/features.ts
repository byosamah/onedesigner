import { getOneDesignerConfig, isConfigInitialized } from '@/lib/config/init'
// Import app initialization to ensure config is loaded
import '@/lib/init'
// Import dual logger for backward-compatible logging
import { dualLogger } from '@/lib/utils/dual-logger'

/**
 * Type definitions for feature flags
 * Provides type safety while maintaining backward compatibility
 */
export interface FeatureFlags {
  USE_NEW_DATA_SERVICE: boolean
  USE_AUTH_MIDDLEWARE: boolean
  USE_BUSINESS_RULES: boolean
  USE_ERROR_MANAGER: boolean
  USE_REQUEST_PIPELINE: boolean
  USE_CONFIG_MANAGER: boolean
  ENABLE_QUERY_CACHE: boolean
  ENABLE_TRANSACTIONS: boolean
  ENABLE_MONITORING: boolean
  ENABLE_DETAILED_LOGGING: boolean
  USE_CENTRALIZED_LOGGING: boolean
  USE_OTP_SERVICE: boolean
  USE_EMAIL_SERVICE: boolean
  ROLLBACK_TIMEOUT: number
  ROLLBACK_ERROR_THRESHOLD: number
}

/**
 * Service status type for health checks
 */
export type ServiceStatus = 'active' | 'inactive'

/**
 * Feature status record type
 */
export type FeatureStatusRecord = Record<string, boolean | number>

/**
 * Feature flags for gradual centralization rollout
 * These can be controlled via ConfigManager (environment variables, database, files)
 */
export const Features = {
  /**
   * Enable new DataService for database operations
   * When true, uses centralized DataService with caching and optimizations
   * When false, uses legacy direct Supabase calls
   */
  get USE_NEW_DATA_SERVICE(): boolean {
    return getOneDesignerConfig('features.dataService', false) || process.env.USE_NEW_DATA_SERVICE === 'true'
  },

  /**
   * Enable new auth middleware wrapper
   * When true, uses withAuth wrapper for consistent session handling
   * When false, uses legacy inline session validation
   */
  get USE_AUTH_MIDDLEWARE(): boolean {
    return getOneDesignerConfig('features.authMiddleware', false) || process.env.USE_AUTH_MIDDLEWARE === 'true'
  },

  /**
   * Enable centralized business rules
   * When true, uses BusinessRules class for validation and calculations
   * When false, uses legacy inline business logic
   */
  get USE_BUSINESS_RULES(): boolean {
    return getOneDesignerConfig('features.businessRules', false) || process.env.USE_BUSINESS_RULES === 'true'
  },

  /**
   * Enable enhanced error handling
   * When true, uses ErrorManager for consistent error responses
   * When false, uses legacy error handling
   */
  get USE_ERROR_MANAGER(): boolean {
    return getOneDesignerConfig('features.errorManager', false) || process.env.USE_ERROR_MANAGER === 'true'
  },

  /**
   * Enable request pipeline
   * When true, uses middleware pipeline for request processing
   * When false, uses legacy request handling
   */
  get USE_REQUEST_PIPELINE(): boolean {
    return getOneDesignerConfig('features.requestPipeline', false) || process.env.USE_REQUEST_PIPELINE === 'true'
  },

  /**
   * Enable configuration manager
   * When true, uses centralized ConfigManager for all settings
   * When false, uses legacy environment variable access
   */
  get USE_CONFIG_MANAGER(): boolean {
    return getOneDesignerConfig('features.configManager', false) || process.env.USE_CONFIG_MANAGER === 'true'
  },

  /**
   * Enable query caching
   * When true, caches database query results
   * When false, always fetches fresh data
   */
  get ENABLE_QUERY_CACHE(): boolean {
    return getOneDesignerConfig('cache.enabled', true)
  },

  /**
   * Enable transaction support
   * When true, uses proper database transactions
   * When false, uses sequential operations
   */
  get ENABLE_TRANSACTIONS(): boolean {
    return getOneDesignerConfig('features.transactions', false)
  },

  /**
   * Enable performance monitoring
   * When true, tracks API and database performance
   * When false, no performance tracking
   */
  get ENABLE_MONITORING(): boolean {
    return getOneDesignerConfig('monitoring.enabled', false)
  },

  /**
   * Enable detailed logging
   * When true, logs detailed information for debugging
   * When false, minimal logging
   */
  get ENABLE_DETAILED_LOGGING(): boolean {
    return getOneDesignerConfig('logging.detailed', false)
  },

  /**
   * Enable centralized logging service (Phase 6)
   * When true, uses LoggingService with correlation IDs and structured logging
   * When false, uses standard console.log statements
   */
  get USE_CENTRALIZED_LOGGING(): boolean {
    return getOneDesignerConfig('features.centralizedLogging', false) || process.env.USE_CENTRALIZED_LOGGING === 'true'
  },

  /**
   * Enable centralized OTP service (Phase 7)
   * When true, uses OTPService for all OTP operations
   * When false, uses legacy OTP implementations
   */
  get USE_OTP_SERVICE(): boolean {
    return getOneDesignerConfig('features.otpService', false) || process.env.USE_OTP_SERVICE === 'true'
  },

  /**
   * Enable centralized email service (Phase 8)
   * When true, uses EmailService for all email operations
   * When false, uses legacy email implementations
   */
  get USE_EMAIL_SERVICE(): boolean {
    return getOneDesignerConfig('features.emailService', false) || process.env.USE_EMAIL_SERVICE === 'true'
  },

  /**
   * Rollback timeout (ms)
   * If a new feature causes errors above threshold, auto-rollback
   */
  get ROLLBACK_TIMEOUT(): number {
    return getOneDesignerConfig('features.rollback.timeout', 60000)
  },

  /**
   * Error threshold for rollback
   * If error rate exceeds this percentage, trigger rollback
   */
  get ROLLBACK_ERROR_THRESHOLD(): number {
    return getOneDesignerConfig('features.rollback.errorThreshold', 10)
  }
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof Features): boolean {
  return Features[feature] as boolean
}

/**
 * Toggle feature for testing (only in development)
 */
export function toggleFeature(feature: keyof typeof Features, enabled: boolean): void {
  if (process.env.NODE_ENV === 'development') {
    (Features as any)[feature] = enabled
  } else {
    dualLogger.warn('Feature toggling is only available in development mode')
  }
}

/**
 * Get all feature statuses
 */
export function getFeatureStatuses(): Record<string, boolean> {
  return Object.entries(Features).reduce((acc, [key, value]) => {
    if (typeof value === 'boolean') {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, boolean>)
}

/**
 * Log feature status (for debugging)
 */
export function logFeatureStatus(): void {
  dualLogger.log('🚀 Feature Flags Status:')
  dualLogger.log('========================')
  Object.entries(Features).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      dualLogger.log(`${key}: ${value ? '✅ Enabled' : '❌ Disabled'}`)
    }
  })
  dualLogger.log('========================')
}