import { NextResponse } from 'next/server'
import { logger } from '@/lib/core/logging-service'

// Error context for better tracking
export interface ErrorContext {
  endpoint?: string
  userId?: string
  clientId?: string
  designerId?: string
  operation?: string
  requestId?: string
  userAgent?: string
  ip?: string
  timestamp?: string
  metadata?: Record<string, any>
}

// Standardized error response
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    context?: ErrorContext
    stack?: string
  }
  requestId?: string
  timestamp: string
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  EXTERNAL_API = 'external_api',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

// Error handler interface
export interface ErrorHandler {
  canHandle(error: any): boolean
  handle(error: any, context: ErrorContext): ErrorResponse
  getSeverity(error: any): ErrorSeverity
  getCategory(error: any): ErrorCategory
}

// Base error handler
abstract class BaseErrorHandler implements ErrorHandler {
  abstract canHandle(error: any): boolean
  abstract handle(error: any, context: ErrorContext): ErrorResponse
  abstract getSeverity(error: any): ErrorSeverity
  abstract getCategory(error: any): ErrorCategory

  protected createErrorResponse(
    code: string,
    message: string,
    context: ErrorContext,
    details?: any
  ): ErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        context,
        stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
      },
      requestId: context.requestId || this.generateRequestId(),
      timestamp: new Date().toISOString()
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Database error handler
class DatabaseErrorHandler extends BaseErrorHandler {
  canHandle(error: any): boolean {
    return error.name === 'DatabaseError' || 
           error.code?.startsWith('PGRST') ||
           error.message?.includes('database') ||
           error.name === 'NotFoundError' ||
           error.name === 'ValidationError'
  }

  handle(error: any, context: ErrorContext): ErrorResponse {
    let code = 'DATABASE_ERROR'
    let message = 'Database operation failed'

    // Handle specific database errors
    if (error.code === 'PGRST116') {
      code = 'RESOURCE_NOT_FOUND'
      message = 'Requested resource not found'
    } else if (error.code === '23505') {
      code = 'DUPLICATE_RESOURCE'
      message = 'Resource already exists'
    } else if (error.code === '23503') {
      code = 'FOREIGN_KEY_VIOLATION'
      message = 'Cannot delete resource due to dependencies'
    } else if (error.name === 'NotFoundError') {
      code = 'RESOURCE_NOT_FOUND'
      message = error.message
    } else if (error.name === 'ValidationError') {
      code = 'VALIDATION_ERROR'
      message = error.message
    }

    return this.createErrorResponse(code, message, context, {
      originalError: error.message,
      sqlCode: error.code
    })
  }

  getSeverity(error: any): ErrorSeverity {
    if (error.code === 'PGRST116' || error.name === 'NotFoundError') {
      return ErrorSeverity.LOW
    }
    if (error.name === 'ValidationError') {
      return ErrorSeverity.MEDIUM
    }
    return ErrorSeverity.HIGH
  }

  getCategory(): ErrorCategory {
    return ErrorCategory.DATABASE
  }
}

// Authentication error handler
class AuthErrorHandler extends BaseErrorHandler {
  canHandle(error: any): boolean {
    return error.name === 'AuthenticationError' ||
           error.message?.includes('unauthorized') ||
           error.message?.includes('session') ||
           error.message?.includes('token')
  }

  handle(error: any, context: ErrorContext): ErrorResponse {
    return this.createErrorResponse(
      'AUTHENTICATION_ERROR',
      'Authentication failed',
      context,
      { originalError: error.message }
    )
  }

  getSeverity(): ErrorSeverity {
    return ErrorSeverity.MEDIUM
  }

  getCategory(): ErrorCategory {
    return ErrorCategory.AUTHENTICATION
  }
}

// Business logic error handler
class BusinessLogicErrorHandler extends BaseErrorHandler {
  canHandle(error: any): boolean {
    return error.name === 'InsufficientCreditsError' ||
           error.name === 'BusinessLogicError' ||
           error.message?.includes('business rule')
  }

  handle(error: any, context: ErrorContext): ErrorResponse {
    let code = 'BUSINESS_LOGIC_ERROR'
    let message = error.message

    if (error.name === 'InsufficientCreditsError') {
      code = 'INSUFFICIENT_CREDITS'
      message = 'Not enough credits to perform this action'
    }

    return this.createErrorResponse(code, message, context)
  }

  getSeverity(): ErrorSeverity {
    return ErrorSeverity.LOW
  }

  getCategory(): ErrorCategory {
    return ErrorCategory.BUSINESS_LOGIC
  }
}

// External API error handler
class ExternalApiErrorHandler extends BaseErrorHandler {
  canHandle(error: any): boolean {
    return error.name === 'ExternalApiError' ||
           error.message?.includes('API') ||
           error.code >= 400 && error.code < 600
  }

  handle(error: any, context: ErrorContext): ErrorResponse {
    return this.createErrorResponse(
      'EXTERNAL_API_ERROR',
      'External service unavailable',
      context,
      { 
        statusCode: error.code,
        service: error.service || 'unknown'
      }
    )
  }

  getSeverity(error: any): ErrorSeverity {
    if (error.code >= 500) {
      return ErrorSeverity.HIGH
    }
    return ErrorSeverity.MEDIUM
  }

  getCategory(): ErrorCategory {
    return ErrorCategory.EXTERNAL_API
  }
}

// Generic error handler (fallback)
class GenericErrorHandler extends BaseErrorHandler {
  canHandle(): boolean {
    return true // Always handles as fallback
  }

  handle(error: any, context: ErrorContext): ErrorResponse {
    return this.createErrorResponse(
      'UNKNOWN_ERROR',
      error.message || 'An unexpected error occurred',
      context,
      { originalError: error.toString() }
    )
  }

