'use client'

import { useEffect } from 'react'
import { getTheme } from '@/lib/design-system'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  isDarkMode?: boolean
  autoCloseDelay?: number // in milliseconds
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Success',
  message,
  isDarkMode = false,
  autoCloseDelay = 3000
}: SuccessModalProps) {
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoCloseDelay, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="relative max-w-md w-full rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200"
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Icon - Atom Logo */}
          <div className="mb-6 flex justify-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center animate-bounce"
              style={{ backgroundColor: theme.accent }}
            >
              <span className="text-4xl">⚛️</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="text-xl font-bold mb-3"
            style={{ color: theme.text.primary }}
          >
            {title}
          </h3>

          {/* Message */}
          <p 
            className="text-base mb-6"
            style={{ color: theme.text.secondary }}
          >
            {message}
          </p>

          {/* OK Button */}
          <button
            onClick={onClose}
            className="w-full font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            OK
          </button>

          {/* Auto-close indicator */}
          {autoCloseDelay > 0 && (
            <div className="mt-4">
              <div 
                className="h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.nestedBg }}
              >
                <div 
                  className="h-full rounded-full animate-shrink"
                  style={{ 
                    backgroundColor: theme.accent,
                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  )
}