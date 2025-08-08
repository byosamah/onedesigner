'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'
import { LoadingSpinner } from '@/components/shared'

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
  yearsExperience: number
}

export default function DesignerDashboardPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [designer, setDesigner] = useState<DesignerProfile | null>(null)
  const [requests, setRequests] = useState<EnhancedDesignerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch designer session and requests
      const [sessionResponse, requestsResponse] = await Promise.all([
        fetch('/api/designer/auth/session', {
          method: 'GET',
          credentials: 'include',
        }),
        fetch('/api/designer/requests', {
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

      setDesigner(sessionData.designer)
      setRequests(requestsData.requests || [])

    } catch (error) {
      console.error('Dashboard error:', error)
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

    } catch (error) {
      console.error('Response error:', error)
      alert(error instanceof Error ? error.message : 'Failed to respond to request')
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
      console.error('Signout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p 
            className="mt-4 text-lg animate-pulse"
            style={{ color: theme.text.secondary }}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="text-center max-w-md">
          <div 
            className="text-6xl mb-4"
            style={{ color: theme.error }}
          >
            ⚠️
          </div>
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: theme.text.primary }}
          >
            Dashboard Error
          </h2>
          <p 
            className="mb-6"
            style={{ color: theme.text.secondary }}
          >
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
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.svg" 
              alt="OneDesigner" 
              className="w-8 h-8"
            />
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Designer Dashboard
              </h1>
              <p 
                className="text-sm"
                style={{ color: theme.text.muted }}
              >
                Welcome back, {designer?.firstName} {designer?.lastName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-2xl transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: theme.nestedBg,
                border: `2px solid ${theme.border}`,
                color: theme.text.primary
              }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${theme.border}`,
                color: theme.text.primary
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Status */}
        {designer && (
          <div 
            className="p-6 rounded-3xl mb-8"
            style={{
              backgroundColor: theme.cardBg,
              border: `2px solid ${theme.border}`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  {designer.firstName[0]}{designer.lastName[0]}
                </div>
                <div>
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: theme.text.primary }}
                  >
                    {designer.firstName} {designer.lastName}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    {designer.title} • {designer.yearsExperience} years experience
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div 
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: designer.isApproved ? theme.success + '20' : theme.accent + '20',
                    color: designer.isApproved ? theme.success : theme.accent
                  }}
                >
                  {designer.isApproved ? '✅ Approved' : '⏳ Under Review'}
                </div>
                
                <Link
                  href="/designer/profile"
                  className="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {!designer.isApproved && (
              <div 
                className="mt-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: theme.accent + '10',
                  border: `1px solid ${theme.accent}40`
                }}
              >
                <p 
                  className="text-sm"
                  style={{ color: theme.text.primary }}
                >
                  <strong>Profile Under Review:</strong> Your profile is being reviewed by our team. 
                  You'll start receiving project requests once approved (usually within 24 hours).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div 
            className="p-6 rounded-3xl"
            style={{
              backgroundColor: theme.cardBg,
              border: `2px solid ${theme.border}`
            }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">📥</span>
              <h3 
                className="text-lg font-bold"
                style={{ color: theme.text.primary }}
              >
                New Requests
              </h3>
            </div>
            <div 
              className="text-3xl font-extrabold"
              style={{ color: theme.accent }}
            >
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.muted }}
            >
              Awaiting your response
            </p>
          </div>

          <div 
            className="p-6 rounded-3xl"
            style={{
              backgroundColor: theme.cardBg,
              border: `2px solid ${theme.border}`
            }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">✅</span>
              <h3 
                className="text-lg font-bold"
                style={{ color: theme.text.primary }}
              >
                Accepted
              </h3>
            </div>
            <div 
              className="text-3xl font-extrabold"
              style={{ color: theme.success }}
            >
              {requests.filter(r => r.status === 'accepted').length}
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.muted }}
            >
              Projects in progress
            </p>
          </div>

          <div 
            className="p-6 rounded-3xl"
            style={{
              backgroundColor: theme.cardBg,
              border: `2px solid ${theme.border}`
            }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">📊</span>
              <h3 
                className="text-lg font-bold"
                style={{ color: theme.text.primary }}
              >
                All Time
              </h3>
            </div>
            <div 
              className="text-3xl font-extrabold"
              style={{ color: theme.text.primary }}
            >
              {requests.length}
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.muted }}
            >
              Total requests received
            </p>
          </div>
        </div>

        {/* Requests List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-2xl font-bold"
              style={{ color: theme.text.primary }}
            >
              Project Requests
            </h2>
          </div>

          {requests.length === 0 ? (
            <div 
              className="text-center py-12 rounded-3xl"
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.border}`
              }}
            >
              <div className="text-6xl mb-4">📮</div>
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: theme.text.primary }}
              >
                No requests yet
              </h3>
              <p 
                className="text-lg mb-6"
                style={{ color: theme.text.secondary }}
              >
                {designer?.isApproved 
                  ? "Project requests will appear here when clients match with you"
                  : "Complete your profile approval to start receiving project requests"
                }
              </p>
              {!designer?.isApproved && (
                <Link
                  href="/designer/profile"
                  className="inline-flex px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  Complete Profile
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className="p-6 rounded-3xl transition-all duration-200"
                  style={{
                    backgroundColor: theme.cardBg,
                    border: `2px solid ${theme.border}`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 
                          className="text-xl font-bold"
                          style={{ color: theme.text.primary }}
                        >
                          {request.brief.designCategory}
                        </h3>
                        <div 
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: request.status === 'pending' ? theme.accent + '20' : 
                                           request.status === 'accepted' ? theme.success + '20' : 
                                           request.status === 'declined' ? theme.error + '20' : theme.text.muted + '20',
                            color: request.status === 'pending' ? theme.accent : 
                                   request.status === 'accepted' ? theme.success : 
                                   request.status === 'declined' ? theme.error : theme.text.muted
                          }}
                        >
                          {request.status === 'pending' ? '⏳ Pending' : 
                           request.status === 'accepted' ? '✅ Accepted' : 
                           request.status === 'declined' ? '❌ Declined' : '⏰ Expired'}
                        </div>
                      </div>
                      
                      <p 
                        className="text-sm mb-3"
                        style={{ color: theme.text.secondary }}
                      >
                        {request.brief.timeline} • {request.brief.budget}
                      </p>

                      <div className="flex items-center space-x-4 text-sm mb-4">
                        <span style={{ color: theme.text.muted }}>
                          Match Score: <strong style={{ color: theme.accent }}>{request.match.score}%</strong>
                        </span>
                        <span style={{ color: theme.text.muted }}>
                          Confidence: <strong>{request.match.confidence}</strong>
                        </span>
                        <span style={{ color: theme.text.muted }}>
                          Risk: <strong>{request.match.riskLevel}</strong>
                        </span>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRequestResponse(request.id, 'decline')}
                          className="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
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
                          className="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: theme.success,
                            color: '#000'
                          }}
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Project Description */}
                  <div 
                    className="p-4 rounded-2xl mb-4"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme.text.primary }}
                    >
                      Project Description:
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: theme.text.secondary }}
                    >
                      {request.brief.projectDescription}
                    </p>
                  </div>

                  {/* Match Analysis */}
                  <div 
                    className="p-4 rounded-2xl mb-4"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme.text.primary }}
                    >
                      Why you're a great match:
                    </h4>
                    <p 
                      className="text-sm mb-2"
                      style={{ color: theme.text.secondary }}
                    >
                      {request.match.matchSummary}
                    </p>
                    <ul className="text-sm space-y-1">
                      {request.match.personalizedReasons.map((reason, index) => (
                        <li 
                          key={index}
                          className="flex items-start space-x-2"
                          style={{ color: theme.text.secondary }}
                        >
                          <span style={{ color: theme.success }}>•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Client Info & Request Time */}
                  <div className="flex justify-between items-center text-sm">
                    <div style={{ color: theme.text.muted }}>
                      <span className="font-medium">Client:</span> {request.client.email}
                    </div>
                    <div style={{ color: theme.text.muted }}>
                      {new Date(request.sentAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}