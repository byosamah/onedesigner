'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { OptimizedMatchFinder } from '@/components/OptimizedMatchFinder'
import { AnimatedLoadingMessages } from '@/components/AnimatedLoadingMessages'
import { getTheme } from '@/lib/design-system'

interface Designer {
  id: string
  firstName: string
  lastInitial: string
  lastName?: string
  title: string
  city: string
  country: string
  yearsExperience: number
  rating: number
  totalProjects: number
  avatarUrl?: string
  styles: string[]
  industries: string[]
  specializations?: string[]
  communicationStyle?: string
  teamSize?: string
  avgClientSatisfaction?: number
  onTimeDeliveryRate?: number
  projectCompletionRate?: number
  email?: string
  phone?: string
  website?: string
  calendly_url?: string
}

interface QuickStat {
  label: string
  value: string
  relevance: 'high' | 'medium' | 'low'
}

interface AlternativeOption {
  designer_id: string
  name: string
  score: number
  uniqueStrength: string
}

interface Match {
  id: string
  score: number
  confidence?: 'high' | 'medium' | 'low'
  reasons: string[]
  personalizedReasons: string[]
  matchExplanation?: string
  keyStrengths?: string[]
  quickStats?: QuickStat[]
  uniqueValue?: string
  challenges?: string[]
  riskLevel?: 'low' | 'medium' | 'high'
  matchSummary?: string
  designer: Designer
  alternativeOptions?: AlternativeOption[]
}

interface Client {
  id: string
  email: string
  match_credits: number
}

