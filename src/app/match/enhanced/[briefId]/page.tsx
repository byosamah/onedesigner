'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getTheme } from '@/lib/design-system'
import { EnhancedMatchCard } from '@/components/match/EnhancedMatchCard'
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
  scoreBreakdown: {
    categoryMatch: number
    styleAlignment: number
    budgetCompatibility: number
    timelineCompatibility: number
    experienceLevel: number
    industryFamiliarity: number
  }
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
    portfolioProjects: any[]
    avgClientSatisfaction: number
    onTimeDeliveryRate: number
  }
  aiAnalyzed: boolean
}

interface BriefData {
  designCategory: string
  timeline: string
  budget: string
  description: string
}

export default function EnhancedMatchPage() {
  const params = useParams()
  const briefId = params.briefId as string
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [matches, setMatches] = useState<EnhancedMatch[]>([])
  const [briefData, setBriefData] = useState<BriefData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    fetchEnhancedMatches()
  }, [briefId])

  const fetchEnhancedMatches = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/match/enhanced', {
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

      console.log('✅ Enhanced matches loaded:', data.matches?.length)

    } catch (error) {
      console.error('Error fetching enhanced matches:', error)
      setError(error instanceof Error ? error.message : 'Failed to load matches')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlock = async (matchId: string) => {
    try {
      // This would integrate with the existing unlock system
      console.log('Unlocking match:', matchId)
      // TODO: Implement unlock logic with credits/payments
      alert('Unlock functionality would connect to existing payment system')
    } catch (error) {
      console.error('Error unlocking match:', error)
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
            Finding your perfect designer match...
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
            Unable to Load Matches
          </h2>
          <p 
            className="mb-6"
            style={{ color: theme.text.secondary }}
          >
            {error}
          </p>
          <button
            onClick={() => fetchEnhancedMatches()}
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.svg" 
              alt="OneDesigner" 
              className="w-8 h-8"
            />
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Your Enhanced Matches
              </h1>
              {briefData && (
                <p 
                  className="text-sm"
                  style={{ color: theme.text.muted }}
                >
                  {briefData.designCategory} • {briefData.timeline} • {briefData.budget}
                </p>
              )}
            </div>
          </div>
          
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

        {/* Enhanced Match Results */}
        {matches.length === 0 ? (
          <div className="text-center py-12">
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
              We couldn't find any designers matching your enhanced criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {matches.map((match, index) => (
              <EnhancedMatchCard
                key={match.id}
                match={match}
                isDarkMode={isDarkMode}
                onUnlock={() => handleUnlock(match.id)}
                isTopMatch={index === 0}
              />
            ))}
            
            {/* Enhanced matching powered by AI notice */}
            <div 
              className="text-center py-6 rounded-3xl"
              style={{
                backgroundColor: theme.nestedBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <p 
                className="text-sm font-medium"
                style={{ color: theme.text.muted }}
              >
                ✨ Enhanced matching powered by AI analysis of 15+ compatibility factors
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}