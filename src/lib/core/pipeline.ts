import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AUTH_COOKIES, API_TIMING, RATE_LIMITING } from '@/lib/constants'
import { ErrorManager } from './error-manager'
import { logger } from '@/lib/core/logging-service'

// Enhanced request interface with middleware additions
export interface AuthenticatedRequest extends NextRequest {
  session?: any
  userId?: string
  clientId?: string
  designerId?: string
  adminId?: string
  validated?: any
  rateLimitInfo?: {
    remaining: number
    resetTime: number
    limit: number
  }
  context?: {
    startTime: number
    requestId: string
    userAgent?: string
    ip?: string
  }
}

// Middleware function type
export type Middleware = (
  req: AuthenticatedRequest,
  next: () => Promise<NextResponse>
) => Promise<NextResponse>

// Handler function type
export type Handler = (
  req: AuthenticatedRequest,
  context?: any
) => Promise<NextResponse>

// Pipeline configuration
export interface PipelineConfig {
  skipMiddleware?: string[]
  timeout?: number
  enableLogging?: boolean
  enableMetrics?: boolean
}

/**
 * Request Pipeline for consistent middleware processing
 * Handles authentication, validation, rate limiting, and other cross-cutting concerns
 */
export class RequestPipeline {
  private middlewares: Array<{ name: string; middleware: Middleware }> = []
  private errorManager = ErrorManager.getInstance()
  private config: PipelineConfig

  constructor(config: PipelineConfig = {}) {
    this.config = {
      skipMiddleware: [],
      timeout: API_TIMING.DEFAULT_TIMEOUT_MS,
      enableLogging: true,
      enableMetrics: true,
      ...config
    }
  }

  /**
   * Add middleware to the pipeline
   */
  use(name: string, middleware: Middleware): this {
    this.middlewares.push({ name, middleware })
    return this
  }

  /**
   * Execute the pipeline with a handler
   */
  async execute(
    request: NextRequest,
    handler: Handler,
    context?: any
  ): Promise<NextResponse> {
    // Initialize enhanced request
    const req = this.initializeRequest(request)
    
    // Apply timeout if configured
    if (this.config.timeout) {
      return Promise.race([
        this.processRequest(req, handler, context),
        this.createTimeoutResponse(this.config.timeout)
      ])
    }

    return this.processRequest(req, handler, context)
  }

  /**
   * Process request through middleware chain
   */
  private async processRequest(
    req: AuthenticatedRequest,
    handler: Handler,
    context?: any
  ): Promise<NextResponse> {
    let index = 0
    const activeMiddlewares = this.middlewares.filter(
      m => !this.config.skipMiddleware?.includes(m.name)
    )

    const next = async (): Promise<NextResponse> => {
      // If we've processed all middleware, call the handler
      if (index >= activeMiddlewares.length) {
        const startTime = Date.now()
        
        try {
          const response = await handler(req, context)
          
          // Log metrics if enabled
          if (this.config.enableMetrics) {
            const duration = Date.now() - startTime
            this.logMetrics(req, response, duration)
          }
          
          return response
        } catch (error) {
          return this.errorManager.handleApiError(error, req.url || 'unknown', {
            userId: req.userId,
            clientId: req.clientId,
            designerId: req.designerId,
            requestId: req.context?.requestId,
            operation: 'pipeline_handler'
          })
        }
      }

      // Get current middleware
      const { name, middleware } = activeMiddlewares[index++]
      
      if (this.config.enableLogging) {
        logger.info(`🔧 Pipeline: Executing middleware "${name}"`)
      }

      try {
        return await middleware(req, next)
      } catch (error) {
        logger.error(`❌ Pipeline: Middleware "${name}" failed:`, error)
        return this.errorManager.handleApiError(error, req.url || 'unknown', {
          userId: req.userId,
          operation: `middleware_${name}`,
          requestId: req.context?.requestId
        })
      }
    }

    return next()
  }

