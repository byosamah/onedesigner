'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'

interface WorkingRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  designerName: string
  projectType?: string
  isDarkMode: boolean
}

export function WorkingRequestModal({
  isOpen,
  onClose,
  onConfirm,
  designerName,
  projectType,
  isDarkMode
}: WorkingRequestModalProps) {
  const theme = getTheme(isDarkMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      setShowSuccess(true)
      // Auto-close after showing success
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      // Error handling is done in parent component
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (showSuccess) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn" />
        
        {/* Success Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="relative max-w-sm w-full rounded-3xl p-8 text-center animate-slideUp"
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Success Icon */}
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-scaleIn"
              style={{ backgroundColor: theme.success + '20' }}
            >
              <span className="text-4xl">✅</span>
            </div>
            
            {/* Success Message */}
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Request Sent Successfully!
            </h3>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              The designer will review your brief and respond within 72 hours.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative max-w-md w-full rounded-3xl overflow-hidden animate-slideUp"
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            boxShadow: isDarkMode ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 border-b"
            style={{ 
              backgroundColor: theme.nestedBg,
              borderColor: theme.border 
            }}
          >
            <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
              Send Working Request
            </h2>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Designer Info Card */}
            <div 
              className="p-4 rounded-2xl mb-6"
              style={{ 
                backgroundColor: theme.nestedBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ 
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  {designerName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: theme.text.primary }}>
                    {designerName}
                  </p>
                  {projectType && (
                    <p className="text-sm" style={{ color: theme.text.secondary }}>
                      {projectType} Designer
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Explanation */}
            <div className="space-y-4 mb-6">
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                By sending this request, you're expressing interest in working with {designerName} on your project.
              </p>
              
              {/* What happens next */}
              <div className="space-y-2">
                <p className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                  What happens next:
                </p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: theme.accent }}>→</span>
                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                      {designerName} will receive your brief details
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: theme.accent }}>→</span>
                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                      They'll review and respond within 72 hours
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: theme.accent }}>→</span>
                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                      If approved, you'll receive their contact details
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div 
            className="px-6 py-4 border-t flex gap-3"
            style={{ 
              backgroundColor: theme.nestedBg,
              borderColor: theme.border 
            }}
          >
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${theme.border}`,
                color: theme.text.primary
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Sending...
                </span>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}