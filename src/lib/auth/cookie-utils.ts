/**
 * Cookie utilities for backward-compatible session management
 */

import { cookies } from 'next/headers'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

/**
 * Get designer session cookie with backward compatibility
 * Checks both the new constant-based name and any legacy names
 */
export function getDesignerSessionCookie() {
  const cookieStore = cookies()
  
  // Primary cookie name from constants
  let sessionCookie = cookieStore.get(AUTH_COOKIES.DESIGNER)
  
  // Backward compatibility: check for any legacy cookie names
  // This ensures existing sessions continue to work during migration
  if (!sessionCookie) {
    // Check for potential mismatched names
    const legacyNames = ['designer-session', 'designer_auth', 'designer_session']
    
    for (const name of legacyNames) {
      sessionCookie = cookieStore.get(name)
      if (sessionCookie) {
        logger.warn(`Found designer session under legacy cookie name: ${name}`)
        break
      }
    }
  }
  
  return sessionCookie
}

/**
 * Get client session cookie with backward compatibility
 */
export function getClientSessionCookie() {
  const cookieStore = cookies()
  
  // Primary cookie name from constants
  let sessionCookie = cookieStore.get(AUTH_COOKIES.CLIENT)
  
  // Backward compatibility
  if (!sessionCookie) {
    const legacyNames = ['client-auth', 'client_session', 'client_auth']
    
    for (const name of legacyNames) {
      sessionCookie = cookieStore.get(name)
      if (sessionCookie) {
        logger.warn(`Found client session under legacy cookie name: ${name}`)
        break
      }
    }
  }
  
  return sessionCookie
}

/**
 * Get admin session cookie with backward compatibility
 */
export function getAdminSessionCookie() {
  const cookieStore = cookies()
  
  // Primary cookie name from constants
  let sessionCookie = cookieStore.get(AUTH_COOKIES.ADMIN)
  
  // Backward compatibility
  if (!sessionCookie) {
    const legacyNames = ['admin-auth', 'admin_session', 'admin_auth']
    
    for (const name of legacyNames) {
      sessionCookie = cookieStore.get(name)
      if (sessionCookie) {
        logger.warn(`Found admin session under legacy cookie name: ${name}`)
        break
      }
    }
  }
  
  return sessionCookie
}

/**
 * Parse session data from cookie value
 * Handles both string and object formats for compatibility
 */
export function parseSessionCookie(cookieValue: string | undefined): any {
  if (!cookieValue) return null
  
  try {
    // Try to parse as JSON
    return JSON.parse(cookieValue)
  } catch (error) {
    // If parsing fails, it might be a different format
    logger.error('Failed to parse session cookie:', error)
    return null
  }
}

/**
 * Clear all possible session cookies for a user type
 * Ensures complete logout even with legacy cookie names
 */
export function clearSessionCookies(userType: 'designer' | 'client' | 'admin') {
  const cookieStore = cookies()
  
  const cookieNames = {
    designer: [AUTH_COOKIES.DESIGNER, 'designer-session', 'designer_auth', 'designer_session'],
    client: [AUTH_COOKIES.CLIENT, 'client-auth', 'client_session', 'client_auth'],
    admin: [AUTH_COOKIES.ADMIN, 'admin-auth', 'admin_session', 'admin_auth']
  }
  
  const namesToClear = cookieNames[userType] || []
  
  for (const name of namesToClear) {
    try {
      cookieStore.delete(name)
    } catch (error) {
      // Cookie might not exist, that's okay
    }
  }
}

/**
 * Migrate legacy cookie to new standard name
 * Call this when you find a legacy cookie to gradually migrate
 */
export function migrateCookieToStandard(
  userType: 'designer' | 'client' | 'admin',
  sessionData: any
) {
  const cookieStore = cookies()
  
  const standardNames = {
    designer: AUTH_COOKIES.DESIGNER,
    client: AUTH_COOKIES.CLIENT,
    admin: AUTH_COOKIES.ADMIN
  }
  
  const standardName = standardNames[userType]
  
  // Set the new standard cookie
  cookieStore.set(standardName, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  })
  
  logger.info(`Migrated ${userType} session to standard cookie name: ${standardName}`)
}