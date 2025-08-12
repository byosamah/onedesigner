'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { CONTACT_MESSAGES } from '@/lib/constants/messages'

interface ContactDesignerModalProps {
  isOpen: boolean
  onClose: () => void
  designerName: string
  onSend: (message: string) => void
  isDarkMode: boolean
}

export function ContactDesignerModal({
  isOpen,
  onClose,
  designerName,
  onSend,
  isDarkMode
}: ContactDesignerModalProps) {
  const [message, setMessage] = useState('')
  const theme = getTheme(isDarkMode)

  if (!isOpen) return null

  const handleSend = () => {
    onSend(message || CONTACT_MESSAGES.DEFAULT)
    setMessage('')
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="max-w-lg w-full rounded-3xl p-8 animate-slideUp"
        style={{ backgroundColor: theme.cardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">💌</div>
          <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            Contact {designerName}
          </h2>
          <p className="text-sm mt-2" style={{ color: theme.text.secondary }}>
            Send a message to start your project collaboration
          </p>
        </div>
        
        {/* Message Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme.nestedBg,
              border: `2px solid ${theme.border}`,
              color: theme.text.primary,
              focusRingColor: theme.accent
            }}
          />
        </div>
        
        {/* Suggested Messages */}
        <div className="mb-6">
          <p className="text-xs font-medium mb-3" style={{ color: theme.text.muted }}>
            SUGGESTED MESSAGES
          </p>
          <div className="space-y-2">
            {CONTACT_MESSAGES.SUGGESTIONS.map((suggestedMessage, index) => (
              <button
                key={index}
                onClick={() => setMessage(suggestedMessage)}
                className="w-full text-left p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: theme.nestedBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.text.secondary,
                  fontSize: '14px'
                }}
              >
                "{suggestedMessage}"
              </button>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: theme.nestedBg,
              color: theme.text.secondary
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex-1 font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  )
}