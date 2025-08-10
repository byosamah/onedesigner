import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { AUTH_COOKIES } from '@/lib/constants'

/**
 * Centralized session management for all user types
 * Provides consistent session handling across the application
 */

export interface SessionData {
  email: string
  userId: string
  userType: 'client' | 'designer' | 'admin'
  authenticatedAt?: string
  [key: string]: any // Allow additional properties
}

export interface ClientSessionData extends SessionData {
  userType: 'client'
  clientId: string
}

export interface DesignerSessionData extends SessionData {
  userType: 'designer'
  designerId: string
}

export interface AdminSessionData extends SessionData {
  userType: 'admin'
  adminId: string
}

/**
 * Get session data for any user type
 */
export async function getSession(type: keyof typeof AUTH_COOKIES): Promise<SessionData | null> {
  try {
    const cookieStore = cookies()
    const cookieName = AUTH_COOKIES[type]
    console.log(`🍪 Looking for cookie: ${cookieName}`)
    
    const sessionCookie = cookieStore.get(cookieName)
    console.log(`🍪 Cookie found: ${sessionCookie ? 'Yes' : 'No'}`)
    
    if (!sessionCookie) return null
    
    const session = JSON.parse(sessionCookie.value)
    console.log(`🍪 Session parsed:`, session)
    
    // Validate session structure
    if (!session.email) return null
    
    // Add user type based on cookie type
    session.userType = type.toLowerCase() as 'client' | 'designer' | 'admin'
    
    return session
  } catch (error) {
    console.error(`Error parsing ${type} session:`, error)
    return null
  }
}

/**
 * Create a new session
 */
export async function createSession(
  type: keyof typeof AUTH_COOKIES, 
  data: Partial<SessionData>
): Promise<void> {
  const cookieStore = cookies()
  
  // Ensure required fields
  const sessionData = {
    ...data,
    userType: type.toLowerCase(),
    authenticatedAt: new Date().toISOString()
  }
  
  cookieStore.set(AUTH_COOKIES[type], JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/' // Ensure cookie is accessible across all paths
  })
}

/**
 * Clear a session
 */
export async function clearSession(type: keyof typeof AUTH_COOKIES): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(AUTH_COOKIES[type])
}

/**
 * Validate session and return user data
 */
export async function validateSession(
  type: keyof typeof AUTH_COOKIES
): Promise<{ valid: boolean; session?: SessionData; user?: any }> {
  const session = await getSession(type)
  if (!session) return { valid: false }
  
  const supabase = createServiceClient()
  
  // Get user data based on type
  let userData = null
  let error = null
  
  switch (type) {
    case 'CLIENT':
      const clientResult = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.email)
        .single()
      userData = clientResult.data
      error = clientResult.error
      break
      
    case 'DESIGNER':
      const designerResult = await supabase
        .from('designers')
        .select('*')
        .eq('email', session.email)
        .single()
      userData = designerResult.data
      error = designerResult.error
      break
      
    case 'ADMIN':
      // For admin, we just validate the session exists
      // Add admin table query if needed
      userData = { email: session.email, role: 'admin' }
      break
  }
  
  if (error || !userData) {
    return { valid: false }
  }
  
  return { valid: true, session, user: userData }
}

/**
 * Refresh session expiry
 */
export async function refreshSession(type: keyof typeof AUTH_COOKIES): Promise<boolean> {
  const session = await getSession(type)
  if (!session) return false
  
  // Re-create session with updated timestamp
  await createSession(type, session)
  return true
}

/**
 * Get all active sessions (useful for debugging)
 */
export async function getAllSessions(): Promise<Record<string, SessionData | null>> {
  return {
    client: await getSession('CLIENT'),
    designer: await getSession('DESIGNER'),
    admin: await getSession('ADMIN')
  }
}

/**
 * Helper to require authentication in API routes
 */
export async function requireAuth(
  type: keyof typeof AUTH_COOKIES
): Promise<{ session: SessionData; user: any }> {
  const result = await validateSession(type)
  
  if (!result.valid || !result.session || !result.user) {
    throw new Error('Unauthorized')
  }
  
  return { session: result.session, user: result.user }
}