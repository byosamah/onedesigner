'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { EnhancedMatchCard } from '@/components/match/EnhancedMatchCard'

interface MatchResult {
  phase: 'instant' | 'refined' | 'final'
  match: any
  confidence: number
  elapsed: number
  alternatives?: any[]
}

const loadingMessages = [
  { delay: 0, message: "🔍 Analyzing your requirements..." },
  { delay: 1500, message: "🎯 Finding designers who match your needs..." },
  { delay: 3000, message: "✨ Evaluating portfolio compatibility..." },
  { delay: 4500, message: "🎨 Checking design style alignment..." },
  { delay: 6000, message: "💼 Reviewing experience and expertise..." },
  { delay: 7500, message: "⚡ Finalizing your perfect matches..." },
]

export default function EnhancedMatchPage() {
  const params = useParams()
  const briefId = params.briefId as string
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const [matches, setMatches] = useState<any[]>([])
  const [briefData, setBriefData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0].message)
  const [currentPhase, setCurrentPhase] = useState<'instant' | 'refined' | 'final' | null>(null)

  useEffect(() => {
    // Update loading messages
    const messageTimer = setInterval(() => {
      const elapsed = Date.now() - startTime.current
      const currentMessage = loadingMessages
        .slice()
        .reverse()
        .find(msg => elapsed >= msg.delay) || loadingMessages[0]
      setLoadingMessage(currentMessage.message)
    }, 100)

    fetchProgressiveMatches()

    return () => clearInterval(messageTimer)
  }, [briefId])

  const startTime = useRef(Date.now())

  const fetchProgressiveMatches = async () => {
    try {
      setIsLoading(true)
      setError(null)
      startTime.current = Date.now()

      // Simulate progressive loading while fetching
      setTimeout(() => setCurrentPhase('instant'), 500)
      setTimeout(() => setCurrentPhase('refined'), 1500)
      setTimeout(() => setCurrentPhase('final'), 2500)

      // Use regular API with AI matching
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch matches')
      }

      const data = await response.json()
      
      // Show only the first match
      if (data.matches && data.matches.length > 0) {
        setMatches([data.matches[0]])
      }
      
      setBriefData(data.briefData || null)
      
      // Keep loading for minimum time to show animations
      setTimeout(() => {
        setIsLoading(false)
      }, 3000)

    } catch (error) {
      console.error('Error fetching matches:', error)
      setError(error instanceof Error ? error.message : 'Failed to load matches')
      setIsLoading(false)
    }
  }

  const fetchRegularMatches = async () => {
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
      setBriefData(data.briefData || null)
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching matches:', error)
      setError(error instanceof Error ? error.message : 'Failed to load matches')
      setIsLoading(false)
    }
  }

  const handleUnlock = async (matchId: string) => {
    try {
      const response = await fetch(`/api/client/matches/${matchId}/unlock`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to unlock designer')
      }

      // Refresh matches to update unlock status
      await fetchRegularMatches()
    } catch (error) {
      console.error('Error unlocking match:', error)
    }
  }

  if (error) {
    return (
      <main className="min-h-screen transition-colors duration-300 animate-fadeIn" style={{ backgroundColor: theme.bg }}>
        {/* Navigation */}
        <nav className="px-8 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
              </svg>
              OneDesigner
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="animate-slideUp">
            <div 
              className="text-center rounded-3xl p-8"
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div 
                className="text-5xl mb-4"
                style={{ color: theme.error }}
              >
                ⚠️
              </div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: theme.text.primary }}
              >
                Unable to Load Matches
              </h2>
              <p 
                className="mb-6 max-w-sm mx-auto"
                style={{ color: theme.text.secondary }}
              >
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null)
                  fetchProgressiveMatches()
                }}
                className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000'
                }}
              >
                Try Again →
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300 animate-fadeIn" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
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
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center animate-slideUp">
          <h1 className="text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
            {isLoading && matches.length === 0 ? 'Finding Your Perfect Match' : 'Your Perfect Match'}
          </h1>
          <p className="text-lg" style={{ color: theme.text.secondary }}>
            {isLoading && matches.length === 0 
              ? 'We\'re analyzing designers to find the best match for your project'
              : 'We found the perfect designer for your project'
            }
          </p>
        </div>

        {/* Loading State */}
        {isLoading && matches.length === 0 && (
          <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div 
              className="rounded-3xl p-8 text-center"
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div className="space-y-6">
                {/* Animated Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="text-5xl animate-pulse" style={{ color: theme.accent }}>
                      🎯
                    </div>
                    <div className="absolute -right-2 -bottom-2 text-2xl animate-spin">
                      ✨
                    </div>
                  </div>
                </div>
                
                {/* Loading Message */}
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
                    {loadingMessage}
                  </h3>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    This usually takes 10-15 seconds
                  </p>
                </div>
                
                {/* Progress Steps */}
                <div className="flex justify-center items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${currentPhase ? 'scale-125' : ''}`}
                      style={{ backgroundColor: currentPhase ? theme.accent : theme.border }}
                    />
                    <span className="text-xs" style={{ color: currentPhase ? theme.text.primary : theme.text.muted }}>
                      Analyzing
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${currentPhase === 'refined' || currentPhase === 'final' ? 'scale-125' : ''}`}
                      style={{ backgroundColor: currentPhase === 'refined' || currentPhase === 'final' ? theme.accent : theme.border }}
                    />
                    <span className="text-xs" style={{ color: currentPhase === 'refined' || currentPhase === 'final' ? theme.text.primary : theme.text.muted }}>
                      Matching
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${currentPhase === 'final' ? 'scale-125' : ''}`}
                      style={{ backgroundColor: currentPhase === 'final' ? theme.accent : theme.border }}
                    />
                    <span className="text-xs" style={{ color: currentPhase === 'final' ? theme.text.primary : theme.text.muted }}>
                      Finalizing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progressive Match Results */}
        {matches.length > 0 && (
          <>
            {/* Phase indicator */}
            {currentPhase && isLoading && (
              <div 
                className="mb-8 p-6 rounded-3xl text-center animate-slideUp"
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <p 
                  className="text-lg font-medium"
                  style={{ color: theme.text.primary }}
                >
                  {currentPhase === 'instant' && '⚡ Quick match found - refining results...'}
                  {currentPhase === 'refined' && '🎯 Match refined - performing deep analysis...'}
                  {currentPhase === 'final' && '✨ Analysis complete!'}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {matches.map((match, index) => (
                <div 
                  key={match.id || match.designer.id}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EnhancedMatchCard
                    match={match}
                    isDarkMode={isDarkMode}
                    onUnlock={() => handleUnlock(match.id)}
                    isTopMatch={index === 0}
                  />
                </div>
              ))}
              
              {/* AI-powered notice */}
              {!isLoading && (
                <div 
                  className="text-center py-8 animate-fadeIn"
                  style={{
                    borderTop: `1px solid ${theme.border}`,
                    animationDelay: '300ms'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">✨</span>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: theme.text.muted }}
                    >
                      AI-powered matching analyzing 15+ compatibility factors
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!isLoading && matches.length === 0 && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-6xl mb-4">🔍</div>
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ color: theme.text.primary }}
            >
              No Matches Found
            </h3>
            <p 
              className="text-lg"
              style={{ color: theme.text.secondary }}
            >
              We couldn't find any designers matching your criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}