export default function MatchPage() {
  const router = useRouter()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [match, setMatch] = useState<Match | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [useOptimized, setUseOptimized] = useState(true) // Default to optimized
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const theme = getTheme(isDarkMode)
  const initialized = useRef(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    
    initializeMatchPage()
  }, [])

  const initializeMatchPage = async () => {
    try {
      // Clear any stale match data
      setMatch(null)
      setError('')
      
      // First check if we have a brief ID
      let briefId = sessionStorage.getItem('currentBriefId')
      
      // If no brief ID, try to create the brief first
      if (!briefId) {
        const briefDataStr = sessionStorage.getItem('briefData')
        if (briefDataStr) {
          const briefData = JSON.parse(briefDataStr)
          const briefResponse = await fetch('/api/briefs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(briefData),
            credentials: 'include' // Important for cookies
          })

          if (briefResponse.ok) {
            const { brief } = await briefResponse.json()
            briefId = brief.id
            sessionStorage.setItem('currentBriefId', brief.id)
          } else {
            const errorData = await briefResponse.json()
            console.error('Brief creation failed:', errorData)
            // If unauthorized, redirect to home
            if (briefResponse.status === 401) {
              router.push('/')
              return
            }
            throw new Error(errorData.error || 'Failed to create brief')
          }
        } else {
          // No brief data, redirect to start
          router.push('/brief')
          return
        }
      }

      // Now fetch the match
      if (briefId) {
        await fetchMatch(briefId)
        await fetchClientData()
      } else {
        throw new Error('No brief ID available')
      }
    } catch (error) {
      console.error('Error initializing match page:', error)
      setError('Failed to load your match. Please try again.')
      setIsLoading(false)
    }
  }

  const fetchMatch = async (briefId: string, forceNew: boolean = false) => {
    if (!briefId) {
      console.error('No briefId provided to fetchMatch')
      setError('No brief ID available')
      setIsLoading(false)
      return
    }
    
    try {
      // Only check for existing matches if not forcing a new one
      if (!forceNew) {
        // First, check if we already have matches for this client
        console.log('Checking for existing matches...')
        const matchesResponse = await fetch('/api/client/matches', {
          credentials: 'include'
        })
        
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()
          if (matchesData.matches && matchesData.matches.length > 0) {
            // Find a pending match (not yet unlocked)
            const pendingMatch = matchesData.matches.find(m => m.status === 'pending')
            
            if (pendingMatch) {
              console.log('Found pending match:', pendingMatch.id)
              setMatch(pendingMatch)
              setIsUnlocked(false)
              setIsLoading(false)
              return
            }
            
            // All existing matches are unlocked, need to create a new one
            console.log('All existing matches are unlocked, creating new match...')
          }
        }
      }
      
      // If no existing match, create a new one
      console.log('No existing match found, creating new match for brief:', briefId)
      const response = await fetch('/api/match/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId }),
        credentials: 'include'
      })

      const responseText = await response.text()
      console.log('Response status:', response.status)
      console.log('Response text:', responseText)

      if (!response.ok) {
        console.error('Match API error:', response.status, responseText)
        let errorMessage = 'Failed to find match'
        let userMessage = null
        
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorMessage
          userMessage = errorData.userMessage || null
          
          // If it's an AI quota or service error, show the user-friendly message
          if (errorData.error === 'AI_QUOTA_EXCEEDED' || errorData.error === 'AI_SERVICE_ERROR') {
            setError(userMessage || "There's a problem with our matching system. Our team will solve it soon.")
          } else if (errorData.error === 'ALL_DESIGNERS_UNLOCKED') {
            setError(userMessage || "You've unlocked all available designers! Check your dashboard to see all your matches.")
          } else if (errorData.error === 'NO_APPROVED_DESIGNERS') {
            setError(userMessage || "No designers are available right now. Our team is reviewing new applications. Please try again later.")
          } else {
            setError(`${errorMessage}. Please try again.`)
          }
        } catch {
          // If response is not JSON, use default message
          setError('Failed to find match. Please try again.')
        }
        
        setIsLoading(false)
        return
      }

      const data = JSON.parse(responseText)
      console.log('Match found:', data)
      
      if (data.match) {
        setMatch(data.match)
      } else {
        setError('No match found')
      }
    } catch (err) {
      console.error('Error fetching match:', err)
      setError(`Network error: ${err instanceof Error ? err.message : 'Failed to load match'}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClientData = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setClient(data.client)
      }
    } catch (error) {
      console.error('Error fetching client data:', error)
    }
  }

  const handleUnlock = async (productKey?: 'STARTER_PACK' | 'GROWTH_PACK' | 'SCALE_PACK') => {
    setIsProcessing(true)
    
    try {
      // Check if client has credits
      if (client && client.match_credits > 0 && !productKey) {
        // Use credit to unlock
        console.log('Attempting to unlock with credit, match ID:', match?.id)
        
        if (!match?.id) {
          alert('No match found to unlock')
          setIsProcessing(false)
          return
        }
        
        const response = await fetch(`/api/client/matches/${match.id}/unlock`, {
          method: 'POST',
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Unlock result:', result)
          
          if (!result.alreadyUnlocked) {
            // Only refresh client data if credits were actually used
            await fetchClientData() // Refresh credit balance
          }
          
          setIsUnlocked(true)
          return
        } else {
          const error = await response.json()
          console.error('Unlock failed:', error)
          alert(error.error || 'Failed to unlock match')
          setIsProcessing(false)
          return
        }
      }

      // Otherwise, create checkout session
      if (!productKey) {
        alert('Please select a package or use a credit')
        return
      }

      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey,
          matchId: match?.id
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout')
      }

      const { checkoutUrl } = await response.json()
      
      // Redirect to Lemon Squeezy checkout
      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Payment failed:', error)
      if (error.message?.includes('Failed to fetch')) {
        alert('Unable to connect to the payment service. Please ensure you are accessing the app on the correct port (http://localhost:3000)')
      } else {
        alert('Failed to start checkout. Please try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Use optimized matcher if enabled and user is authenticated
  if (useOptimized && !initialized.current && !isLoading) {
    const briefId = sessionStorage.getItem('currentBriefId')
    if (briefId) {
      return (
        <main className="min-h-screen py-16 px-4 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
          <div className="w-full max-w-4xl mx-auto">
            <OptimizedMatchFinder 
              briefId={briefId}
              onMatchFound={(matchResult) => {
                console.log('Match found:', matchResult.phase, matchResult.match.score)
              }}
            />
          </div>
        </main>
      )
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-5xl mb-6 animate-pulse">🔍</div>
          <h2 className="text-xl font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Finding your perfect designer...
          </h2>
          <AnimatedLoadingMessages />
        </div>
      </main>
    )
  }

  if (error || !match) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center max-w-md space-y-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            Oops! Something went wrong
          </h2>
          <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
            {error || 'Unable to find a match at this time.'}
          </p>
          <div className="pt-4">
            <Link 
              href="/brief" 
              className="font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]" 
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Try Again
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!match) {
    return (
      <main className="min-h-screen py-16 px-4 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              No Match Found
            </h1>
            <p className="mb-8 transition-colors duration-300" style={{ color: theme.text.secondary }}>
              We couldn't find your match. Please try creating a new project brief.
            </p>
          </div>
          <div className="pt-4">
            <Link 
              href="/brief" 
              className="font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]" 
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Create New Brief
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      
      {/* Top Navigation Bar */}
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
          <div className="flex items-center gap-8">
            {client && (
              <div className="flex items-center gap-6">
                <Link href="/client/dashboard" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  Previous Matches
                </Link>
                
                <div className="text-sm px-4 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: theme.accent, color: '#000' }}>
                  <span className="font-normal">You have</span> <span className="font-bold">{client.match_credits} matches</span>
                </div>
              </div>
            )}
            
            {/* Theme Toggle - Separated */}
            <div className="border-l pl-8" style={{ borderColor: theme.border }}>
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
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-6">🎯</div>
          <h1 className="text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Holy Pixels! AI Found Your Perfect Designer
          </h1>
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            One brief. Zero browsing. Design starts in 48 hours.
          </p>
        </div>

        <div 
          className="max-w-4xl mx-auto rounded-3xl p-8 transition-all duration-300"
          style={{ 
            backgroundColor: theme.cardBg, 
            border: `1px solid ${theme.border}`,
            boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Designer Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-colors duration-300 ${!isUnlocked && 'blur-sm'}`} 
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                {match.designer?.firstName?.[0] || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {match.designer?.firstName || 'Designer'} {!isUnlocked ? (match.designer?.lastInitial || '') + '***' : match.designer?.lastName || ''}
                </h2>
                <p className="mb-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  {match.designer?.title || 'Designer'}
                </p>
                <div className="flex items-center gap-4 text-sm" style={{ color: theme.text.muted }}>
                  <span>📍 {match.designer?.city || 'Location'}</span>
                  <span>⭐ {match.designer?.rating || '5.0'}</span>
                  <span>💼 {match.designer?.totalProjects || '10'} projects</span>
                </div>
              </div>
            </div>
            
            {/* Match Score */}
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: theme.accent }}>{match.score}%</div>
              <div className="text-base" style={{ color: theme.text.muted }}>Match Score</div>
              {match.confidence && (
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  match.confidence === 'high' ? 'text-green-400' : 
                  match.confidence === 'medium' ? 'text-yellow-400' : 
                  'text-gray-400'
                }`}>
                  {match.confidence} confidence
                </div>
              )}
            </div>
          </div>

          {/* Match Explanation */}
          {match.matchExplanation && (
            <div className="rounded-2xl p-6 mb-8 transition-colors duration-300" style={{ backgroundColor: theme.nestedBg }}>
              <p className="leading-relaxed transition-colors duration-300" style={{ color: theme.text.secondary }}>
                {match.matchExplanation}
              </p>
            </div>
          )}

          {/* Key Strengths */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Why our AI picked {match.designer?.firstName || 'this designer'} ({match.score}% match) 🔥
            </h3>
            <div className="space-y-3">
              {(match.keyStrengths || match.personalizedReasons || match.personalized_reasons || []).map((reason, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300" 
                    style={{ backgroundColor: theme.accent }}>
                    <span className="text-xs" style={{ color: '#000' }}>✓</span>
                  </div>
                  <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Industries */}
          {match.designer && (
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>Design Styles</h4>
                <div className="flex flex-wrap gap-2">
                  {(match.designer.styles || ['Modern', 'Clean', 'Minimalist']).map((style) => (
                    <span key={style} className="px-4 py-2 rounded-lg text-sm transition-colors duration-300" 
                      style={{ backgroundColor: theme.nestedBg, color: theme.text.primary }}>
                      {style}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {(match.designer.industries || ['SaaS', 'Tech', 'Fintech']).map((industry) => (
                    <span key={industry} className="px-4 py-2 rounded-lg text-sm transition-colors duration-300" 
                      style={{ backgroundColor: theme.nestedBg, color: theme.text.primary }}>
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Work */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Recent work ({match.designer?.totalProjects || '10'} launched designs) 🎨
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop'
              ].map((imgUrl, i) => (
                <div 
                  key={i} 
                  className="aspect-video rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105" 
                  onClick={() => setSelectedImage(imgUrl)}
                  style={{ backgroundColor: theme.nestedBg }}
                >
                  <img 
                    src={imgUrl} 
                    alt={`Portfolio project ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {match.quickStats && match.quickStats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {match.quickStats.slice(0, 6).map((stat, index) => (
                <div 
                  key={index} 
                  className={`text-center p-3 rounded-lg ${
                    stat.relevance === 'high' ? 'bg-green-50' : 
                    stat.relevance === 'medium' ? 'bg-blue-50' : 
                    'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          )}


          {!isUnlocked ? (
            <div className="border-t pt-8 space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Stop wasting weeks on Upwork 🛒
                </h3>
                <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  1 credit = {match.designer?.firstName || 'this designer'}'s direct line. No bidding wars. No BS.
                </p>
                {client && client.match_credits > 0 && (
                  <p className="text-sm font-medium mt-2" style={{ color: theme.accent }}>
                    You have {client.match_credits} credit{client.match_credits > 1 ? 's' : ''} ready to go
                  </p>
                )}
              </div>

              {/* What you get */}
              <div className="rounded-2xl p-6 mb-6 transition-colors duration-300" style={{ backgroundColor: theme.nestedBg }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    `Full designer profile (bye bye ${match.designer?.firstName || 'Designer'} ${(match.designer?.lastInitial || '') + '***'})`,
                    'Direct email + phone (no platform fees)', 
                    `Complete portfolio (all ${match.designer?.totalProjects || '10'} shipped projects)`, 
                    'Calendly link (book today, start tomorrow)'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span style={{ color: theme.accent }}>✓</span>
                      <span className="transition-colors duration-300" style={{ color: theme.text.secondary }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {client && client.match_credits > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => handleUnlock()}
                      disabled={isProcessing}
                      className="w-full font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                      style={{ backgroundColor: theme.accent, color: '#000' }}
                    >
                      Skip the BS. Get Designing → 1 Credit
                    </button>
                  </div>
                )}
                
              <div className="text-center mb-4">
                <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
                  {client?.match_credits > 0 ? 'Running low? Stock up 👇' : 'No credits? No problem 👇'}
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { price: '$5', name: 'Starter', matches: '3 designer matches', packageId: 'STARTER_PACK' },
                  { price: '$15', name: 'Growth', matches: '10 designer matches', packageId: 'GROWTH_PACK', popular: true },
                  { price: '$30', name: 'Scale', matches: '25 designer matches', packageId: 'SCALE_PACK' }
                ].map((plan, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleUnlock(plan.packageId)}
                    disabled={isProcessing}
                    className="p-6 rounded-2xl transition-all duration-300 text-center hover:scale-[1.02] relative disabled:opacity-50" 
                    style={{ 
                      border: plan.popular ? `2px solid ${theme.accent}` : `2px solid ${theme.border}`,
                      backgroundColor: plan.popular ? (isDarkMode ? '#2A2A2A' : '#FFF9F0') : theme.cardBg
                    }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold" 
                        style={{ backgroundColor: theme.accent, color: '#000' }}>
                        POPULAR
                      </div>
                    )}
                    <div className="text-2xl font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {plan.price}
                    </div>
                    <div className="font-medium mb-1 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {plan.name}
                    </div>
                    <div className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
                      {plan.matches}
                    </div>
                  </button>
                ))}
              </div>

                {isProcessing && (
                  <p className="text-center text-sm text-muted-foreground">
                    Preparing checkout...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-8 space-y-6">
              <div className="text-center space-y-2 pb-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
                <h3 className="font-semibold text-xl flex items-center justify-center gap-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  <span className="text-2xl">✅</span> Payment confirmed! Here's your designer:
                </h3>
              </div>

              <div className="rounded-2xl p-8 space-y-6 transition-colors duration-300" style={{ backgroundColor: theme.nestedBg }}>
                <h4 className="font-bold text-2xl mb-8 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {match.designer?.firstName} {match.designer?.lastName || match.designer?.lastInitial}
                </h4>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      Preferred Communication:
                    </h5>
                    <div className="space-y-3 ml-4">
                      <div className="flex items-center gap-3 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        <span>📧</span>
                        <span>Email for briefs</span>
                      </div>
                      <div className="flex items-center gap-3 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        <span>💬</span>
                        <span>Slack for quick questions</span>
                      </div>
                      <div className="flex items-center gap-3 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        <span>📹</span>
                        <span>Zoom for kickoffs</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      Next Steps:
                    </h5>
                    <ol className="space-y-3 ml-4 list-decimal list-inside">
                      <li className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        Send {match.designer?.firstName} an email introducing yourself
                      </li>
                      <li className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        Share your project brief
                      </li>
                      <li className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        Schedule a discovery call
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Contact Information Box */}
                {(match.designer?.email || match.designer?.phone || match.designer?.calendly_url || match.designer?.website) && (
                  <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${theme.border}` }}>
                    <h5 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      Contact Information:
                    </h5>
                    <div className="space-y-3 ml-4">
                      {match.designer?.email && (
                        <div className="flex items-center gap-3 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                          <span>📧</span>
                          <a href={`mailto:${match.designer.email}`} className="hover:underline">
                            {match.designer.email}
                          </a>
                        </div>
                      )}
                      {match.designer?.phone && (
                        <div className="flex items-center gap-3 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                          <span>📱</span>
                          <a href={`tel:${match.designer.phone}`} className="hover:underline">
                            {match.designer.phone}
                          </a>
                        </div>
                      )}
                      {match.designer?.calendly_url && (
                        <div className="flex items-center gap-3 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                          <span>🗓</span>
                          <a href={match.designer.calendly_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Book a call
                          </a>
                        </div>
                      )}
                      {match.designer?.website && (
                        <div className="flex items-center gap-3 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                          <span>🔗</span>
                          <a href={match.designer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            View portfolio
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>


        <div className="text-center mt-8">
          <button 
            onClick={async () => {
              setIsLoading(true)
              setError('')
              const briefId = sessionStorage.getItem('currentBriefId')
              if (briefId) {
                await fetchMatch(briefId, true) // Force new match
              }
            }}
            disabled={isLoading}
            className="inline-block font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: 'transparent',
              border: `2px solid ${theme.border}`,
              color: theme.text.primary
            }}
          >
            {isLoading ? 'Finding new match...' : 'Find New Match →'}
          </button>
        </div>
      </div>
      
      {/* Image Popup Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Portfolio preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  )
}