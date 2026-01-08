/**
 * Centralized Business Timing Configuration
 * All hardcoded timeouts, cooldowns, delays, and limits should be managed here
 */

// Base time units in milliseconds for consistency
export const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
} as const

// OTP (One-Time Password) Configuration
export const OTP_TIMING = {
  // Expiry times
  EXPIRY_MINUTES: 10,
  EXPIRY_MILLISECONDS: 10 * TIME_UNITS.MINUTE, // 600000ms
  
  // Cooldown periods
  COOLDOWN_SECONDS: 60,
  COOLDOWN_MILLISECONDS: 60 * TIME_UNITS.SECOND,
  
  // Code configuration
  LENGTH: 6,
  
  // Rate limiting
  MAX_ATTEMPTS_PER_HOUR: 5,
  MAX_GENERATION_PER_DAY: 20
} as const

// Email Service Configuration
export const EMAIL_TIMING = {
  // Rate limits
  RATE_LIMIT_PER_MINUTE: 60,
  RATE_LIMIT_WINDOW: TIME_UNITS.MINUTE,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5 * TIME_UNITS.SECOND, // 5000ms
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  // Queue processing
  QUEUE_PROCESS_INTERVAL: 10 * TIME_UNITS.SECOND, // 10000ms
  QUEUE_MAX_SIZE: 1000,
  
  // Template expiry times
  OTP_EXPIRY_DISPLAY: '10 minutes',
  RESET_LINK_EXPIRY_HOURS: 1,
  VERIFICATION_LINK_EXPIRY_HOURS: 24
} as const

// API & Request Timeouts
export const API_TIMING = {
  // General API timeouts
  DEFAULT_TIMEOUT_MS: 30 * TIME_UNITS.SECOND, // 30000ms
  QUICK_TIMEOUT_MS: 5 * TIME_UNITS.SECOND,   // 5000ms
  LONG_TIMEOUT_MS: 60 * TIME_UNITS.SECOND,   // 60000ms
  
  // AI service timeouts
  AI_REQUEST_TIMEOUT: 45 * TIME_UNITS.SECOND,
  AI_RETRY_DELAY: TIME_UNITS.SECOND,
  AI_MAX_RETRIES: 3,
  
  // External service timeouts
  PAYMENT_TIMEOUT: 45 * TIME_UNITS.SECOND,
  EMAIL_SERVICE_TIMEOUT: 15 * TIME_UNITS.SECOND,
  DATABASE_TIMEOUT: 10 * TIME_UNITS.SECOND
} as const

// Cache Configuration
export const CACHE_TIMING = {
  // Default cache TTLs
  DEFAULT_TTL_MS: 5 * TIME_UNITS.MINUTE,     // 300000ms
  SHORT_TTL_MS: TIME_UNITS.MINUTE,           // 60000ms
  MEDIUM_TTL_MS: 15 * TIME_UNITS.MINUTE,    // 900000ms
  LONG_TTL_MS: TIME_UNITS.HOUR,             // 3600000ms
  DAILY_TTL_MS: TIME_UNITS.DAY,             // 86400000ms
  
  // Specific cache configurations
  USER_SESSION_TTL: 30 * TIME_UNITS.DAY,     // 30 days
  MATCH_CACHE_TTL: 2 * TIME_UNITS.HOUR,      // 2 hours
  EMBEDDING_CACHE_TTL: TIME_UNITS.DAY,       // 24 hours
  CONFIG_CACHE_TTL: 5 * TIME_UNITS.MINUTE,   // 5 minutes
  
  // Cache cleanup intervals
  CLEANUP_INTERVAL: TIME_UNITS.HOUR,         // Hourly cleanup
  EXPIRED_CHECK_INTERVAL: 10 * TIME_UNITS.MINUTE // Check every 10 minutes
} as const

// Rate Limiting Configuration
export const RATE_LIMITING = {
  // Window durations
  WINDOW_15_MIN: 15 * TIME_UNITS.MINUTE,     // 900000ms
  WINDOW_1_HOUR: TIME_UNITS.HOUR,           // 3600000ms
  WINDOW_1_DAY: TIME_UNITS.DAY,             // 86400000ms
  
  // API rate limits
  API_REQUESTS_PER_MINUTE: 100,
  API_REQUESTS_PER_HOUR: 1000,
  
  // Authentication rate limits
  LOGIN_ATTEMPTS_PER_15_MIN: 5,
  OTP_REQUESTS_PER_HOUR: 10,
  PASSWORD_RESET_PER_DAY: 3,
  
  // Feature-specific limits
  MATCH_REQUESTS_PER_HOUR: 50,
  PROFILE_UPDATES_PER_DAY: 5,
  MESSAGE_SENDS_PER_MINUTE: 10,
  
  // Admin overrides
  ADMIN_RATE_MULTIPLIER: 10 // Admins get 10x limits
} as const

