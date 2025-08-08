import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { performanceMiddleware, performanceMonitorPaths } from '@/middleware/performance'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip all middleware for static assets
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Public routes that don't need authentication
  const publicPaths = [
    '/',
    '/brief',
    '/brief/contact',
    '/brief/details',
    '/designer/apply',
    '/designer/apply/verify',
    '/designer/login',
    '/designer/login/verify',
    '/admin',
    '/admin/verify',
    '/auth/verify',
    '/api/health',
    '/api/check-env',
    '/api/auth/send-otp',
    '/api/auth/verify-otp',
    '/api/briefs/create',
    '/api/designer/apply',
    '/api/designer/verify',
    '/api/admin/auth/send-otp',
    '/api/admin/auth/verify',
  ]
  
  // Check if it's a public route
  const isPublicRoute = publicPaths.some(path => pathname === path)
  
  // Skip auth for public routes and test routes
  if (isPublicRoute || pathname.startsWith('/test-redesign')) {
    // Apply performance monitoring if needed
    if (performanceMonitorPaths.some(path => pathname.startsWith(path))) {
      performanceMiddleware(request)
    }
    return NextResponse.next()
  }
  
  // Apply performance monitoring to specific API routes
  if (performanceMonitorPaths.some(path => pathname.startsWith(path))) {
    performanceMiddleware(request)
  }
  
  // Only update session for protected routes
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}