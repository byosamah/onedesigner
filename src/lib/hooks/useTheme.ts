/**
 * useTheme hook - Centralized theme management
 * Provides theme state and toggle functionality
 */

import { useState, useEffect } from 'react'
import { getTheme } from '@/lib/design-system'

const THEME_STORAGE_KEY = 'onedesigner-theme'

export const useTheme = (defaultDarkMode?: boolean) => {
  // Detect system preference
  const getSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return true // Default to dark if can't detect
  }

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Use provided default if specified
    if (defaultDarkMode !== undefined) return defaultDarkMode
    // Otherwise use system preference
    return getSystemPreference()
  })
  
  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved !== null) {
        setIsDarkMode(saved === 'dark')
      } else {
        // No saved preference, use system preference
        setIsDarkMode(getSystemPreference())
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light')
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const setTheme = (darkMode: boolean) => {
    setIsDarkMode(darkMode)
  }

  const theme = getTheme(isDarkMode)

  return {
    isDarkMode,
    theme,
    toggleTheme,
    setTheme,
    setDark: () => setTheme(true),
    setLight: () => setTheme(false)
  }
}