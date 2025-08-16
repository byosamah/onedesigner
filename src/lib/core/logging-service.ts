/**
 * Phase 6: Centralized Logging Service
 * 
 * Replaces 493 console.log statements with structured logging
 * Features: Correlation IDs, user context, performance timing, error aggregation
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  correlationId: string
  requestId?: string
  userId?: string
  userType?: 'client' | 'designer' | 'admin'
  context?: Record<string, any>
  stack?: string
  performance?: {
    duration?: number
    memoryUsage?: number
  }
  service?: string
  file?: string
  line?: number
  function?: string
}

export interface LoggingConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableRemote: boolean
  redactKeys: string[]
  maxContextDepth: number
}

/**
 * Centralized Logging Service with correlation ID support
 * Replaces all console.log statements with structured logging
 */
export class LoggingService {
  private static instance: LoggingService
  private correlationId: string
  private requestContext: Map<string, any> = new Map()
  private performanceMarks: Map<string, number> = new Map()
  private config: LoggingConfig
  private buffer: LogEntry[] = []
  private bufferSize = 100

  private constructor() {
    // Generate initial correlation ID
    this.correlationId = this.generateCorrelationId()
    
    this.config = {
      minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
      enableConsole: process.env.NODE_ENV !== 'production',
      enableFile: process.env.ENABLE_FILE_LOGGING === 'true',
      enableRemote: process.env.ENABLE_REMOTE_LOGGING === 'true',
      redactKeys: ['password', 'token', 'secret', 'api_key', 'credit_card', 'otp', 'code'],
      maxContextDepth: 5
    }
  }

  static getInstance(): LoggingService {
    if (!this.instance) {
      this.instance = new LoggingService()
    }
    return this.instance
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Set correlation ID for request tracking
   */
  setCorrelationId(id?: string): string {
    this.correlationId = id || this.generateCorrelationId()
    return this.correlationId
  }

  getCorrelationId(): string {
    return this.correlationId
  }

  /**
   * Set user context for all subsequent logs
   */
  setUserContext(userId: string, userType: 'client' | 'designer' | 'admin'): void {
    this.requestContext.set('userId', userId)
    this.requestContext.set('userType', userType)
  }

  /**
   * Set request context
   */
  setRequestContext(key: string, value: any): void {
    this.requestContext.set(key, value)
  }

  /**
   * Clear context (call at end of request)
   */
  clearContext(): void {
    this.requestContext.clear()
    this.performanceMarks.clear()
    this.correlationId = this.generateCorrelationId()
  }

  /**
   * Start performance timing
   */
  startTimer(label: string): void {
    this.performanceMarks.set(label, Date.now())
  }

  /**
   * End performance timing and log
   */
  endTimer(label: string, message?: string): number {
    const start = this.performanceMarks.get(label)
    if (!start) {
      this.warn(`Timer '${label}' was not started`)
      return 0
    }

    const duration = Date.now() - start
    this.performanceMarks.delete(label)

    this.info(message || `${label} completed`, {
      performance: { duration },
      timerLabel: label
    })

    return duration
  }

  /**
   * Main logging methods
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : error
    }

    this.log('error', message, errorContext, error?.stack)
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, stack?: string): void {
    // Check if we should use centralized logging (check env directly to avoid circular dependency)
    if (process.env.USE_CENTRALIZED_LOGGING !== 'true') {
      // Fallback to console.log for backward compatibility
      this.legacyLog(level, message, context)
      return
    }

    // Check minimum log level
    if (!this.shouldLog(level)) {
      return
    }

    // Get caller information
    const caller = this.getCallerInfo()

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      correlationId: this.correlationId,
      requestId: this.requestContext.get('requestId'),
      userId: this.requestContext.get('userId'),
      userType: this.requestContext.get('userType'),
      context: this.sanitizeContext(context),
      stack: process.env.NODE_ENV === 'development' ? stack : undefined,
      service: 'onedesigner',
      file: caller.file,
      line: caller.line,
      function: caller.function
    }

    // Add to buffer for batch processing
    this.buffer.push(entry)
    if (this.buffer.length >= this.bufferSize) {
      this.flush()
    }

    // Output based on configuration
    this.output(entry)
  }

  /**
   * Legacy console.log wrapper for backward compatibility
   */
  private legacyLog(level: LogLevel, message: string, context?: any): void {
    const consoleMethods = {
      debug: console.log,
      info: console.log,
      warn: console.warn,
      error: console.error
    }

    const method = consoleMethods[level] || console.log
    
    if (context) {
      method(message, context)
    } else {
      method(message)
    }
  }

  /**
   * Check if should log based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const minLevelIndex = levels.indexOf(this.config.minLevel)
    const levelIndex = levels.indexOf(level)
    return levelIndex >= minLevelIndex
  }

  /**
   * Get caller information from stack trace
   */
  private getCallerInfo(): { file?: string; line?: number; function?: string } {
    if (process.env.NODE_ENV === 'production') {
      return {} // Skip in production for performance
    }

    // Skip in Edge Runtime to avoid Node.js API errors
    try {
      if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
        return {}
      }
    } catch {
      return {}
    }

    const stack = new Error().stack
    if (!stack) return {}

    const lines = stack.split('\n')
    // Skip first 4 lines (Error, this function, log function, public method)
    const callerLine = lines[4]
    
    if (!callerLine) return {}

    const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)
    if (match) {
      try {
        const cwd = process.cwd()
        let file = match[2]
        if (cwd) {
          file = file.replace(cwd, '')
        }
        file = file.replace('/Users/osamakhalil/OneDesigner', '')
        
        return {
          function: match[1],
          file,
          line: parseInt(match[3])
        }
      } catch {
        // Edge Runtime fallback
        return {
          function: match[1],
          file: match[2],
          line: parseInt(match[3])
        }
      }
    }

