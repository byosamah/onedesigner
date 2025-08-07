import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { performanceMiddleware, performanceMonitorPaths } from '@/middleware/performance'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
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