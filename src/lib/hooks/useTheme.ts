/**
 * useTheme hook - Centralized theme management
 * Provides theme state and toggle functionality
 */

import { useState, useEffect } from 'react'
import { getTheme } from '@/lib/design-system'

const THEME_STORAGE_KEY = 'onedesigner-theme'

export const useTheme = (defaultDarkMode = true) => {
  const [isDarkMode, setIsDarkMode] = useState(defaultDarkMode)
  
  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved !== null) {
        setIsDarkMode(saved === 'dark')
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