// Business Process Timing
export const BUSINESS_TIMING = {
  // Match expiration
  MATCH_EXPIRY_DAYS: 7,
  MATCH_EXPIRY_MS: 7 * TIME_UNITS.DAY,
  
  // Designer request expiration
  DESIGNER_REQUEST_EXPIRY_DAYS: 7,
  DESIGNER_REQUEST_EXPIRY_MS: 7 * TIME_UNITS.DAY,
  
  // Session management
  CLIENT_SESSION_DAYS: 30,
  DESIGNER_SESSION_DAYS: 30,
  ADMIN_SESSION_HOURS: 8,
  
  // Review periods
  APPLICATION_REVIEW_DAYS: 3,
  APPROVAL_EXPIRY_DAYS: 30,
  
  // Notification delays
  INSTANT_NOTIFICATION_MS: 0,
  DELAYED_NOTIFICATION_MINUTES: 5,
  REMINDER_NOTIFICATION_HOURS: 24,
  
  // Auto-cleanup periods
  EXPIRED_MATCH_CLEANUP_DAYS: 30,
  INACTIVE_USER_CLEANUP_DAYS: 365,
  LOG_RETENTION_DAYS: 90
} as const

// Performance Monitoring Thresholds
export const PERFORMANCE_TIMING = {
  // Response time thresholds (milliseconds)
  FAST_RESPONSE_MS: 200,
  ACCEPTABLE_RESPONSE_MS: 1000,   // 1 second
  SLOW_RESPONSE_MS: 3000,         // 3 seconds
  CRITICAL_RESPONSE_MS: 10000,    // 10 seconds
  
  // Database query thresholds
  FAST_QUERY_MS: 50,
  SLOW_QUERY_MS: 1000,
  CRITICAL_QUERY_MS: 5000,
  
  // Monitoring intervals
  HEALTH_CHECK_INTERVAL_MS: 30 * TIME_UNITS.SECOND,
  METRICS_COLLECTION_INTERVAL_MS: 5 * TIME_UNITS.MINUTE,
  ALERT_CHECK_INTERVAL_MS: TIME_UNITS.MINUTE
} as const

// Animation & UI Timing
export const UI_TIMING = {
  // Transition durations (milliseconds)
  FAST_TRANSITION: 150,
  NORMAL_TRANSITION: 300,
  SLOW_TRANSITION: 500,
  
  // Animation delays
  STAGGER_DELAY: 100,
  SEQUENCE_DELAY: 200,
  
  // Interaction timeouts
  TOOLTIP_DELAY: 500,
  HOVER_DELAY: 200,
  DEBOUNCE_DELAY: 300,
  
  // Loading states
  MINIMUM_LOADING_TIME: 500,      // Prevent flash
  LOADING_TIMEOUT: 30000,         // 30 seconds max
  
  // Auto-hide timings
  SUCCESS_MESSAGE_DURATION: 3000,
  ERROR_MESSAGE_DURATION: 5000,
  INFO_MESSAGE_DURATION: 4000
} as const

// Development & Testing Overrides
export const DEV_TIMING = {
  // Faster timeouts for development
  OTP_EXPIRY_DEV_MINUTES: 30,     // Longer for testing
  CACHE_TTL_DEV_MS: TIME_UNITS.MINUTE, // Shorter for testing
  RATE_LIMIT_DEV_MULTIPLIER: 0.1, // 10x more lenient
  
  // Debug intervals
  DEBUG_LOG_INTERVAL: 5 * TIME_UNITS.SECOND,
  DEV_HEALTH_CHECK: 10 * TIME_UNITS.SECOND
} as const

// Utility functions for time calculations
export const timeUtils = {
  /**
   * Convert minutes to milliseconds
   */
  minutesToMs: (minutes: number) => minutes * TIME_UNITS.MINUTE,
  
  /**
   * Convert hours to milliseconds
   */
  hoursToMs: (hours: number) => hours * TIME_UNITS.HOUR,
  
  /**
   * Convert days to milliseconds
   */
  daysToMs: (days: number) => days * TIME_UNITS.DAY,
  
  /**
   * Get current timestamp + offset
   */
  getExpiryTime: (offsetMs: number) => new Date(Date.now() + offsetMs),
  
  /**
   * Check if timestamp is expired
   */
  isExpired: (timestamp: Date) => Date.now() > timestamp.getTime(),
  
  /**
   * Get seconds until expiry
   */
  getSecondsUntilExpiry: (expiryTime: Date) => 
    Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 1000)),
  
  /**
   * Format milliseconds to human readable
   */
  formatDuration: (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  },
  
  /**
   * Get timing based on environment
   */
  getEnvTiming: <T>(prodValue: T, devValue: T): T => {
    return process.env.NODE_ENV === 'development' ? devValue : prodValue
  }
}

// Type exports for type safety
export type OtpTiming = typeof OTP_TIMING
export type EmailTiming = typeof EMAIL_TIMING
export type ApiTiming = typeof API_TIMING
export type CacheTiming = typeof CACHE_TIMING
export type RateLimiting = typeof RATE_LIMITING
export type BusinessTiming = typeof BUSINESS_TIMING
export type PerformanceTiming = typeof PERFORMANCE_TIMING
export type UiTiming = typeof UI_TIMING
export type DevTiming = typeof DEV_TIMING