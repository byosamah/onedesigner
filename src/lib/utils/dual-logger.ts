/**
 * Dual logging utility for zero-breaking-change migration
 * Maintains console.log for backward compatibility while adding LoggingService
 */

import { logger } from '@/lib/core/logging-service'
import { Features } from '@/lib/features'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Dual logging function that uses both console and LoggingService
 * Ensures zero breaking changes during migration
 * @param level Log level
 * @param message Log message
 * @param data Optional structured data
 */
export function logDual(level: LogLevel, message: string, data?: any) {
  // Always use console for complete backward compatibility
  switch (level) {
    case 'debug':
      console.log(message, data || '')
      break
    case 'info':
      console.log(message, data || '')
      break
    case 'warn':
      console.warn(message, data || '')
      break
    case 'error':
      console.error(message, data || '')
      break
  }

  // Also use LoggingService if enabled
  if (Features.USE_CENTRALIZED_LOGGING) {
    try {
      switch (level) {
        case 'debug':
          logger.debug(message, data)
          break
        case 'info':
          logger.info(message, data)
          break
        case 'warn':
          logger.warn(message, data)
          break
        case 'error':
          logger.error(message, data)
          break
      }
    } catch (e) {
      // Silently fail if LoggingService has issues
      // This ensures the application continues to work
    }
  }
}

/**
 * Convenience methods for different log levels
 * Drop-in replacements for console methods
 */
export const dualLogger = {
  log: (message: string, ...args: any[]) => {
    console.log(message, ...args)
    if (Features.USE_CENTRALIZED_LOGGING) {
      try {
        logger.info(message, ...args)
      } catch (e) {
        // Silent fail for backward compatibility
      }
    }
  },

  info: (message: string, ...args: any[]) => {
    console.log(message, ...args)
    if (Features.USE_CENTRALIZED_LOGGING) {
      try {
        logger.info(message, ...args)
      } catch (e) {
        // Silent fail for backward compatibility
      }
    }
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(message, ...args)
    if (Features.USE_CENTRALIZED_LOGGING) {
      try {
        logger.warn(message, ...args)
      } catch (e) {
        // Silent fail for backward compatibility
      }
    }
  },

  error: (message: string, ...args: any[]) => {
    console.error(message, ...args)
    if (Features.USE_CENTRALIZED_LOGGING) {
      try {
        logger.error(message, ...args)
      } catch (e) {
        // Silent fail for backward compatibility
      }
    }
  },

  debug: (message: string, ...args: any[]) => {
    console.log(message, ...args)
    if (Features.USE_CENTRALIZED_LOGGING) {
      try {
        logger.debug(message, ...args)
      } catch (e) {
        // Silent fail for backward compatibility
      }
    }
  }
}

/**
 * Replace console methods globally (opt-in)
 * Only use this if you want to automatically dual-log all console calls
 */
export function enableGlobalDualLogging() {
  if (typeof window !== 'undefined') {
    // Browser environment
    window.console.log = dualLogger.log
    window.console.info = dualLogger.info
    window.console.warn = dualLogger.warn
    window.console.error = dualLogger.error
  } else if (typeof global !== 'undefined') {
    // Node.js environment
    global.console.log = dualLogger.log
    global.console.info = dualLogger.info
    global.console.warn = dualLogger.warn
    global.console.error = dualLogger.error
  }
}

// Export for backward compatibility
export default dualLogger