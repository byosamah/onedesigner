/**
 * useTheme hook - Centralized theme management
 * Uses ThemeContext for global state management
 */

'use client'

import { useThemeContext } from '@/lib/contexts/theme-context'

export const useTheme = () => {
  // Simply use the context - all logic is now in ThemeProvider
  return useThemeContext()
}