    return {}
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context?: Record<string, any>, depth = 0): Record<string, any> | undefined {
    if (!context) return undefined
    if (depth > this.config.maxContextDepth) return { _truncated: true }

    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(context)) {
      // Check if key contains sensitive data
      const isRedacted = this.config.redactKeys.some(
        redactKey => key.toLowerCase().includes(redactKey.toLowerCase())
      )

      if (isRedacted) {
        sanitized[key] = '[REDACTED]'
      } else if (value && typeof value === 'object') {
        sanitized[key] = Array.isArray(value) 
          ? value.map(v => typeof v === 'object' ? this.sanitizeContext(v, depth + 1) : v)
          : this.sanitizeContext(value, depth + 1)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Output log entry based on configuration
   */
  private output(entry: LogEntry): void {
    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry)
    }

    // File output (would write to file system)
    if (this.config.enableFile) {
      this.outputToFile(entry)
    }

    // Remote output (would send to logging service)
    if (this.config.enableRemote) {
      this.outputToRemote(entry)
    }
  }

  /**
   * Output to console with formatting
   */
  private outputToConsole(entry: LogEntry): void {
    // Store original console.log to avoid circular dependency
    const originalLog = (global as any).__originalConsole?.log || 
                       (console as any).__proto__.log ||
                       (() => {})

    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m'  // Red
    }

    const reset = '\x1b[0m'
    const color = colors[entry.level]

    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    const correlationId = entry.correlationId.substring(0, 8)

    let output = `${color}[${timestamp}] ${level}${reset} [${correlationId}] ${entry.message}`

    if (entry.userId) {
      output += ` [${entry.userType}:${entry.userId.substring(0, 8)}]`
    }

    if (entry.file && process.env.NODE_ENV === 'development') {
      output += ` ${entry.file}:${entry.line}`
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      if (process.env.NODE_ENV === 'development') {
        output += '\n' + JSON.stringify(entry.context, null, 2)
      } else {
        output += ' ' + JSON.stringify(entry.context)
      }
    }

    // Use the original console.log to avoid recursion
    originalLog.call(console, output)
  }

  /**
   * Output to file (placeholder for future implementation)
   */
  private outputToFile(entry: LogEntry): void {
    // In production, this would write to a log file
    // For now, we'll just note that it would be written
    if (process.env.NODE_ENV === 'development') {
      // Would write to: ./logs/onedesigner-YYYY-MM-DD.log
    }
  }

  /**
   * Output to remote logging service (placeholder for future implementation)
   */
  private outputToRemote(entry: LogEntry): void {
    // In production, this would send to a service like Datadog, New Relic, etc.
    // For now, we'll buffer and batch send when implemented
  }

  /**
   * Flush buffered logs
   */
  private flush(): void {
    if (this.buffer.length === 0) return

    // In production, this would batch send to remote service
    // For now, we'll just clear the buffer
    if (this.config.enableRemote) {
      // Would send this.buffer to remote service
    }
    
    this.buffer = []
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>): LoggingServiceChild {
    return new LoggingServiceChild(this, context)
  }
}

/**
 * Child logger with additional context
 */
export class LoggingServiceChild {
  constructor(
    private parent: LoggingService,
    private additionalContext: Record<string, any>
  ) {}

  debug(message: string, context?: Record<string, any>): void {
    this.parent.debug(message, { ...this.additionalContext, ...context })
  }

  info(message: string, context?: Record<string, any>): void {
    this.parent.info(message, { ...this.additionalContext, ...context })
  }

  warn(message: string, context?: Record<string, any>): void {
    this.parent.warn(message, { ...this.additionalContext, ...context })
  }

  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    this.parent.error(message, error, { ...this.additionalContext, ...context })
  }
}

// Export singleton instance
export const logger = LoggingService.getInstance()

// Export convenience methods for easy migration
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, error?: Error | any, context?: Record<string, any>) => 
    logger.error(message, error, context),
  startTimer: (label: string) => logger.startTimer(label),
  endTimer: (label: string, message?: string) => logger.endTimer(label, message),
  setCorrelationId: (id?: string) => logger.setCorrelationId(id),
  setUserContext: (userId: string, userType: 'client' | 'designer' | 'admin') => 
    logger.setUserContext(userId, userType),
  child: (context: Record<string, any>) => logger.child(context),
  clearContext: () => logger.clearContext()
}

// Backward compatibility: Replace console methods in development
// Check environment variable directly to avoid circular dependency with Features
if (process.env.NODE_ENV === 'development' && process.env.USE_CENTRALIZED_LOGGING === 'true') {
  // Store original console methods globally before overriding
  (global as any).__originalConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    debug: console.debug.bind(console)
  }

  // Override console methods to use logger
  console.log = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')
    logger.info(message)
  }

  console.error = (...args: any[]) => {
    const message = args[0]
    const error = args[1]
    logger.error(String(message), error)
  }

  console.warn = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')
    logger.warn(message)
  }

  console.debug = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')
    logger.debug(message)
  }
}