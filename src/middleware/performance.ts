import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/monitoring/performance'

export function performanceMiddleware(request: NextRequest) {
  const startTime = Date.now()
  const pathname = request.nextUrl.pathname
  const method = request.method

  // Track API request
  const timerKey = `api_${method}_${pathname.replace(/\//g, '_')}`
  performanceMonitor.startTimer(timerKey)

  // Clone headers for response modification
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-start', startTime.toString())

  // Continue with request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add performance headers to response
  const duration = Date.now() - startTime
  response.headers.set('x-response-time', `${duration}ms`)
  response.headers.set('x-request-path', pathname)

  // End timer
  performanceMonitor.endTimer(timerKey)

  // Log slow requests (disabled in middleware due to Edge Runtime)
  if (duration > 1000) {
    console.warn(`[PERF] Slow request: ${method} ${pathname} took ${duration}ms`)
  }

  return response
}

// Paths to monitor
export const performanceMonitorPaths = [
  '/api/match/find',
  '/api/match/find-optimized',
  '/api/client/matches',
  '/api/briefs/create',
  '/api/checkout/create',
  '/api/cron/embeddings'
]