  /**
   * Initialize request with context and timing
   */
  private initializeRequest(request: NextRequest): AuthenticatedRequest {
    const req = request as AuthenticatedRequest
    
    req.context = {
      startTime: Date.now(),
      requestId: this.generateRequestId(),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown'
    }

    if (this.config.enableLogging) {
      logger.info(`🚀 Pipeline: Started request ${req.context.requestId} to ${request.url}`)
    }

    return req
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log performance metrics
   */
  private logMetrics(
    req: AuthenticatedRequest,
    response: NextResponse,
    duration: number
  ): void {
    logger.info(`📊 Pipeline: Request ${req.context?.requestId} completed in ${duration}ms (${response.status})`)
  }

  /**
   * Create timeout response
   */
  private async createTimeoutResponse(timeout: number): Promise<NextResponse> {
    await new Promise(resolve => setTimeout(resolve, timeout))
    return NextResponse.json({
      success: false,
      error: {
        code: 'REQUEST_TIMEOUT',
        message: `Request timed out after ${timeout}ms`
      }
    }, { status: 408 })
  }

  /**
   * Create a new pipeline instance with default middleware
   */
  static create(config?: PipelineConfig): RequestPipeline {
    return new RequestPipeline(config)
  }
}

// ==================== PRE-BUILT MIDDLEWARES ====================

/**
 * Authentication middleware
 * Validates session and attaches user info to request
 */
export const authMiddleware = (
  userType: 'client' | 'designer' | 'admin' = 'client'
): Middleware => {
  return async (req: AuthenticatedRequest, next) => {
    try {
      const cookieStore = cookies()
      const cookieName = userType === 'client' ? AUTH_COOKIES.CLIENT :
                        userType === 'designer' ? AUTH_COOKIES.DESIGNER :
                        AUTH_COOKIES.ADMIN

      const sessionCookie = cookieStore.get(cookieName)

      if (!sessionCookie) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        }, { status: 401 })
      }

      // Parse and validate session
      const session = JSON.parse(sessionCookie.value)
      req.session = session

      // Attach user IDs based on type
      if (userType === 'client' && session.clientId) {
        req.clientId = session.clientId
        req.userId = session.clientId
      } else if (userType === 'designer' && session.designerId) {
        req.designerId = session.designerId
        req.userId = session.designerId
      } else if (userType === 'admin' && session.adminId) {
        req.adminId = session.adminId
        req.userId = session.adminId
      }

      if (!req.userId) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Invalid session data'
          }
        }, { status: 401 })
      }

      return next()
    } catch (error) {
      logger.error('Auth middleware error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication failed'
        }
      }, { status: 401 })
    }
  }
}

/**
 * Validation middleware factory
 * Validates request body against a schema
 */
export const validationMiddleware = (
  schema: any,
  options?: { 
    validateBody?: boolean
    validateQuery?: boolean
    validateParams?: boolean
  }
): Middleware => {
  const opts = {
    validateBody: true,
    validateQuery: false,
    validateParams: false,
    ...options
  }

  return async (req: AuthenticatedRequest, next) => {
    try {
      const validation: any = {}

      // Validate request body
      if (opts.validateBody && req.method !== 'GET') {
        try {
          const body = await req.json()
          validation.body = schema.parse ? schema.parse(body) : body
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request body',
              details: error
            }
          }, { status: 400 })
        }
      }

      // Validate query parameters
      if (opts.validateQuery) {
        const url = new URL(req.url)
        const query = Object.fromEntries(url.searchParams)
        validation.query = query
      }

      // Attach validated data to request
      req.validated = validation

      return next()
    } catch (error) {
      logger.error('Validation middleware error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed'
        }
      }, { status: 400 })
    }
  }
}

/**
 * Rate limiting middleware
 * Simple in-memory rate limiter (in production, use Redis)
 */
export const rateLimitMiddleware = (
  options: {
    windowMs?: number
    max?: number
    keyGenerator?: (req: AuthenticatedRequest) => string
    skipSuccessfulRequests?: boolean
  } = {}
): Middleware => {
  const opts = {
    windowMs: RATE_LIMITING.WINDOW_15_MIN,
    max: RATE_LIMITING.API_REQUESTS_PER_MINUTE,
    keyGenerator: (req: AuthenticatedRequest) => req.userId || req.context?.ip || 'anonymous',
    skipSuccessfulRequests: false,
    ...options
  }

  // Simple in-memory store (use Redis in production)
  const store = new Map<string, { count: number; resetTime: number }>()

  return async (req: AuthenticatedRequest, next) => {
    const key = opts.keyGenerator(req)
    const now = Date.now()
    const windowStart = now - opts.windowMs

    // Clean up old entries
    for (const [k, v] of store.entries()) {
      if (v.resetTime < windowStart) {
        store.delete(k)
      }
    }

    // Get or create entry
    let entry = store.get(key)
    if (!entry || entry.resetTime < windowStart) {
      entry = { count: 0, resetTime: now + opts.windowMs }
      store.set(key, entry)
    }

    // Check rate limit
    if (entry.count >= opts.max) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          details: {
            limit: opts.max,
            windowMs: opts.windowMs,
            resetTime: entry.resetTime
          }
        }
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': opts.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString()
        }
      })
    }

    // Increment counter
    entry.count++

    // Add rate limit info to request
    req.rateLimitInfo = {
      remaining: Math.max(0, opts.max - entry.count),
      resetTime: entry.resetTime,
      limit: opts.max
    }

    // Execute handler
    const response = await next()

    // Reset counter if request was successful and skipSuccessfulRequests is true
    if (opts.skipSuccessfulRequests && response.status < 400) {
      entry.count--
    }

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', opts.max.toString())
    response.headers.set('X-RateLimit-Remaining', req.rateLimitInfo.remaining.toString())
    response.headers.set('X-RateLimit-Reset', req.rateLimitInfo.resetTime.toString())

    return response
  }
}

