'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { EnhancedMatchCard } from '@/components/match/EnhancedMatchCard'
import { logger } from '@/lib/core/logging-service'

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
  const [clientData, setClientData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0].message)
  const [currentPhase, setCurrentPhase] = useState<'instant' | 'refined' | 'final' | null>(null)
  const [isFindingNewMatch, setIsFindingNewMatch] = useState(false)

  useEffect(() => {
    // Store brief ID in sessionStorage for payment success redirect
    if (briefId && briefId !== 'undefined') {
      sessionStorage.setItem('currentBriefId', briefId)
    }
    
    // Update loading messages
    const messageTimer = setInterval(() => {
      const elapsed = Date.now() - startTime.current
      const currentMessage = loadingMessages
        .slice()
        .reverse()
        .find(msg => elapsed >= msg.delay) || loadingMessages[0]
      setLoadingMessage(currentMessage.message)
    }, 100)

    // Only fetch matches on initial load, not when finding new match
    if (!isFindingNewMatch) {
      fetchProgressiveMatches()
    }

    return () => clearInterval(messageTimer)
  }, [briefId, isFindingNewMatch])

  const startTime = useRef(Date.now())

  const fetchProgressiveMatches = async () => {
    try {
      logger.info('🎯 Starting match fetch for briefId:', briefId)
      setIsLoading(true)
      setError(null)
      startTime.current = Date.now()

      // Validate briefId
      if (!briefId || briefId === 'undefined') {
        throw new Error('Invalid brief ID')
      }

      // First, check if we have existing matches for this brief
      logger.info('📡 Checking for existing matches...')
      const existingMatchesResponse = await fetch(`/api/client/matches?briefId=${briefId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (existingMatchesResponse.ok) {
        const existingData = await existingMatchesResponse.json()

        // If we have existing matches for this brief, use them instead of generating new ones
        if (existingData.matches && existingData.matches.length > 0) {
          const briefMatches = existingData.matches.filter((m: any) => m.brief_id === briefId)

          if (briefMatches.length > 0) {
            logger.info('✅ Found existing matches for this brief, loading them...')
            setMatches(briefMatches)

            // Get brief data
            if (briefMatches[0].brief) {
              setBriefData(briefMatches[0].brief)
            }

            // Skip the AI matching since we have saved matches
            setTimeout(() => {
              setIsLoading(false)
            }, 1000)

            return // Exit early, don't generate new matches
          }
        }
      }

      // Only generate new matches if we don't have existing ones
      logger.info('📡 No existing matches found, generating new ones...')

      // Simulate progressive loading while fetching
      setTimeout(() => setCurrentPhase('instant'), 500)
      setTimeout(() => setCurrentPhase('refined'), 1500)
      setTimeout(() => setCurrentPhase('final'), 2500)

      // Use optimized API that saves matches to database
      logger.info('📡 Making API request to /api/match/optimized with briefId:', briefId)
      const response = await fetch('/api/match/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brief_id: briefId }), // Note: optimized endpoint uses brief_id
      })

      logger.info('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        logger.error('❌ API Error:', errorData)
        throw new Error(errorData.error || errorData.message || 'Failed to fetch matches')
      }

      const data = await response.json()

      // Show only the first match (optimized endpoint returns top matches)
      if (data.matches && data.matches.length > 0) {
        setMatches([data.matches[0]])
      }

      setBriefData(data.brief || null)
      
      // Always get client data for credits info
      try {
        const clientResponse = await fetch('/api/auth/session')
        if (clientResponse.ok) {
          const clientSession = await clientResponse.json()
          setClientData(clientSession.client || clientSession.user)
          logger.info('🏦 Client data loaded:', clientSession.client || clientSession.user)
        } else {
          logger.info('❌ Client session not found, checking for stored email')
          // If no session but we have a stored email, prompt to re-login
          const storedEmail = localStorage.getItem('client_email')
          if (storedEmail) {
            // Store current URL to return after login
            sessionStorage.setItem('returnUrl', window.location.pathname)
            // Don't throw error, just note that re-login may be needed
            logger.info('📧 Stored email found, user may need to re-authenticate')
          }
        }
      } catch (error) {
        logger.error('Error fetching client data:', error)
      }
      
      // Keep loading for minimum time to show animations
      setTimeout(() => {
        setIsLoading(false)
      }, 3000)

    } catch (error) {
      logger.error('Error fetching matches:', error)
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
      logger.error('Error fetching matches:', error)
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unlock designer')
      }

      const result = await response.json()
      
      // Update client credits immediately
      if (clientData && result.remainingCredits !== undefined) {
        setClientData({
          ...clientData,
          match_credits: result.remainingCredits
        })
      }

      // Update the match status locally immediately for better UX
      setMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === matchId 
            ? { ...m, status: 'unlocked' }
            : m
        )
      )
      
      // Also refresh from server to ensure consistency
      await fetchRegularMatches()
      
      // Don't show alert - the UI will update to show unlocked state
      logger.info('✅ Designer unlocked successfully!')
    } catch (error) {
      logger.error('Error unlocking match:', error)
      alert(error instanceof Error ? error.message : 'Failed to unlock designer')
    }
  }

  const handleFindNewMatch = async () => {
    try {
      logger.info('🎯 Finding new match with auto-unlock for briefId:', briefId)
      
      // Clear existing matches and show loading state
      setMatches([])
      setIsFindingNewMatch(true)
      setIsLoading(true)
      setCurrentPhase(null)
      
      // Reset loading message
      startTime.current = Date.now()
      setLoadingMessage(loadingMessages[0].message)
      
      // Simulate progressive loading phases
      setTimeout(() => setCurrentPhase('instant'), 500)
      setTimeout(() => setCurrentPhase('refined'), 1500)
      setTimeout(() => setCurrentPhase('final'), 2500)
      
      const response = await fetch('/api/match/find-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          briefId,
          autoUnlock: true // This will deduct 1 credit and auto-unlock
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to find new match')
      }

      const data = await response.json()
      
      if (data.match) {
        // Update credits if returned
        if (data.remainingCredits !== undefined && clientData) {
          setClientData({
            ...clientData,
            match_credits: data.remainingCredits
          })
        }
        
        // Keep loading for minimum time to show animations
        setTimeout(() => {
          setMatches([data.match])
          setIsLoading(false)
          setIsFindingNewMatch(false)
        }, 3000)
        
        logger.info('✅ New match found and unlocked automatically!')
      } else {
        setIsLoading(false)
        setIsFindingNewMatch(false)
      }

    } catch (error) {
      logger.error('Error finding new match:', error)
      alert(error instanceof Error ? error.message : 'Failed to find new match')
      setIsLoading(false)
      setIsFindingNewMatch(false)
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

          {/* Right side - Match Info and Theme Toggle */}
          <div className="flex items-center gap-4">
            {!isLoading && matches.length > 0 && (
              <>
                <button 
                  onClick={() => window.location.href = '/client/dashboard'}
                  className="text-sm font-medium hover:underline transition-colors duration-300"
                  style={{ color: theme.text.secondary }}
                >
                  Previous matches
                </button>
                
                <button
                  onClick={() => {
                    if (clientData?.match_credits > 0) {
                      // Do nothing, just display info
                    } else {
                      // Navigate to purchase page
                      window.location.href = '/client/purchase'
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    clientData?.match_credits > 0 ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
                  }`}
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  <span className="font-normal">You have</span> <span className="font-bold">{clientData?.match_credits || 0} match{(clientData?.match_credits || 0) !== 1 ? 'es' : ''}</span>
                </button>
                
                {/* Divider */}
                <div className="h-6 w-px" style={{ backgroundColor: theme.border }}></div>
              </>
            )}
            
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
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header - Only show when matches are found */}
        {!isLoading && matches.length > 0 && (
          <div className="mb-8 text-center animate-slideUp">
            <h1 className="text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
              {clientData?.match_credits > 0 ? 'Your Perfect Match' : 'Match Found!'}
            </h1>
            <p className="text-lg" style={{ color: theme.text.secondary }}>
              {clientData?.match_credits > 0 
                ? 'We found the perfect designer for your project'
                : 'Purchase credits to unlock and connect with this designer'}
            </p>
          </div>
        )}

        {/* Loading State - Simplified without box */}
        {isLoading && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
            <div className="space-y-8">
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
              <div className="text-center">
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
              {matches.slice(0, 1).map((match, index) => (
                <div 
                  key={match.id || match.designer.id}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EnhancedMatchCard
                    match={match}
                    isDarkMode={isDarkMode}
                    onUnlock={() => handleUnlock(match.id)}
                    onFindNewMatch={handleFindNewMatch}
                    isUnlocked={match.status === 'unlocked' || match.status === 'accepted'}
                    isTopMatch={true}
                    matchCredits={clientData?.match_credits || 0}
                  />
                </div>
              ))}
              
              {/* AI-powered notice */}
              {!isLoading && (
                <div className="text-center py-8">
                  <div 
                    className="animate-fadeIn"
                    style={{
                      borderTop: `1px solid ${theme.border}`,
                      paddingTop: '2rem',
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
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!isLoading && matches.length === 0 && (
          <div className="text-center py-12 animate-fadeIn">
            <div 
              className="max-w-2xl mx-auto p-8 rounded-3xl"
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div className="text-6xl mb-6">🔍</div>
              <h3 
                className="text-3xl font-bold mb-4"
                style={{ color: theme.text.primary }}
              >
                No Match Found
              </h3>
              <div className="space-y-4 mb-8">
                <p 
                  className="text-lg"
                  style={{ color: theme.text.secondary }}
                >
                  We couldn't find designers matching your current criteria.
                </p>
                <div 
                  className="text-sm space-y-2"
                  style={{ color: theme.text.muted }}
                >
                  <p>💡 <strong>Try these suggestions:</strong></p>
                  <ul className="list-none space-y-1">
                    <li>• Add more details about your project requirements</li>
                    <li>• Expand your timeline or budget range</li>
                    <li>• Include additional design styles or preferences</li>
                    <li>• Provide more context about your target audience</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/brief'}
                  className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: theme.accent, 
                    color: '#000',
                    focusRingColor: theme.accent + '50'
                  }}
                >
                  Create New Brief
                </button>
                <button
                  onClick={() => window.location.href = '/client/dashboard'}
                  className="px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: theme.text.primary,
                    border: `2px solid ${theme.border}`,
                    focusRingColor: theme.border + '50'
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}