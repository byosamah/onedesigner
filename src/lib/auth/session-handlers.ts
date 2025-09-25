import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'
import { getDesignerSessionCookie, getClientSessionCookie, getAdminSessionCookie, parseSessionCookie } from './cookie-utils'
import { randomUUID } from 'crypto'

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
 * Get session data for any user type with backward compatibility
 */
export async function getSession(type: keyof typeof AUTH_COOKIES): Promise<SessionData | null> {
  try {
    let sessionCookie
    
    // Use backward-compatible cookie getters
    switch (type) {
      case 'DESIGNER':
        sessionCookie = getDesignerSessionCookie()
        break
      case 'CLIENT':
        sessionCookie = getClientSessionCookie()
        break
      case 'ADMIN':
        sessionCookie = getAdminSessionCookie()
        break
      default:
        const cookieStore = cookies()
        sessionCookie = cookieStore.get(AUTH_COOKIES[type])
    }
    
    logger.info(`🍪 Looking for ${type} cookie: ${sessionCookie ? 'Found' : 'Not found'}`)
    
    if (!sessionCookie) return null
    
    const session = parseSessionCookie(sessionCookie.value)
    if (!session) return null
    
    logger.info(`🍪 Session parsed for ${type}`)
    
    // Validate session structure
    if (!session.email) return null
    
    // Add user type based on cookie type
    session.userType = type.toLowerCase() as 'client' | 'designer' | 'admin'
    
    return session
  } catch (error) {
    logger.error(`Error parsing ${type} session:`, error)
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
 * Validate session and return user data with multiple compatibility properties
 */
export async function validateSession(
  type: keyof typeof AUTH_COOKIES
): Promise<{ 
  valid: boolean; 
  success?: boolean; // For backward compatibility
  session?: SessionData; 
  user?: any;
  designerId?: string; // For designer routes
  clientId?: string; // For client routes
  adminId?: string; // For admin routes
}> {
  const session = await getSession(type)
  if (!session) return { valid: false, success: false }
  
  const supabase = createServiceClient()
  
  // Get user data based on type
  let userData = null
  let error = null
  let typeSpecificId = null
  
  switch (type) {
    case 'CLIENT':
      const clientResult = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.email)
        .single()
      userData = clientResult.data
      error = clientResult.error
      typeSpecificId = userData?.id

      // IMPORTANT: For clients, create missing client record if session is valid
      // This handles cases where the session cookie exists but user record is missing
      if (error && error.code === 'PGRST116') { // No rows found
        logger.warn(`Client session found but no database record for: ${session.email}`)
        logger.info(`Attempting to create client record for: ${session.email}`)

        try {
          // Create the missing client record
          const newClientId = session.clientId || session.userId || randomUUID()
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({
              id: newClientId,
              email: session.email,
              match_credits: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) {
            logger.error(`Failed to create client record for ${session.email}:`, createError)
            // If creation fails, fall back to mock data
            userData = {
              email: session.email,
              id: newClientId,
              match_credits: 0
            }
          } else {
            logger.info(`✅ Created client record for: ${session.email}`)
            userData = newClient
          }

          error = null
          typeSpecificId = newClientId
        } catch (createError) {
          logger.error(`Exception creating client record for ${session.email}:`, createError)
          // Fall back to mock data
          userData = {
            email: session.email,
            id: session.clientId || session.userId,
            match_credits: 0
          }
          error = null
          typeSpecificId = session.clientId || session.userId
        }
      }
      break
      
    case 'DESIGNER':
      const designerResult = await supabase
        .from('designers')
        .select('*')
        .eq('email', session.email)
        .single()
      userData = designerResult.data
      error = designerResult.error
      typeSpecificId = userData?.id
      break
      
    case 'ADMIN':
      // Verify admin email against whitelist
      const adminEmails = ['osamah96@gmail.com'] // Add other admin emails as needed
      if (!adminEmails.includes(session.email)) {
        return { valid: false, success: false }
      }
      userData = { email: session.email, role: 'admin' }
      typeSpecificId = session.email
      break
  }
  
  if (error || !userData) {
    return { valid: false, success: false }
  }
  
  // Return with multiple properties for compatibility
  const result: any = { 
    valid: true, 
    success: true, // Alias for backward compatibility
    session, 
    user: userData 
  }
  
  // Add type-specific ID for convenience
  if (type === 'DESIGNER') result.designerId = typeSpecificId
  if (type === 'CLIENT') result.clientId = typeSpecificId
  if (type === 'ADMIN') result.adminId = typeSpecificId
  
  return result
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