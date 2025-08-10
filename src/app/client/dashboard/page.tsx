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
  const [isDarkMode, setIsDarkMode] = useState(true)
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

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Signout error:', error)
    }
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation - matching designer dashboard style */}
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
              Client Dashboard
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
            Client Dashboard
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Welcome back{client?.email ? `, ${client.email}` : ''}
          </p>
        </div>

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
            <div className="text-2xl mb-3">💳</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>
              {client?.match_credits || 0}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Available Matches</div>
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
            <div className="text-2xl mb-3">🎯</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.text.primary }}>
              {matches.length}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Total Matches</div>
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
            <div className="text-2xl mb-3">✅</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.success }}>
              {matches.filter(m => m.status === 'unlocked').length}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Unlocked Designers</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/brief"
            className="flex-1 font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] text-center"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            📝 Find New Designer
          </Link>
          
          <Link
            href="/client/purchase"
            className="flex-1 font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] text-center"
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${theme.border}`,
              color: theme.text.primary
            }}
          >
            💳 Buy More Matches
          </Link>
        </div>

        {/* Matches Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            Your Matches
          </h2>
        </div>

        {matches.length === 0 ? (
          <div 
            className="text-center py-16 rounded-3xl"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div className="text-5xl mb-6">🔍</div>
            <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              No matches yet
            </h3>
            <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Submit your first brief to get matched with perfect designers
            </p>
            <Link
              href="/brief"
              className="inline-block mt-6 font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              Create Your First Brief
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div 
                key={match.id}
                className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.002] animate-slideUp"
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                        {match.status === 'unlocked' 
                          ? `${match.designer.firstName} ${match.designer.lastName}` 
                          : `Designer ${match.designer.firstName}***`
                        }
                      </h3>
                      {match.status === 'unlocked' && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                          ✅ Unlocked
                        </span>
                      )}
                      {match.status === 'pending' && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm mb-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {match.designer.title} • {match.designer.city}, {match.designer.country} • {match.designer.yearsExperience} years exp
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: theme.text.muted }}>
                      <span>Match Score: <strong style={{ color: theme.accent }}>{match.score}%</strong></span>
                      <span>Rating: ⭐ {match.designer.rating}/5</span>
                      <span>{new Date(match.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    {match.status === 'pending' && client?.match_credits > 0 && (
                      <button
                        onClick={() => handleUnlockMatch(match.id)}
                        className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          backgroundColor: theme.accent,
                          color: '#000'
                        }}
                      >
                        Unlock (1 match)
                      </button>
                    )}
                    {match.status === 'pending' && client?.match_credits === 0 && (
                      <Link
                        href="/client/purchase"
                        className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          backgroundColor: 'transparent',
                          border: `2px solid ${theme.accent}`,
                          color: theme.accent
                        }}
                      >
                        Buy Matches
                      </Link>
                    )}
                  </div>
                </div>

                {/* Match Summary */}
                <div 
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    <strong style={{ color: theme.text.primary }}>Why this match:</strong> {match.matchSummary || match.reasons.join(' • ')}
                  </p>
                  <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                    {match.brief?.designCategory || 'Not specified'} • {match.brief?.timeline || 'Not specified'} • {match.brief?.budget || 'Not specified'}
                  </p>
                </div>

                {/* Contact Info (if unlocked) */}
                {match.status === 'unlocked' && (
                  <div 
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      backgroundColor: theme.success + '10',
                      border: `1px solid ${theme.success}40`
                    }}
                  >
                    <p className="text-sm font-medium mb-2" style={{ color: theme.success }}>
                      ✅ Contact Information
                    </p>
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
    </main>
  )
}