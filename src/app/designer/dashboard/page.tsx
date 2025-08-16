'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { MatchRequestCard } from '@/components/designer/MatchRequestCard'
import { logger } from '@/lib/core/logging-service'

interface EnhancedDesignerRequest {
  id: string
  matchId: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: string
  brief: {
    designCategory: string
    projectDescription: string
    timeline: string
    budget: string
    targetAudience: string
    projectGoal: string
    styleKeywords: string[]
  }
  client: {
    email: string
    company?: string
  }
  match: {
    score: number
    confidence: string
    matchSummary: string
    personalizedReasons: string[]
    uniqueValue: string
    potentialChallenges: string[]
    riskLevel: string
    scoreBreakdown: {
      categoryMatch: number
      styleAlignment: number
      budgetCompatibility: number
      timelineCompatibility: number
      experienceLevel: number
      industryFamiliarity: number
    }
  }
}

interface DesignerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  isApproved: boolean
  isVerified: boolean
  designPhilosophy: string
  primaryCategories: string[]
  yearsExperience: number | string
}

export default function DesignerDashboardPage() {
  const router = useRouter()
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const [designer, setDesigner] = useState<DesignerProfile | null>(null)
  const [requests, setRequests] = useState<EnhancedDesignerRequest[]>([])
  const [matchRequests, setMatchRequests] = useState<any[]>([])
  const [projectRequests, setProjectRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<EnhancedDesignerRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch designer session, requests, match requests, and project requests
      const [sessionResponse, requestsResponse, matchRequestsResponse, projectRequestsResponse] = await Promise.all([
        fetch('/api/designer/auth/session', {
          method: 'GET',
          credentials: 'include',
        }),
        fetch('/api/designer/requests', {
          method: 'GET',
          credentials: 'include',
        }),
        fetch('/api/designer/match-requests', {
          method: 'GET',
          credentials: 'include',
        }),
        fetch('/api/designer/project-requests', {
          method: 'GET',
          credentials: 'include',
        })
      ])

      if (!sessionResponse.ok) {
        if (sessionResponse.status === 401) {
          router.push('/designer/login')
          return
        }
        throw new Error('Failed to fetch session data')
      }

      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch requests')
      }

      const sessionData = await sessionResponse.json()
      const requestsData = await requestsResponse.json()
      const matchRequestsData = matchRequestsResponse.ok ? await matchRequestsResponse.json() : { data: [] }
      const projectRequestsData = projectRequestsResponse.ok ? await projectRequestsResponse.json() : { projectRequests: [] }

      logger.info('Session data:', sessionData)
      logger.info('Requests data:', requestsData)
      logger.info('Match requests data:', matchRequestsData)
      logger.info('Project requests data:', projectRequestsData)

      if (!sessionData.designer) {
        throw new Error('Designer data not found in session response')
      }

      setDesigner(sessionData.designer)
      setRequests(requestsData.requests || [])
      setMatchRequests(matchRequestsData.data || [])
      setProjectRequests(projectRequestsData.projectRequests || [])

    } catch (error) {
      logger.error('Dashboard error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestResponse = async (requestId: string, response: 'accept' | 'decline') => {
    try {
      const res = await fetch(`/api/designer/requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to respond to request')
      }

      // Refresh requests after response
      fetchDashboardData()
      setSelectedRequest(null)

    } catch (error) {
      logger.error('Response error:', error)
      alert(error instanceof Error ? error.message : 'Failed to respond to request')
    }
  }

  const handleMatchRequestAccept = async (requestId: string) => {
    try {
      const res = await fetch(`/api/designer/match-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: 'accept' }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to accept request')
      }

      // Refresh requests after response
      await fetchDashboardData()
      
      // Redirect to conversation (if we have messaging system)
      // For now, just show success
      alert('Match request accepted! The client will be notified.')

    } catch (error) {
      logger.error('Accept error:', error)
      alert(error instanceof Error ? error.message : 'Failed to accept request')
    }
  }

  const handleMatchRequestDecline = async (requestId: string) => {
    try {
      const res = await fetch(`/api/designer/match-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: 'decline' }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to decline request')
      }

      // Refresh requests after response
      await fetchDashboardData()

    } catch (error) {
      logger.error('Decline error:', error)
      alert(error instanceof Error ? error.message : 'Failed to decline request')
    }
  }

  const handleProjectRequestResponse = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const rejectionReason = action === 'reject' 
        ? prompt('Please provide a reason for declining (optional):') 
        : null

      const res = await fetch(`/api/designer/project-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, rejectionReason }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to respond to project request')
      }

      const data = await res.json()
      
      if (action === 'approve' && data.clientEmail) {
        alert(`✅ Project approved! Client email: ${data.clientEmail}`)
      } else {
        alert(`Project request ${action}d successfully`)
      }

      // Refresh requests after response
      await fetchDashboardData()

    } catch (error) {
      logger.error('Project request response error:', error)
      alert(error instanceof Error ? error.message : 'Failed to respond to project request')
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/designer/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/designer/login')
    } catch (error) {
      logger.error('Signout error:', error)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-5xl mb-6 animate-pulse">⚡</div>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Loading your dashboard...
          </h2>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Dashboard Error
          </h2>
          <p className="mb-6" style={{ color: theme.text.secondary }}>
            {error}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => fetchDashboardData()}
              className="block w-full px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              Try Again
            </button>
            <Link
              href="/designer/login"
              className="block w-full px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105 text-center"
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${theme.border}`,
                color: theme.text.primary
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation - matching admin dashboard style */}
      <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
              </svg>
              OneDesigner
            </Link>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: theme.tagBg, color: theme.text.secondary }}>
              Designer Dashboard
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none hover:shadow-md"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
              aria-label="Toggle theme"
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs"
                style={{
                  left: isDarkMode ? '2px' : '32px',
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  transform: isDarkMode ? 'rotate(0deg)' : 'rotate(360deg)'
                }}
              >
                {isDarkMode ? '🌙' : '☀️'}
              </div>
            </button>
            
            <button
              onClick={handleSignOut}
              className="font-medium py-2 px-4 rounded-xl transition-all duration-300 hover:opacity-80"
              style={{ color: theme.text.secondary }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Designer Dashboard
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Welcome back, {designer?.firstName || 'Designer'} {designer?.lastName || ''}
          </p>
        </div>

        {/* Profile Status Card */}
        {designer && (
          <div 
            className="rounded-2xl p-6 mb-8 transition-all duration-300 animate-slideUp"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  {designer.firstName?.[0] || 'D'}{designer.lastName?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    {designer.firstName || 'Designer'} {designer.lastName || 'User'}
                  </h3>
                  <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                    {designer.title || 'Designer'} • {designer.yearsExperience || 0} years experience
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {designer.isApproved ? (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                    ✓ Approved
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                    ⏳ Under Review
                  </span>
                )}
                
                <Link
                  href="/designer/profile"
                  className="font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    backgroundColor: theme.nestedBg,
                    color: theme.text.primary
                  }}
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {!designer.isApproved && (
              <div 
                className="mt-4 p-4 rounded-xl"
                style={{
                  backgroundColor: theme.accent + '10',
                  border: `1px solid ${theme.accent}40`
                }}
              >
                <p className="text-sm" style={{ color: theme.text.primary }}>
                  <strong>Profile Under Review:</strong> Your profile is being reviewed by our team. 
                  You'll start receiving project requests once approved (usually within 24 hours).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div 
            className="rounded-2xl p-6 transition-all duration-300 animate-slideUp"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              animationDelay: '0.1s'
            }}
          >
            <div className="text-2xl mb-3">📥</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>
              {matchRequests.filter(r => r.status === 'pending' || r.status === 'unlocked').length + requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>New Requests</div>
          </div>
          
          <div 
            className="rounded-2xl p-6 transition-all duration-300 animate-slideUp"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              animationDelay: '0.2s'
            }}
          >
            <div className="text-2xl mb-3">✅</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.success }}>
              {requests.filter(r => r.status === 'accepted').length}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Accepted</div>
          </div>
          
          <div 
            className="rounded-2xl p-6 transition-all duration-300 animate-slideUp"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              animationDelay: '0.3s'
            }}
          >
            <div className="text-2xl mb-3">📊</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.text.primary }}>
              {requests.length}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Total Requests</div>
          </div>
        </div>

        {/* Client Project Requests Section */}
        {projectRequests.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                💬 Messages from Clients
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                Clients who want to work with you
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              {projectRequests
                .filter(req => req.status === 'pending')
                .map((request) => (
                  <div 
                    key={request.id}
                    className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.002] animate-slideUp"
                    style={{
                      backgroundColor: theme.cardBg,
                      border: `2px solid ${theme.accent}40`,
                      boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent + '20' }}>
                            <span className="text-xl">💌</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold" style={{ color: theme.text.primary }}>
                              New Client Message
                            </h3>
                            <p className="text-xs" style={{ color: theme.text.muted }}>
                              Received {new Date(request.createdAt || Date.now()).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}>
                          <p className="text-sm" style={{ color: theme.text.primary, lineHeight: '1.6' }}>
                            {typeof request.message === 'string' 
                              ? request.message 
                              : (request.message?.text || request.message?.content || 'Client wants to work with you on their project.')
                            }
                          </p>
                        </div>
                        
                        {request.brief && (
                          <div className="flex gap-6 mb-4 px-4">
                            {request.brief.projectType && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: theme.text.muted }}>🎨</span>
                                <span className="text-sm" style={{ color: theme.text.secondary }}>
                                  {request.brief.projectType}
                                </span>
                              </div>
                            )}
                            {request.brief.timeline && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: theme.text.muted }}>⏱️</span>
                                <span className="text-sm" style={{ color: theme.text.secondary }}>
                                  {request.brief.timeline}
                                </span>
                              </div>
                            )}
                            {request.brief.budget && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: theme.text.muted }}>Budget:</span>
                                <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                                  {request.brief.budget}
                                </span>
                              </div>
                            )}
                            {request.brief.industry && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: theme.text.muted }}>Industry:</span>
                                <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                                  {request.brief.industry}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                      <button
                        onClick={() => handleProjectRequestResponse(request.id, 'reject')}
                        className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:opacity-80"
                        style={{
                          backgroundColor: theme.nestedBg,
                          color: theme.text.secondary
                        }}
                      >
                        Not Interested
                      </button>
                      <button
                        onClick={() => handleProjectRequestResponse(request.id, 'approve')}
                        className="flex-1 font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          backgroundColor: theme.accent,
                          color: '#000'
                        }}
                      >
                        Accept & Get Contact Info
                      </button>
                    </div>
                  </div>
                ))
              }
              
              {projectRequests
                .filter(req => req.status === 'approved')
                .map((request) => (
                  <div 
                    key={request.id}
                    className="rounded-2xl p-5 transition-all duration-300 animate-slideUp"
                    style={{
                      backgroundColor: theme.success + '10',
                      border: `1px solid ${theme.success}40`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.success + '20' }}>
                        <span>✅</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                          Accepted • Client: <strong>{request.client?.email || 'Contact info available'}</strong>
                        </p>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          {request.message && typeof request.message === 'string' 
                            ? request.message.substring(0, 60) + '...'
                            : 'Project request accepted'}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: theme.text.muted }}>
                        {new Date(request.approvedAt || request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}

        {/* New Match Requests with Messages Section */}
        {matchRequests.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                New Project Requests
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                Clients who want to work with you
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              {matchRequests
                .filter(req => req.status === 'pending' || req.status === 'unlocked')
                .map((request) => (
                  <MatchRequestCard
                    key={request.id}
                    request={request}
                    isDarkMode={isDarkMode}
                    onAccept={handleMatchRequestAccept}
                    onDecline={handleMatchRequestDecline}
                  />
                ))
              }
            </div>
          </>
        )}

        {/* Legacy Requests Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            {matchRequests.length > 0 ? 'Other Requests' : 'Project Requests'}
          </h2>
        </div>

        {requests.length === 0 ? (
          <div 
            className="text-center py-16 rounded-3xl"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div className="text-5xl mb-6">📭</div>
            <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              No requests yet
            </h3>
            <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
              {designer?.isApproved 
                ? "Project requests will appear here when clients match with you"
                : "Complete your profile approval to start receiving project requests"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div 
                key={request.id}
                className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.002]"
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                        {request.brief.designCategory}
                      </h3>
                      {request.status === 'pending' && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                          ⏳ Pending
                        </span>
                      )}
                      {request.status === 'accepted' && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                          ✅ Accepted
                        </span>
                      )}
                      {request.status === 'declined' && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.error + '20', color: theme.error }}>
                          ❌ Declined
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm mb-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {request.brief.timeline} • {request.brief.budget}
                    </p>
                    
                    <p className="text-sm line-clamp-2 transition-colors duration-300" style={{ color: theme.text.muted }}>
                      {request.brief.projectDescription}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: theme.text.muted }}>
                      <span>Match Score: <strong style={{ color: theme.accent }}>{request.match.score}%</strong></span>
                      <span>Client: {request.client.email}</span>
                      <span>{new Date(request.sentAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRequestResponse(request.id, 'decline')}
                          className="font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            backgroundColor: 'transparent',
                            border: `2px solid ${theme.error}`,
                            color: theme.error
                          }}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRequestResponse(request.id, 'accept')}
                          className="font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            backgroundColor: theme.success,
                            color: '#FFF'
                          }}
                        >
                          Accept
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="font-medium py-2 px-4 rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: theme.nestedBg,
                        color: theme.text.secondary
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setSelectedRequest(null)}
        >
          <div 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8"
            style={{ backgroundColor: theme.cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Request Details
            </h2>
            
            <div className="space-y-6">
              {/* Project Info */}
              <div>
                <h3 className="font-bold mb-3" style={{ color: theme.text.primary }}>Project Information</h3>
                <div className="space-y-2">
                  <p style={{ color: theme.text.secondary }}>
                    <strong>Category:</strong> {selectedRequest.brief.designCategory}
                  </p>
                  <p style={{ color: theme.text.secondary }}>
                    <strong>Timeline:</strong> {selectedRequest.brief.timeline}
                  </p>
                  <p style={{ color: theme.text.secondary }}>
                    <strong>Budget:</strong> {selectedRequest.brief.budget}
                  </p>
                  <p style={{ color: theme.text.secondary }}>
                    <strong>Target Audience:</strong> {selectedRequest.brief.targetAudience}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold mb-3" style={{ color: theme.text.primary }}>Project Description</h3>
                <p className="whitespace-pre-wrap" style={{ color: theme.text.secondary }}>
                  {selectedRequest.brief.projectDescription}
                </p>
              </div>

              {/* Match Analysis */}
              <div>
                <h3 className="font-bold mb-3" style={{ color: theme.text.primary }}>Why You're a Match</h3>
                <p className="mb-3" style={{ color: theme.text.secondary }}>
                  {selectedRequest.match.matchSummary}
                </p>
                <ul className="space-y-2">
                  {selectedRequest.match.personalizedReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2" style={{ color: theme.text.secondary }}>
                      <span style={{ color: theme.success }}>•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="font-bold mb-3" style={{ color: theme.text.primary }}>Client Information</h3>
                <p style={{ color: theme.text.secondary }}>
                  <strong>Email:</strong> {selectedRequest.client.email}
                </p>
                {selectedRequest.client.company && (
                  <p style={{ color: theme.text.secondary }}>
                    <strong>Company:</strong> {selectedRequest.client.company}
                  </p>
                )}
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleRequestResponse(selectedRequest.id, 'accept')
                    }}
                    className="flex-1 font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{ backgroundColor: theme.success, color: '#FFF' }}
                  >
                    Accept Request
                  </button>
                  <button
                    onClick={() => {
                      handleRequestResponse(selectedRequest.id, 'decline')
                    }}
                    className="flex-1 font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'transparent',
                      border: `2px solid ${theme.error}`,
                      color: theme.error
                    }}
                  >
                    Decline Request
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-6 w-full font-medium py-3 rounded-xl transition-all duration-300"
              style={{
                backgroundColor: theme.nestedBg,
                color: theme.text.secondary
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}