/**
 * CORS middleware
 */
export const corsMiddleware = (
  options: {
    origin?: string | string[]
    methods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  } = {}
): Middleware => {
  const opts = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
    ...options
  }

  return async (req: AuthenticatedRequest, next) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': Array.isArray(opts.origin) ? opts.origin.join(', ') : opts.origin,
          'Access-Control-Allow-Methods': opts.methods.join(', '),
          'Access-Control-Allow-Headers': opts.allowedHeaders.join(', '),
          'Access-Control-Allow-Credentials': opts.credentials.toString()
        }
      })
    }

    const response = await next()

    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', Array.isArray(opts.origin) ? opts.origin.join(', ') : opts.origin)
    response.headers.set('Access-Control-Allow-Credentials', opts.credentials.toString())

    return response
  }
}

/**
 * Logging middleware
 */
export const loggingMiddleware = (
  options: {
    includeBody?: boolean
    includeHeaders?: boolean
    excludePaths?: string[]
  } = {}
): Middleware => {
  const opts = {
    includeBody: false,
    includeHeaders: false,
    excludePaths: ['/api/health'],
    ...options
  }

  return async (req: AuthenticatedRequest, next) => {
    const url = new URL(req.url)
    
    // Skip excluded paths
    if (opts.excludePaths.some(path => url.pathname.startsWith(path))) {
      return next()
    }

    const startTime = Date.now()
    
    // Log request
    const logData: any = {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
      userId: req.userId,
      requestId: req.context?.requestId
    }

    if (opts.includeHeaders) {
      logData.headers = Object.fromEntries(req.headers.entries())
    }

    if (opts.includeBody && req.method !== 'GET') {
      try {
        logData.body = await req.clone().json()
      } catch {
        // Body not JSON, skip
      }
    }

    logger.info('📝 Request:', logData)

    const response = await next()
    const duration = Date.now() - startTime

    // Log response
    logger.info('📝 Response:', {
      requestId: req.context?.requestId,
      status: response.status,
      duration: `${duration}ms`
    })

    return response
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a pipeline with common middleware
 */
export function createAuthenticatedPipeline(
  userType: 'client' | 'designer' | 'admin' = 'client',
  options?: {
    enableRateLimit?: boolean
    enableCors?: boolean
    enableLogging?: boolean
    rateLimit?: Parameters<typeof rateLimitMiddleware>[0]
  }
): RequestPipeline {
  const pipeline = RequestPipeline.create()

  // Add CORS if enabled
  if (options?.enableCors !== false) {
    pipeline.use('cors', corsMiddleware())
  }

  // Add logging if enabled
  if (options?.enableLogging) {
    pipeline.use('logging', loggingMiddleware())
  }

  // Add rate limiting if enabled
  if (options?.enableRateLimit) {
    pipeline.use('rateLimit', rateLimitMiddleware(options.rateLimit))
  }

  // Always add authentication
  pipeline.use('auth', authMiddleware(userType))

  return pipeline
}

/**
 * Wrapper function for easy API route integration
 */
export function withPipeline(
  handler: Handler,
  middlewares?: Array<{ name: string; middleware: Middleware }>,
  config?: PipelineConfig
) {
  return async (request: NextRequest, context?: any) => {
    const pipeline = RequestPipeline.create(config)
    
    // Add custom middlewares
    if (middlewares) {
      middlewares.forEach(({ name, middleware }) => {
        pipeline.use(name, middleware)
      })
    }

    return pipeline.execute(request, handler, context)
  }
}