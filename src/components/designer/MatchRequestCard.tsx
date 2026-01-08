'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'

interface MatchRequest {
  id: string
  match_id: string
  initial_message: string
  status: string
  created_at: string
  expires_at: string
  client_email: string
  project_type?: string
  industry?: string
  budget?: string
  timeline?: string
  project_description?: string
  match_score: number
  conversation_id?: string
  unread_count: number
}

interface MatchRequestCardProps {
  request: MatchRequest
  isDarkMode: boolean
  onAccept: (requestId: string) => Promise<void>
  onDecline: (requestId: string) => Promise<void>
}

export function MatchRequestCard({ request, isDarkMode, onAccept, onDecline }: MatchRequestCardProps) {
  const theme = getTheme(isDarkMode)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [showFullMessage, setShowFullMessage] = useState(false)

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await onAccept(request.id)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      await onDecline(request.id)
    } finally {
      setIsDeclining(false)
    }
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(request.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div 
      className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] animate-slideUp"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold" style={{ color: theme.text.primary }}>
              New Project Request
            </h3>
            {request.unread_count > 0 && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                {request.unread_count} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span style={{ color: theme.text.secondary }}>
              From: {request.client_email}
            </span>
            <span style={{ color: theme.text.muted }}>•</span>
            <span style={{ color: theme.text.secondary }}>
              Match Score: {request.match_score}%
            </span>
          </div>
        </div>
        {daysUntilExpiry > 0 ? (
          <span 
            className="text-xs px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: daysUntilExpiry <= 2 ? theme.error + '20' : theme.success + '20',
              color: daysUntilExpiry <= 2 ? theme.error : theme.success
            }}
          >
            {daysUntilExpiry === 1 ? 'Expires tomorrow' : `${daysUntilExpiry} days left`}
          </span>
        ) : (
          <span 
            className="text-xs px-3 py-1 rounded-full"
            style={{ backgroundColor: theme.error + '20', color: theme.error }}
          >
            Expired
          </span>
        )}
      </div>

      {/* Project Details */}
      {(request.project_type || request.industry || request.budget || request.timeline) && (
        <div 
          className="mb-4 p-4 rounded-xl"
          style={{ backgroundColor: theme.nestedBg }}
        >
          <h4 className="font-medium mb-3" style={{ color: theme.text.primary }}>
            Project Details
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {request.project_type && (
              <div>
                <span style={{ color: theme.text.muted }}>Type:</span>
                <span className="ml-2" style={{ color: theme.text.secondary }}>
                  {request.project_type}
                </span>
              </div>
            )}
            {request.industry && (
              <div>
                <span style={{ color: theme.text.muted }}>Industry:</span>
                <span className="ml-2" style={{ color: theme.text.secondary }}>
                  {request.industry}
                </span>
              </div>
            )}
            {request.budget && (
              <div>
                <span style={{ color: theme.text.muted }}>Budget:</span>
                <span className="ml-2" style={{ color: theme.text.secondary }}>
                  {request.budget}
                </span>
              </div>
            )}
            {request.timeline && (
              <div>
                <span style={{ color: theme.text.muted }}>Timeline:</span>
                <span className="ml-2" style={{ color: theme.text.secondary }}>
                  {request.timeline}
                </span>
              </div>
            )}
          </div>
          {request.project_description && (
            <div className="mt-3">
              <span className="text-sm" style={{ color: theme.text.muted }}>Description:</span>
              <p className="mt-1 text-sm" style={{ color: theme.text.secondary }}>
                {request.project_description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Client Message */}
      <div 
        className="mb-4 p-4 rounded-xl"
        style={{ backgroundColor: theme.accent + '10', border: `1px solid ${theme.accent}40` }}
      >
        <h4 className="font-medium mb-2" style={{ color: theme.text.primary }}>
          Client's Message
        </h4>
        <p 
          className="text-sm whitespace-pre-wrap"
          style={{ color: theme.text.secondary }}
        >
          {showFullMessage || request.initial_message.length <= 200
            ? request.initial_message
            : `${request.initial_message.slice(0, 200)}...`}
        </p>
        {request.initial_message.length > 200 && (
          <button
            onClick={() => setShowFullMessage(!showFullMessage)}
            className="text-sm mt-2 hover:underline"
            style={{ color: theme.accent }}
          >
            {showFullMessage ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={isAccepting || isDeclining || daysUntilExpiry <= 0}
          className="flex-1 font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.success,
            color: '#fff'
          }}
        >
          {isAccepting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚡</span>
              Accepting...
            </span>
          ) : (
            'Accept & Reply'
          )}
        </button>
        <button
          onClick={handleDecline}
          disabled={isAccepting || isDeclining || daysUntilExpiry <= 0}
          className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.nestedBg,
            color: theme.text.secondary,
            border: `1px solid ${theme.border}`
          }}
        >
          {isDeclining ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚡</span>
              Declining...
            </span>
          ) : (
            'Decline'
          )}
        </button>
      </div>
    </div>
  )
}