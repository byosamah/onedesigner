import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { performanceMiddleware, performanceMonitorPaths } from '@/middleware/performance'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public routes that don't need authentication
  const publicRoutes = [
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
    '/favicon.ico',
    '/logo.svg',
    '/icon.svg'
  ]
  
  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/test-redesign'))) {
    return NextResponse.next()
  }
  
  // Apply performance monitoring to specific API routes
  if (performanceMonitorPaths.some(path => pathname.startsWith(path))) {
    performanceMiddleware(request)
  }
  
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