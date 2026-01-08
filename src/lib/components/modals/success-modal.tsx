'use client'

import { useEffect } from 'react'
import { getTheme } from '@/lib/design-system'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  icon?: string
  autoHideDelay?: number
  isDarkMode: boolean
}

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Success!',
  message = 'Operation completed successfully.',
  icon = '✅',
  autoHideDelay = 3000,
  isDarkMode
}: SuccessModalProps) {
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    if (isOpen && autoHideDelay > 0) {
      const timer = setTimeout(onClose, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoHideDelay, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="max-w-sm w-full rounded-3xl p-8 animate-slideUp pointer-events-auto"
        style={{ backgroundColor: theme.cardBg }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: theme.text.primary }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}