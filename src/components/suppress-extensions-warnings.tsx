'use client'

import { useEffect } from 'react'

export function SuppressExtensionWarnings() {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const originalError = console.error
      console.error = (...args: any[]) => {
        // Suppress hydration warnings from browser extensions
        const firstArg = args[0]
        if (typeof firstArg === 'string' && (
          firstArg.includes('Extra attributes from the server') ||
          firstArg.includes('data-gr-ext-installed') ||
          firstArg.includes('data-new-gr-c-s-check-loaded') ||
          firstArg.includes('data-grammarly') ||
          firstArg.includes('did not match. Server')
        )) {
          return
        }
        originalError.apply(console, args)
      }
    }
  }, [])

  return null
}