'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { EnhancedMatchCard } from './EnhancedMatchCard'
import { LoadingButton } from '@/components/shared'

interface MatchData {
  id: string
  score: number
  confidence: 'low' | 'medium' | 'high'
  matchSummary: string
  reasons: string[]
  personalizedReasons: string[]
  uniqueValue: string
  potentialChallenges?: string[]
  riskLevel: 'low' | 'medium' | 'high'
  scoreBreakdown?: {
    categoryMatch: number
    styleAlignment: number
    budgetFit: number
    timelineFit: number
    industryFit: number
    workingStyleFit: number
  }
  designer: any
  status?: string
}

interface EnhancedMatchResultsProps {
  matches: MatchData[]
  isDarkMode: boolean
  onUnlockDesigner?: (matchId: string) => Promise<void>
  onFindNewMatch?: () => Promise<void>
  briefData?: any
  isLoading?: boolean
}

export function EnhancedMatchResults({ 
  matches, 
  isDarkMode, 
  onUnlockDesigner,
  onFindNewMatch,
  briefData,
  isLoading = false
}: EnhancedMatchResultsProps) {
  const theme = getTheme(isDarkMode)
  const [unlockedMatches, setUnlockedMatches] = useState<Set<string>>(new Set())
  const [isFindingNew, setIsFindingNew] = useState(false)

  const handleUnlock = async (matchId: string) => {
    if (!onUnlockDesigner) return

    try {
      await onUnlockDesigner(matchId)
      setUnlockedMatches(prev => new Set([...prev, matchId]))
    } catch (error) {
      console.error('Failed to unlock designer:', error)
      throw error
    }
  }

  const handleFindNewMatch = async () => {
    if (!onFindNewMatch) return

    setIsFindingNew(true)
    try {
      await onFindNewMatch()
    } catch (error) {
      console.error('Failed to find new match:', error)
    } finally {
      setIsFindingNew(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse"
            style={{ backgroundColor: theme.accent + '20' }}
          >
            <div 
              className="w-8 h-8 rounded-full animate-spin border-2 border-transparent"
              style={{ borderTopColor: theme.accent }}
            />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
            Finding Your Perfect Designer
          </h3>
          <p style={{ color: theme.text.secondary }}>
            Our AI is analyzing {briefData?.designCategory || 'hundreds of'} specialists...
          </p>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div 
        className="text-center py-12 px-8 rounded-3xl"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
      >
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: theme.accent + '20' }}
        >
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
          No Matches Found
        </h3>
        <p className="mb-6" style={{ color: theme.text.secondary }}>
          We couldn't find any available designers matching your criteria right now.
        </p>
        <LoadingButton
          onClick={handleFindNewMatch}
          loading={isFindingNew}
          className="px-6 py-3 rounded-2xl font-medium"
          style={{
            backgroundColor: theme.accent,
            color: '#000'
          }}
        >
          Try Different Criteria
        </LoadingButton>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div 
        className="p-6 rounded-3xl text-center"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
      >
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
          We Found Your Perfect {matches.length > 1 ? 'Matches' : 'Match'}! 🎯
        </h2>
        <p style={{ color: theme.text.secondary }}>
          Our AI analyzed {briefData?.designCategory ? `${briefData.designCategory} specialists` : 'hundreds of designers'} and found 
          {matches.length === 1 ? ' the ideal designer' : ` ${matches.length} exceptional matches`} for your project.
        </p>
      </div>

      {/* Match Cards */}
      <div className="space-y-6">
        {matches.map((match, index) => (
          <div key={match.id} className="relative">
            {/* Best Match Badge */}
            {index === 0 && matches.length > 1 && (
              <div 
                className="absolute -top-3 left-8 px-4 py-1 rounded-full text-sm font-bold z-10"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                🏆 Best Match
              </div>
            )}
            
            <EnhancedMatchCard
              match={match}
              isDarkMode={isDarkMode}
              onUnlock={handleUnlock}
              isUnlocked={unlockedMatches.has(match.id)}
            />
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div 
        className="p-6 rounded-3xl text-center space-y-4"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
      >
        <p style={{ color: theme.text.secondary }}>
          Not quite what you're looking for?
        </p>
        <LoadingButton
          onClick={handleFindNewMatch}
          loading={isFindingNew}
          className="px-8 py-3 rounded-2xl font-medium"
          style={{
            backgroundColor: 'transparent',
            border: `2px solid ${theme.border}`,
            color: theme.text.secondary
          }}
        >
          Find Different Designers
        </LoadingButton>
      </div>

      {/* Tips Section */}
      <div 
        className="p-6 rounded-3xl"
        style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}
      >
        <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
          <span>💡</span>
          Next Steps
        </h4>
        <ul className="space-y-2 text-sm" style={{ color: theme.text.secondary }}>
          <li>• Review each designer's portfolio and experience carefully</li>
          <li>• Unlock contact details to start the conversation</li>
          <li>• Share your project brief and ask for a detailed proposal</li>
          <li>• Set clear expectations for timeline, deliverables, and communication</li>
          <li>• Most designers include 2-3 revision rounds in their proposals</li>
        </ul>
      </div>
    </div>
  )
}