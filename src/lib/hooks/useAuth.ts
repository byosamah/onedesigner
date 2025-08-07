/**
 * useAuth hook - Centralized authentication state management
 * Provides consistent auth state and methods across components
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type AuthSession } from '@/lib/api'

interface UseAuthOptions {
  requireAuth?: boolean
  redirectTo?: string
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const { requireAuth = false, redirectTo = '/' } = options
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authService.getSession()
      
      if (response.success && response.data) {
        setSession(response.data)
      } else {
        setSession(null)
        if (requireAuth) {
          router.push(redirectTo)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error')
      setSession(null)
      if (requireAuth) {
        router.push(redirectTo)
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setSession(null)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out error')
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return {
    session,
    user: session?.user || null,
    client: session?.client || null,
    designer: session?.designer || null,
    loading,
    error,
    isAuthenticated: !!session?.user,
    signOut,
    refetch: checkSession
  }
}