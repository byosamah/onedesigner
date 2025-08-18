'use client'

import { useState, useEffect } from 'react'
import { getTheme } from '@/lib/design-system'
import { BriefViewerModal } from './BriefViewerModal'
import { logger } from '@/lib/core/logging-service'

interface WorkingRequestCardProps {
  request: {
    id: string
    message: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    viewed_at?: string
    response_deadline?: string
    brief_snapshot?: any
    matches?: {
      score: number
      reasons: string[]
      briefs?: {
        project_type?: string
        timeline?: string
        budget?: string
        industry?: string
      }
    }
    clients?: {
      email: string
    }
  }
  isDarkMode: boolean
  onRefresh?: () => void
}

export function WorkingRequestCard({ request, isDarkMode, onRefresh }: WorkingRequestCardProps) {
  const theme = getTheme(isDarkMode)
  const [showBriefModal, setShowBriefModal] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [hoursRemaining, setHoursRemaining] = useState<number>(72)

  useEffect(() => {
    if (request.response_deadline) {
      const calculateTimeRemaining = () => {
        const now = new Date()
        const deadline = new Date(request.response_deadline!)
        const diff = deadline.getTime() - now.getTime()
        const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
        setHoursRemaining(hours)
      }

      calculateTimeRemaining()
      const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [request.response_deadline])

  const handleAccept = async () => {
    setIsResponding(true)
    try {
      const response = await fetch(`/api/designer/project-requests/${request.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'approve' })
      })

      if (!response.ok) {
        throw new Error('Failed to accept request')
      }

      const data = await response.json()
      
      // Show success message
      alert(`✅ Request accepted! Client email: ${data.clientEmail}`)
      
      // Refresh the dashboard
      if (onRefresh) onRefresh()
    } catch (error) {
      logger.error('Error accepting request:', error)
      alert('Failed to accept request. Please try again.')
    } finally {
      setIsResponding(false)
      setShowBriefModal(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Why are you unable to take this project? (optional)')
    
    setIsResponding(true)
    try {
      const response = await fetch(`/api/designer/project-requests/${request.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'reject',
          rejectionReason: reason || 'Not available for this project'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reject request')
      }

      // Show success message
      alert('Request declined. The client will be notified.')
      
      // Refresh the dashboard
      if (onRefresh) onRefresh()
    } catch (error) {
      logger.error('Error rejecting request:', error)
      alert('Failed to decline request. Please try again.')
    } finally {
      setIsResponding(false)
      setShowBriefModal(false)
    }
  }

  const getDeadlineColor = () => {
    if (hoursRemaining <= 12) return theme.error
    if (hoursRemaining <= 24) return '#f59e0b'
    return theme.success
  }

  const getStatusBadge = () => {
    switch (request.status) {
      case 'approved':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold" 
                style={{ backgroundColor: theme.success + '20', color: theme.success }}>
            ✅ Accepted
          </span>
        )
      case 'rejected':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: theme.error + '20', color: theme.error }}>
            ❌ Declined
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
            ⏳ Pending Response
          </span>
        )
    }
  }

  // Get brief data from snapshot or matches
  const briefData = request.brief_snapshot || request.matches?.briefs || {}
  const projectType = briefData.project_type || briefData.design_category || 'Design'
  const timeline = briefData.timeline || briefData.timeline_type || 'Not specified'
  const budget = briefData.budget || briefData.budget_range || 'Not specified'
  const matchScore = request.brief_snapshot?.match_score || request.matches?.score

  return (
    <>
      <div 
        className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]"
        style={{
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
            >
              🎯
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: theme.text.primary }}>
                {projectType} Project Request
              </h3>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Received {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Match Score */}
        {matchScore && (
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4"
            style={{ 
              backgroundColor: theme.accent + '10',
              color: theme.accent
            }}
          >
            <span>Match Score: {matchScore}%</span>
          </div>
        )}

        {/* Brief Preview */}
        <div 
          className="p-4 rounded-xl mb-4"
          style={{ 
            backgroundColor: theme.nestedBg,
            border: `1px solid ${theme.border}`
          }}
        >
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p style={{ color: theme.text.muted }}>Timeline</p>
              <p className="font-medium" style={{ color: theme.text.primary }}>{timeline}</p>
            </div>
            <div>
              <p style={{ color: theme.text.muted }}>Budget</p>
              <p className="font-medium" style={{ color: theme.text.primary }}>{budget}</p>
            </div>
            <div>
              <p style={{ color: theme.text.muted }}>Industry</p>
              <p className="font-medium" style={{ color: theme.text.primary }}>
                {briefData.industry || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        {request.status === 'pending' && request.response_deadline && (
          <div 
            className="p-3 rounded-xl mb-4 text-sm"
            style={{ 
              backgroundColor: getDeadlineColor() + '10',
              border: `1px solid ${getDeadlineColor()}40`
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: getDeadlineColor() }}>
                ⏰ {hoursRemaining} hours remaining to respond
              </span>
              {!request.viewed_at && (
                <span className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: theme.accent, color: '#000' }}>
                  NEW
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {request.status === 'pending' ? (
            <>
              <button
                onClick={() => setShowBriefModal(true)}
                className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000'
                }}
              >
                View Full Brief →
              </button>
              <button
                onClick={handleReject}
                disabled={isResponding}
                className="px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.text.secondary
                }}
              >
                Decline
              </button>
            </>
          ) : request.status === 'approved' && request.clients?.email ? (
            <div className="flex-1 p-3 rounded-xl" 
                 style={{ backgroundColor: theme.success + '10' }}>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Client Email: <a href={`mailto:${request.clients.email}`} 
                                style={{ color: theme.accent }}>
                  {request.clients.email}
                </a>
              </p>
            </div>
          ) : (
            <div className="flex-1 p-3 rounded-xl text-center text-sm"
                 style={{ backgroundColor: theme.nestedBg, color: theme.text.muted }}>
              {request.status === 'rejected' ? 'You declined this request' : 'Request completed'}
            </div>
          )}
        </div>
      </div>

      {/* Brief Viewer Modal */}
      <BriefViewerModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        requestId={request.id}
        isDarkMode={isDarkMode}
        onAccept={handleAccept}
        onReject={handleReject}
        isLoading={isResponding}
      />
    </>
  )
}