  getSeverity(): ErrorSeverity {
    return ErrorSeverity.MEDIUM
  }

  getCategory(): ErrorCategory {
    return ErrorCategory.UNKNOWN
  }
}

// Logging interface
export interface Logger {
  log(level: string, message: string, data?: any): void
  error(message: string, error: any, context?: ErrorContext): void
  warn(message: string, data?: any): void
  info(message: string, data?: any): void
  debug(message: string, data?: any): void
}

// Console logger implementation
class ConsoleLogger implements Logger {
  log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    }
    
    logger.info(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data ? data : '')
  }

  error(message: string, error: any, context?: ErrorContext): void {
    this.log('error', message, { error: error.message, context })
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data)
    }
  }
}

// Monitoring service interface
export interface MonitoringService {
  trackError(error: ErrorResponse): Promise<void>
  trackMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>
  alert(severity: ErrorSeverity, message: string, context: ErrorContext): Promise<void>
}

// Simple monitoring implementation
class SimpleMonitoringService implements MonitoringService {
  async trackError(error: ErrorResponse): Promise<void> {
    // In production, this would send to monitoring service
    logger.info('📊 Error tracked:', {
      code: error.error.code,
      endpoint: error.error.context?.endpoint,
      timestamp: error.timestamp
    })
  }

  async trackMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    logger.info('📈 Metric tracked:', { name, value, tags })
  }

  async alert(severity: ErrorSeverity, message: string, context: ErrorContext): Promise<void> {
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      logger.error('🚨 ALERT:', { severity, message, context })
    }
  }
}

/**
 * Centralized Error Manager
 * Handles all error processing, logging, and monitoring
 */
export class ErrorManager {
  private static instance: ErrorManager
  private handlers: ErrorHandler[] = []
  private logger: Logger
  private monitoring: MonitoringService

  private constructor() {
    this.logger = new ConsoleLogger()
    this.monitoring = new SimpleMonitoringService()
    
    // Register error handlers in order of specificity
    this.handlers = [
      new DatabaseErrorHandler(),
      new AuthErrorHandler(),
      new BusinessLogicErrorHandler(),
      new ExternalApiErrorHandler(),
      new GenericErrorHandler() // Must be last as fallback
    ]
  }

  static getInstance(): ErrorManager {
    if (!this.instance) {
      this.instance = new ErrorManager()
    }
    return this.instance
  }

  /**
   * Handle any error and return standardized response
   */
  async handle(error: any, context: ErrorContext): Promise<ErrorResponse> {
    // Add timestamp and request ID if not present
    context.timestamp = context.timestamp || new Date().toISOString()
    context.requestId = context.requestId || this.generateRequestId()

    // Find appropriate handler
    const handler = this.handlers.find(h => h.canHandle(error))
    if (!handler) {
      throw new Error('No error handler found - this should never happen')
    }

    // Process error
    const errorResponse = handler.handle(error, context)
    const severity = handler.getSeverity(error)
    const category = handler.getCategory(error)

    // Log error
    this.logger.error(
      `[${category.toUpperCase()}] ${errorResponse.error.message}`,
      error,
      context
    )

    // Track in monitoring
    await this.monitoring.trackError(errorResponse)
    await this.monitoring.trackMetric('errors_total', 1, {
      category,
      severity,
      endpoint: context.endpoint || 'unknown'
    })

    // Send alert for high severity errors
    if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) {
      await this.monitoring.alert(severity, errorResponse.error.message, context)
    }

    return errorResponse
  }

  /**
   * Convert error response to Next.js Response
   */
  toResponse(errorResponse: ErrorResponse): NextResponse {
    const statusCode = this.getHttpStatusCode(errorResponse.error.code)
    return NextResponse.json(errorResponse, { status: statusCode })
  }

  /**
   * Convenience method for API routes
   */
  async handleApiError(
    error: any, 
    endpoint: string,
    additionalContext?: Partial<ErrorContext>
  ): Promise<NextResponse> {
    const context: ErrorContext = {
      endpoint,
      ...additionalContext
    }

    const errorResponse = await this.handle(error, context)
    return this.toResponse(errorResponse)
  }

  /**
   * Register custom error handler
   */
  registerHandler(handler: ErrorHandler): void {
    // Insert before generic handler (which should always be last)
    this.handlers.splice(-1, 0, handler)
  }

  /**
   * Set custom logger
   */
  setLogger(logger: Logger): void {
    this.logger = logger
  }

  /**
   * Set custom monitoring service
   */
  setMonitoringService(monitoring: MonitoringService): void {
    this.monitoring = monitoring
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getHttpStatusCode(errorCode: string): number {
    const statusMap: Record<string, number> = {
      'RESOURCE_NOT_FOUND': 404,
      'AUTHENTICATION_ERROR': 401,
      'AUTHORIZATION_ERROR': 403,
      'VALIDATION_ERROR': 400,
      'DUPLICATE_RESOURCE': 409,
      'INSUFFICIENT_CREDITS': 402,
      'EXTERNAL_API_ERROR': 502,
      'DATABASE_ERROR': 500,
      'BUSINESS_LOGIC_ERROR': 400,
      'UNKNOWN_ERROR': 500
    }

    return statusMap[errorCode] || 500
  }
}

// Convenience functions for API routes
export async function handleApiError(
  error: any,
  endpoint: string,
  additionalContext?: Partial<ErrorContext>
): Promise<NextResponse> {
  const errorManager = ErrorManager.getInstance()
  return errorManager.handleApiError(error, endpoint, additionalContext)
}

export function createErrorContext(
  endpoint: string,
  userId?: string,
  metadata?: Record<string, any>
): ErrorContext {
  return {
    endpoint,
    userId,
    metadata,
    timestamp: new Date().toISOString()
  }
}