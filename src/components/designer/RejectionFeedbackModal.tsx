'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'

interface RejectionFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  rejectionReason: string
  designerName?: string
}

export function RejectionFeedbackModal({ 
  isOpen, 
  onClose, 
  rejectionReason,
  designerName = 'there'
}: RejectionFeedbackModalProps) {
  const { theme, isDarkMode } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`
            pointer-events-auto max-w-lg w-full rounded-2xl shadow-2xl
            transform transition-all duration-300
            ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with warning icon */}
          <div 
            className="px-6 py-4 rounded-t-2xl flex items-center justify-between"
            style={{ 
              backgroundColor: theme.warning + '10',
              borderBottom: `2px solid ${theme.warning}`
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: theme.text.primary }}>
                  Application Update Required
                </h2>
                <p className="text-sm" style={{ color: theme.text.secondary }}>
                  Hey {designerName}, we need a few changes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:scale-110 transition-transform"
              style={{ color: theme.text.secondary }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Feedback Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Feedback from our review team:
              </h3>
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: theme.nestedBg,
                  border: `1px solid ${theme.border}`
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: theme.text.primary }}>
                  {rejectionReason}
                </p>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Quick tips that work:
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: theme.text.secondary }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: theme.success }}>✓</span>
                  <span>Show real client work (not just concepts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: theme.success }}>✓</span>
                  <span>Explain your design decisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: theme.success }}>✓</span>
                  <span>Include before/after examples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: theme.success }}>✓</span>
                  <span>Add links to live projects</span>
                </li>
              </ul>
            </div>

            {/* Stats to encourage */}
            <div 
              className="p-3 rounded-xl text-center"
              style={{ backgroundColor: theme.accent + '10' }}
            >
              <p className="text-sm" style={{ color: theme.text.primary }}>
                <strong>37% of our approved designers</strong> got rejected on their first try
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: theme.nestedBg,
                color: theme.text.secondary,
                border: `1px solid ${theme.border}`
              }}
            >
              View Dashboard
            </button>
            <Link
              href="/designer/profile"
              className="flex-1"
              onClick={onClose}
            >
              <button
                className="w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000'
                }}
              >
                Update Profile →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}