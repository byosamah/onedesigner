/**
 * Secure logging utility that sanitizes sensitive data
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  sessionId?: string
  endpoint?: string
  [key: string]: any
}

const SENSITIVE_FIELDS = [
  'password',
  'email',
  'token',
  'apiKey',
  'secret',
  'phone',
  'address',
  'ssn',
  'credit_card',
  'DEEPSEEK_API_KEY',
  'LEMONSQUEEZY_API_KEY',
  'NEXTAUTH_SECRET'
]

function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase()
    const isSensitive = SENSITIVE_FIELDS.some(field => keyLower.includes(field))
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

export class SecureLogger {
  private static instance: SecureLogger
  
  static getInstance(): SecureLogger {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger()
    }
    return SecureLogger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      return level === 'warn' || level === 'error'
    }
    return true
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const sanitizedContext = context ? sanitizeData(context) : {}
    
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      context: sanitizedContext,
      env: process.env.NODE_ENV
    })
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        }
      }
      console.error(this.formatMessage('error', message, errorContext))
    }
  }

  // Utility method to sanitize data before logging
  sanitize(data: any): any {
    return sanitizeData(data)
  }
}

// Export singleton instance
export const logger = SecureLogger.getInstance()

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context)
}