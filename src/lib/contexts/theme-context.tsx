'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getTheme, Theme } from '@/lib/design-system'

interface ThemeContextType {
  isDarkMode: boolean
  theme: Theme
  toggleTheme: () => void
  setTheme: (darkMode: boolean) => void
  setDark: () => void
  setLight: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'onedesigner-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with system preference or stored preference
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    // Check if we're on the server
    if (typeof window === 'undefined') {
      return true // Default to dark mode on server
    }

    // Check localStorage first
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored !== null) {
        return stored === 'dark'
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error)
    }

    // Fall back to system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // Default to dark mode
    return true
  })

  // Update localStorage when theme changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light')
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [isDarkMode])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY)
        if (stored === null) {
          // No manual preference, follow system
          setIsDarkModeState(e.matches)
        }
      } catch (error) {
        console.warn('Failed to check stored theme preference:', error)
      }
    }

    // Add listener for system theme changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Apply theme class to document element for CSS variables
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkModeState(!isDarkMode)
  }

  const setTheme = (darkMode: boolean) => {
    setIsDarkModeState(darkMode)
  }

  const theme = getTheme(isDarkMode)

  const value: ThemeContextType = {
    isDarkMode,
    theme,
    toggleTheme,
    setTheme,
    setDark: () => setTheme(true),
    setLight: () => setTheme(false)
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}