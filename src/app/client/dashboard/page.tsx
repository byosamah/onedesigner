'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'
import { LoadingSpinner } from '@/components/shared'

interface EnhancedMatch {
  id: string
  score: number
  confidence: string
  matchSummary: string
  reasons: string[]
  personalizedReasons: string[]
  uniqueValue: string
  potentialChallenges: string[]
  riskLevel: string
  status: 'pending' | 'unlocked' | 'completed'
  created_at: string
  designer: {
    id: string
    firstName: string
    lastName: string
    lastInitial: string
    title: string
    city: string
    country: string
    yearsExperience: number
    rating: number
    totalProjects: number
    designPhilosophy: string
    primaryCategories: string[]
    styleKeywords: string[]
    avgClientSatisfaction: number
    onTimeDeliveryRate: number
  }
  brief: {
    designCategory: string
    timeline: string
    budget: string
    description: string
  }
}

interface ClientProfile {
  id: string
  email: string
  match_credits: number
  created_at: string
}

export default function ClientDashboard() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [matches, setMatches] = useState<EnhancedMatch[]>([])
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

      // Fetch client session and matches
      const [sessionResponse, matchesResponse] = await Promise.all([
        fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        }),
        fetch('/api/client/matches', {
          method: 'GET',
          credentials: 'include',
        })
      ])

      if (!sessionResponse.ok || !matchesResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const sessionData = await sessionResponse.json()
      const matchesData = await matchesResponse.json()

      setClient(sessionData.client || sessionData.user)
      setMatches(matchesData.matches || [])

    } catch (error) {
      console.error('Dashboard error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlockMatch = async (matchId: string) => {
    try {
      const response = await fetch(`/api/client/matches/${matchId}/unlock`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to unlock match')
      }

      // Refresh matches after unlock
      fetchDashboardData()
      
    } catch (error) {
      console.error('Unlock error:', error)
      alert(error instanceof Error ? error.message : 'Failed to unlock match')
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
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Try Again
          </button>
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
                My Dashboard
              </h1>
              <p 
                className="text-sm"
                style={{ color: theme.text.muted }}
              >
                Welcome back{client?.email ? `, ${client.email}` : ''}
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
          </div>
        </div>

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
              <span className="text-2xl">💳</span>
              <h3 
                className="text-lg font-bold"
                style={{ color: theme.text.primary }}
              >
                Available Matches
              </h3>
            </div>
            <div 
              className="text-3xl font-extrabold"
              style={{ color: theme.accent }}
            >
              {client?.match_credits || 0}
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.muted }}
            >
              Use to unlock designer contacts
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
              <span className="text-2xl">🎯</span>
              <h3 
                className="text-lg font-bold"
                style={{ color: theme.text.primary }}
              >
                Total Matches
              </h3>
            </div>
            <div 
              className="text-3xl font-extrabold"
              style={{ color: theme.accent }}
            >
              {matches.length}
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.muted }}
            >
              AI-powered designer matches
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
                Unlocked
              </h3>
            </div>
            <div 
              className="text-3xl font-extrabold"
              style={{ color: theme.success }}
            >
              {matches.filter(m => m.status === 'unlocked').length}
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.muted }}
            >
              Ready to contact
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/brief"
            className="flex-1 flex items-center justify-center px-8 py-4 rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            <span className="mr-2">📝</span>
            Find New Designer
          </Link>
          
          <Link
            href="/client/purchase"
            className="flex-1 flex items-center justify-center px-8 py-4 rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${theme.border}`,
              color: theme.text.primary
            }}
          >
            <span className="mr-2">💳</span>
            Buy More Matches
          </Link>
        </div>

        {/* Matches List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-2xl font-bold"
              style={{ color: theme.text.primary }}
            >
              Your Matches
            </h2>
          </div>

          {matches.length === 0 ? (
            <div 
              className="text-center py-12 rounded-3xl"
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.border}`
              }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: theme.text.primary }}
              >
                No matches yet
              </h3>
              <p 
                className="text-lg mb-6"
                style={{ color: theme.text.secondary }}
              >
                Submit your first brief to get matched with perfect designers
              </p>
              <Link
                href="/brief"
                className="inline-flex px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000'
                }}
              >
                Create Your First Brief
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map((match) => (
                <div 
                  key={match.id}
                  className="p-6 rounded-3xl transition-all duration-200"
                  style={{
                    backgroundColor: theme.cardBg,
                    border: `2px solid ${theme.border}`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 
                        className="text-xl font-bold mb-1"
                        style={{ color: theme.text.primary }}
                      >
                        {match.status === 'unlocked' 
                          ? `${match.designer.firstName} ${match.designer.lastName}` 
                          : `Designer ${match.designer.firstName}***`
                        }
                      </h3>
                      <p 
                        className="text-sm mb-2"
                        style={{ color: theme.text.secondary }}
                      >
                        {match.designer.title} • {match.designer.city}, {match.designer.country}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span style={{ color: theme.text.muted }}>
                          Match Score: <strong style={{ color: theme.accent }}>{match.score}%</strong>
                        </span>
                        <span style={{ color: theme.text.muted }}>
                          Experience: {match.designer.yearsExperience} years
                        </span>
                        <span style={{ color: theme.text.muted }}>
                          Rating: ⭐ {match.designer.rating}/5
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: match.status === 'unlocked' ? theme.success + '20' : 
                                         match.status === 'pending' ? theme.accent + '20' : theme.text.muted + '20',
                          color: match.status === 'unlocked' ? theme.success : 
                                 match.status === 'pending' ? theme.accent : theme.text.muted
                        }}
                      >
                        {match.status === 'unlocked' ? '✅ Unlocked' : 
                         match.status === 'pending' ? '🔒 Locked' : '✅ Complete'}
                      </div>
                      
                      {match.status === 'pending' && (
                        <button
                          onClick={() => handleUnlockMatch(match.id)}
                          className="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: theme.accent,
                            color: '#000'
                          }}
                        >
                          Unlock (1 match)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Match Summary */}
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
                      Why this match is perfect:
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: theme.text.secondary }}
                    >
                      {match.matchSummary || match.reasons.join(' • ')}
                    </p>
                  </div>

                  {/* Brief Info */}
                  <div className="flex justify-between items-center text-sm">
                    <div style={{ color: theme.text.muted }}>
                      <span className="font-medium">Project:</span> {match.brief.designCategory} • {match.brief.timeline} • {match.brief.budget}
                    </div>
                    <div style={{ color: theme.text.muted }}>
                      {new Date(match.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Contact Info (if unlocked) */}
                  {match.status === 'unlocked' && (
                    <div 
                      className="mt-4 p-4 rounded-2xl"
                      style={{
                        backgroundColor: theme.success + '10',
                        border: `1px solid ${theme.success}40`
                      }}
                    >
                      <h5 
                        className="font-bold mb-2"
                        style={{ color: theme.success }}
                      >
                        Contact Information:
                      </h5>
                      <div className="text-sm space-y-1" style={{ color: theme.text.primary }}>
                        <p><strong>Email:</strong> {match.designer.firstName.toLowerCase()}@example.com</p>
                        <p><strong>Portfolio:</strong> {match.designer.firstName.toLowerCase()}designs.com</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}