/**
 * Performance optimization utilities
 * Opt-in improvements that maintain backward compatibility
 */

import React from 'react'

/**
 * Memoization helper for expensive computations
 * Creates a cached version of a function
 * @param fn Function to memoize
 * @param getKey Function to generate cache key from arguments
 */
export function memoize<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
  getKey?: (...args: TArgs) => string
): (...args: TArgs) => TResult {
  const cache = new Map<string, TResult>()

  return (...args: TArgs): TResult => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Debounce helper for rate-limiting function calls
 * Useful for search inputs and resize handlers
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce<TArgs extends any[]>(
  fn: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle helper for limiting function execution rate
 * Ensures function is called at most once per interval
 * @param fn Function to throttle
 * @param interval Interval in milliseconds
 */
export function throttle<TArgs extends any[]>(
  fn: (...args: TArgs) => void,
  interval: number
): (...args: TArgs) => void {
  let lastCallTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: TArgs) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime

    if (timeSinceLastCall >= interval) {
      fn(...args)
      lastCallTime = now
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        fn(...args)
        lastCallTime = Date.now()
        timeoutId = null
      }, interval - timeSinceLastCall)
    }
  }
}

/**
 * Request deduplication helper
 * Prevents duplicate API calls for the same data
 * @param fetcher Function that returns a promise
 */
export function dedupeRequests<TArgs extends any[], TResult>(
  fetcher: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  const pending = new Map<string, Promise<TResult>>()

  return async (...args: TArgs): Promise<TResult> => {
    const key = JSON.stringify(args)

    // Return existing promise if request is already in flight
    if (pending.has(key)) {
      return pending.get(key)!
    }

    // Create new promise and store it
    const promise = fetcher(...args).finally(() => {
      // Clean up after request completes
      pending.delete(key)
    })

    pending.set(key, promise)
    return promise
  }
}

/**
 * Lazy loading helper for code splitting
 * Wrapper around React.lazy with error boundary support
 * @param importFn Dynamic import function
 * @param fallback Optional fallback component
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: any

    for (let i = 0; i < retries; i++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error

        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }

    throw lastError
  })
}

/**
 * Performance monitoring wrapper
 * Measures and logs execution time of functions
 * @param fn Function to monitor
 * @param name Name for logging
 */
export function withPerformanceMonitoring<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
  name: string
): (...args: TArgs) => TResult {
  return (...args: TArgs): TResult => {
    const start = performance.now()

    try {
      const result = fn(...args)

      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start
          console.debug(`[Performance] ${name} took ${duration.toFixed(2)}ms`)
        }) as any
      }

      const duration = performance.now() - start
      console.debug(`[Performance] ${name} took ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - start
      console.debug(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`)
      throw error
    }
  }
}

/**
 * Virtual scrolling helper configuration
 * For rendering large lists efficiently
 */
export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  buffer?: number // Number of items to render outside viewport
  overscan?: number // Number of items to pre-render
}

/**
 * Calculate visible items for virtual scrolling
 * @param scrollTop Current scroll position
 * @param totalItems Total number of items
 * @param config Virtual scroll configuration
 */
export function calculateVisibleItems(
  scrollTop: number,
  totalItems: number,
  config: VirtualScrollConfig
): { start: number; end: number; offsetY: number } {
  const { itemHeight, containerHeight, buffer = 2, overscan = 3 } = config

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  const end = Math.min(totalItems, start + visibleCount + buffer * 2 + overscan)
  const offsetY = start * itemHeight

  return { start, end, offsetY }
}

/**
 * Create an optimized event handler with passive option
 * Improves scrolling performance
 */
export function passiveListener(
  element: HTMLElement | Window,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  const opts = { ...options, passive: true }
  element.addEventListener(event, handler, opts)

  // Return cleanup function
  return () => {
    element.removeEventListener(event, handler, opts)
  }
}

// Export all utilities
export default {
  memoize,
  debounce,
  throttle,
  dedupeRequests,
  lazyWithRetry,
  withPerformanceMonitoring,
  calculateVisibleItems,
  passiveListener
}