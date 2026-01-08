/**
 * Session helper utilities for zero-breaking-change refactoring
 * Extracts complex session logic while maintaining backward compatibility
 */

import { createServiceClientWithoutCookies } from '@/lib/supabase/server'
import { dualLogger } from '@/lib/utils/dual-logger'

/**
 * Extract client ID from session result with multiple fallback strategies
 * Maintains exact same behavior as original inline code
 * @param sessionResult Session validation result
 * @returns Object with clientId and clientEmail if found
 */
export async function extractClientIdFromSession(sessionResult: any): Promise<{
  clientId: string | null
  clientEmail: string | null
}> {
  // Try primary extraction methods
  let clientId = sessionResult.clientId || sessionResult.user?.id
  let clientEmail = sessionResult.user?.email || sessionResult.session?.email

  // If we don't have a client ID but have an email, look it up directly
  // This maintains exact behavior from original implementation
  if (!clientId && clientEmail) {
    dualLogger.info('Session missing clientId, looking up by email:', clientEmail)

    try {
      const supabase = createServiceClientWithoutCookies()
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('email', clientEmail)
        .single()

      if (clientData) {
        clientId = clientData.id
        dualLogger.info('Found client ID from database:', clientId)
      }
    } catch (error) {
      // Silently handle lookup errors to maintain backward compatibility
      dualLogger.debug('Client lookup by email failed:', error)
    }
  }

  return { clientId, clientEmail }
}

/**
 * Validate session and extract user information
 * Backward-compatible wrapper for session validation
 * @param sessionResult Raw session result
 * @param userType Expected user type
 * @returns Validated session with extracted IDs
 */
export function validateAndExtractSession(sessionResult: any, userType: string) {
  const isValid = sessionResult.valid || sessionResult.success

  // Extract relevant IDs based on user type
  let userId: string | null = null
  let userEmail: string | null = null

  switch (userType) {
    case 'CLIENT':
    case 'client':
      userId = sessionResult.clientId || sessionResult.user?.id
      userEmail = sessionResult.user?.email || sessionResult.session?.email
      break

    case 'DESIGNER':
    case 'designer':
      userId = sessionResult.designerId || sessionResult.user?.id
      userEmail = sessionResult.user?.email || sessionResult.session?.email
      break

    case 'ADMIN':
    case 'admin':
      userId = sessionResult.adminId || sessionResult.user?.id
      userEmail = sessionResult.user?.email || sessionResult.session?.email
      break

    default:
      userId = sessionResult.user?.id
      userEmail = sessionResult.user?.email || sessionResult.session?.email
  }

  return {
    valid: isValid,
    userId,
    userEmail,
    originalResult: sessionResult // Preserve original for backward compatibility
  }
}

/**
 * Check if session has required permissions
 * Helper for authorization checks
 * @param sessionResult Session result
 * @param requiredRole Required user role
 * @returns Boolean indicating if authorized
 */
export function hasRequiredRole(sessionResult: any, requiredRole: string): boolean {
  const userRole = sessionResult.role || sessionResult.user?.role || sessionResult.session?.role

  // Handle case-insensitive comparison
  const normalizedUserRole = userRole?.toLowerCase()
  const normalizedRequiredRole = requiredRole.toLowerCase()

  return normalizedUserRole === normalizedRequiredRole
}

/**
 * Extract correlation/request ID from session or context
 * Useful for request tracking across services
 * @param sessionResult Session result or request context
 * @returns Request ID if available
 */
export function extractRequestId(sessionResult: any): string | undefined {
  return sessionResult.requestId ||
         sessionResult.context?.requestId ||
         sessionResult.correlationId ||
         sessionResult.headers?.['x-request-id']
}

// Export all helpers for convenience
export default {
  extractClientIdFromSession,
  validateAndExtractSession,
  hasRequiredRole,
  extractRequestId
}