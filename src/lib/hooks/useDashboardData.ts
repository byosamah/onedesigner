/**
 * Custom hook for dashboard data fetching with performance optimizations
 * Opt-in hook that can be used alongside existing inline fetching
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { dedupeRequests, withPerformanceMonitoring } from '@/lib/utils/performance'
import { dualLogger } from '@/lib/utils/dual-logger'
import type { EnhancedMatch, ClientProfile, ApiResponse } from '@/lib/types/dashboard.types'

/**
 * Hook configuration options
 */
interface UseDashboardDataOptions {
  autoFetch?: boolean // Auto-fetch on mount (default: true)
  refetchInterval?: number // Auto-refetch interval in ms (default: 0 - disabled)
  enableDeduplication?: boolean // Enable request deduplication (default: true)
  enablePerformanceMonitoring?: boolean // Enable performance logs (default: false)
}

/**
 * Hook return type
 */
interface UseDashboardDataReturn {
  client: ClientProfile | null
  matches: EnhancedMatch[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

/**
 * Create deduplicated fetch functions
 */
const fetchSessionDedupe = dedupeRequests(async () => {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
  })
  return response.json()
})

const fetchMatchesDedupe = dedupeRequests(async () => {
  const response = await fetch('/api/client/matches', {
    method: 'GET',
    credentials: 'include',
  })
  return response.json()
})

/**
 * Custom hook for fetching dashboard data with optimizations
 * Can be used as a drop-in replacement or alongside existing code
 */
export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const {
    autoFetch = true,
    refetchInterval = 0,
    enableDeduplication = true,
    enablePerformanceMonitoring = false
  } = options

  // State management
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [matches, setMatches] = useState<EnhancedMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  /**
   * Main fetch function with optional performance monitoring
   */
  const fetchDashboardData = useCallback(async (isRefetch = false) => {
    try {
      if (isRefetch) {
        setIsRefetching(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Choose fetch functions based on options
      const fetchSession = enableDeduplication ? fetchSessionDedupe :
        (async () => {
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
          })
          return response.json()
        })

      const fetchMatches = enableDeduplication ? fetchMatchesDedupe :
        (async () => {
          const response = await fetch('/api/client/matches', {
            method: 'GET',
            credentials: 'include',
          })
          return response.json()
        })

      // Apply performance monitoring if enabled
      const monitoredFetchSession = enablePerformanceMonitoring
        ? withPerformanceMonitoring(fetchSession, 'fetchSession')
        : fetchSession

      const monitoredFetchMatches = enablePerformanceMonitoring
        ? withPerformanceMonitoring(fetchMatches, 'fetchMatches')
        : fetchMatches

      // Fetch data in parallel
      const [sessionData, matchesData] = await Promise.all([
        monitoredFetchSession(),
        monitoredFetchMatches()
      ])

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      // Process session data
      if (sessionData.success && sessionData.data) {
        setClient(sessionData.data)
      } else if (!sessionData.success) {
        throw new Error(sessionData.error?.message || 'Failed to fetch session')
      }

      // Process matches data
      if (matchesData.success && matchesData.data) {
        setMatches(matchesData.data)
      } else if (!matchesData.success) {
        dualLogger.warn('Failed to fetch matches:', matchesData.error)
        setMatches([])
      }
    } catch (err) {
      if (!isMountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(errorMessage)
      dualLogger.error('Dashboard data fetch error:', err)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
        setIsRefetching(false)
      }
    }
  }, [enableDeduplication, enablePerformanceMonitoring])

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    await fetchDashboardData(true)
  }, [fetchDashboardData])

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch) {
      fetchDashboardData()
    }
  }, [autoFetch, fetchDashboardData])

  /**
   * Set up refetch interval if enabled
   */
  useEffect(() => {
    if (refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchDashboardData(true)
      }, refetchInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refetchInterval, fetchDashboardData])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    client,
    matches,
    isLoading,
    error,
    refetch,
    isRefetching
  }
}

/**
 * Example usage in a component:
 *
 * const { client, matches, isLoading, error, refetch } = useDashboardData({
 *   enableDeduplication: true,
 *   enablePerformanceMonitoring: process.env.NODE_ENV === 'development'
 * })
 *
 * This hook is completely optional and backward-compatible.
 * Existing components can continue using their inline fetching logic.
 */

export default useDashboardData