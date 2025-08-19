import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/session-handlers'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get raw cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Try to validate session
    const sessionResult = await validateSession('CLIENT')
    
    // Get specific client cookie
    const clientCookie = cookieStore.get('client_session')
    
    return NextResponse.json({
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      clientCookie: clientCookie ? { exists: true, valueLength: clientCookie.value?.length } : { exists: false },
      sessionValidation: {
        valid: sessionResult.valid,
        hasSession: !!sessionResult.session,
        hasClientId: !!sessionResult.clientId,
        hasUser: !!sessionResult.user,
        userId: sessionResult.user?.id,
        clientId: sessionResult.clientId,
        sessionEmail: sessionResult.session?.email,
        userEmail: sessionResult.user?.email
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check session', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}