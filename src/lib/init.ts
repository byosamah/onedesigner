/**
 * Application initialization
 * This file handles early initialization of all centralized services
 */

import { safeInitConfig } from '@/lib/config/init'

let initialized = false

/**
 * Initialize all application services
 * Should be called early in the application lifecycle
 */
export async function initializeApp() {
  if (initialized) {
    return
  }

  try {
    // Initialize configuration first
    await safeInitConfig()
    
    initialized = true
    console.log('✅ OneDesigner application initialized successfully')
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error)
    // Don't throw in production to prevent app crashes
    if (process.env.NODE_ENV === 'development') {
      throw error
    }
  }
}

/**
 * Check if app is initialized
 */
export function isAppInitialized(): boolean {
  return initialized
}

// Auto-initialize on import in Node.js environment (API routes)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  initializeApp().catch(() => {
    // Silent fail in production
  })
}