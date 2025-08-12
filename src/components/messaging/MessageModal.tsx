'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (message: string) => Promise<void>
  designerName: string
  projectType?: string
  isDarkMode: boolean
  isLoading?: boolean
}

export function MessageModal({
  isOpen,
  onClose,
  onSend,
  designerName,
  projectType,
  isDarkMode,
  isLoading = false
}: MessageModalProps) {
  const theme = getTheme(isDarkMode)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Suggested message templates
  const templates = [
    `Hi ${designerName}, I'm excited to work with you on my ${projectType || 'project'}. I'd love to discuss the details and get started as soon as possible.`,
    `Hello ${designerName}, I reviewed your portfolio and think you'd be perfect for this project. Can we discuss how you'd approach this work?`,
    `Hi ${designerName}, your experience aligns perfectly with what I'm looking for. I'm ready to move forward with you on this project.`
  ]

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please write a message')
      return
    }

    if (message.length < 10) {
      setError('Message is too short')
      return
    }

    setSending(true)
    setError(null)

    try {
      await onSend(message)
      setMessage('')
      onClose()
    } catch (err: any) {
      console.error('Message send error:', err)
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleTemplateClick = (template: string) => {
    setMessage(template)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl rounded-3xl shadow-2xl animate-slideUp"
          style={{ backgroundColor: theme.cardBg }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: theme.border }}>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                Start Working with {designerName}
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                Send a message to begin your collaboration
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: theme.nestedBg, color: theme.text.secondary }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Message Templates */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: theme.text.secondary }}>
                Quick starters (click to use):
              </label>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateClick(template)}
                    className="w-full text-left p-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
                    style={{ 
                      backgroundColor: theme.nestedBg,
                      color: theme.text.secondary,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    "{template}"
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: theme.text.primary }}>
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setError(null)
                }}
                placeholder={`Introduce yourself and explain what you'd like to work on with ${designerName}...`}
                className="w-full p-4 rounded-xl resize-none transition-all focus:ring-2"
                style={{ 
                  backgroundColor: theme.nestedBg,
                  color: theme.text.primary,
                  border: `1px solid ${error ? theme.error : theme.border}`,
                  outline: 'none',
                  focusRingColor: theme.accent
                }}
                rows={6}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs" style={{ color: error ? theme.error : theme.text.muted }}>
                  {error || `${message.length}/1000 characters`}
                </span>
              </div>
            </div>

            {/* Project Context */}
            {projectType && (
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: theme.nestedBg }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: theme.text.muted }}>
                  PROJECT TYPE
                </p>
                <p className="text-sm" style={{ color: theme.text.primary }}>
                  {projectType}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t" style={{ borderColor: theme.border }}>
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                backgroundColor: theme.nestedBg,
                color: theme.text.secondary
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="flex-1 font-bold py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Sending...
                </span>
              ) : (
                'Send Message & Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}