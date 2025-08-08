'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
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
    designPhilosophy?: string
    primaryCategories?: string[]
    styleKeywords?: string[]
    portfolioProjects?: any[]
    avgClientSatisfaction?: number
    onTimeDeliveryRate?: number
  }
  status?: string
}

interface EnhancedMatchCardProps {
  match: MatchData
  isDarkMode: boolean
  onUnlock?: (matchId: string) => Promise<void>
  isUnlocked?: boolean
}

export function EnhancedMatchCard({ match, isDarkMode, onUnlock, isUnlocked = false }: EnhancedMatchCardProps) {
  const theme = getTheme(isDarkMode)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showFullProfile, setShowFullProfile] = useState(false)

  const handleUnlock = async () => {
    if (!onUnlock) return

    setIsUnlocking(true)
    try {
      await onUnlock(match.id)
    } catch (error) {
      console.error('Failed to unlock designer:', error)
    } finally {
      setIsUnlocking(false)
    }
  }

  const getConfidenceColor = () => {
    switch (match.confidence) {
      case 'high': return theme.success
      case 'medium': return theme.accent
      case 'low': return '#fbbf24'
      default: return theme.accent
    }
  }

  const getRiskColor = () => {
    switch (match.riskLevel) {
      case 'low': return theme.success
      case 'medium': return theme.accent
      case 'high': return theme.error
      default: return theme.accent
    }
  }

  return (
    <div 
      className="p-8 rounded-3xl animate-slideUp hover:scale-[1.01] transition-all duration-300"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow
      }}
    >
      {/* Designer Header */}
      <div className="flex items-start gap-6 mb-6">
        <div className="flex-shrink-0">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            {match.designer.firstName[0]}{match.designer.lastInitial}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold" style={{ color: theme.text.primary }}>
              {match.designer.firstName} {match.designer.lastInitial}.
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: theme.text.secondary }}>
                {match.designer.yearsExperience}+ years
              </span>
              <span style={{ color: theme.text.muted }}>•</span>
              <span className="text-sm" style={{ color: theme.text.secondary }}>
                {match.designer.city}
              </span>
            </div>
          </div>
          
          <p className="text-base mb-3" style={{ color: theme.text.secondary }}>
            {match.designer.title}
          </p>
          
          {match.designer.designPhilosophy && (
            <p className="text-sm italic mb-3" style={{ color: theme.text.secondary }}>
              "{match.designer.designPhilosophy}"
            </p>
          )}
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {match.designer.primaryCategories?.slice(0, 3).map(category => (
              <span 
                key={category}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: theme.accent + '20',
                  color: theme.accent
                }}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Match Score Circle */}
        <div className="text-center">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-2 relative"
            style={{
              backgroundColor: theme.accent + '20',
              color: theme.accent,
              border: `3px solid ${theme.accent}`
            }}
          >
            {match.score}%
            <div 
              className="absolute inset-0 rounded-full border-3"
              style={{
                background: `conic-gradient(${theme.accent} ${match.score * 3.6}deg, transparent ${match.score * 3.6}deg)`
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>
              Match Score
            </p>
            <div className="flex items-center justify-center gap-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getConfidenceColor() }}
              />
              <span className="text-xs capitalize" style={{ color: getConfidenceColor() }}>
                {match.confidence}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Preview */}
      {match.designer.portfolioProjects && match.designer.portfolioProjects.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
            <span>🎨</span>
            Recent Work
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {match.designer.portfolioProjects.slice(0, 3).map((project, index) => (
              <div 
                key={index} 
                className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => setShowFullProfile(true)}
              >
                <img 
                  src={project.image_url || project.url} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Explanation */}
      <div 
        className="p-6 rounded-2xl mb-6"
        style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}
      >
        <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
          <span style={{ color: theme.accent }}>✨</span>
          {match.matchSummary}
        </h4>
        <ul className="space-y-2">
          {match.personalizedReasons?.slice(0, 3).map((reason, index) => (
            <li key={index} className="flex items-start gap-3">
              <span style={{ color: theme.accent }} className="text-sm mt-1 flex-shrink-0">•</span>
              <span className="text-sm" style={{ color: theme.text.secondary }}>
                {reason}
              </span>
            </li>
          ))}
        </ul>
        
        {match.uniqueValue && (
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
            <h5 className="font-medium mb-2" style={{ color: theme.text.primary }}>
              Unique Value:
            </h5>
            <p className="text-sm" style={{ color: theme.accent }}>
              {match.uniqueValue}
            </p>
          </div>
        )}
      </div>

      {/* Compatibility Scores */}
      {match.scoreBreakdown && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <CompatibilityBar 
            label="Style Match" 
            score={Math.round((match.scoreBreakdown.styleAlignment / 25) * 100)} 
            theme={theme} 
          />
          <CompatibilityBar 
            label="Experience" 
            score={Math.round((match.scoreBreakdown.industryFit / 10) * 100)} 
            theme={theme} 
          />
          <CompatibilityBar 
            label="Budget Fit" 
            score={Math.round((match.scoreBreakdown.budgetFit / 15) * 100)} 
            theme={theme} 
          />
          <CompatibilityBar 
            label="Timeline" 
            score={Math.round((match.scoreBreakdown.timelineFit / 15) * 100)} 
            theme={theme} 
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="flex justify-around py-4 mb-6" style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: theme.text.primary }}>
            {match.designer.totalProjects || 0}
          </div>
          <div className="text-xs" style={{ color: theme.text.secondary }}>
            Projects
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: theme.text.primary }}>
            {match.designer.rating || 4.5}★
          </div>
          <div className="text-xs" style={{ color: theme.text.secondary }}>
            Rating
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: theme.text.primary }}>
            {match.designer.avgClientSatisfaction || 95}%
          </div>
          <div className="text-xs" style={{ color: theme.text.secondary }}>
            Satisfaction
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: theme.text.primary }}>
            {match.designer.onTimeDeliveryRate || 98}%
          </div>
          <div className="text-xs" style={{ color: theme.text.secondary }}>
            On Time
          </div>
        </div>
      </div>

      {/* Potential Challenges */}
      {match.potentialChallenges && match.potentialChallenges.length > 0 && (
        <div 
          className="p-4 rounded-2xl mb-6"
          style={{ backgroundColor: getRiskColor() + '10', border: `1px solid ${getRiskColor()}40` }}
        >
          <h5 className="font-medium mb-2 flex items-center gap-2" style={{ color: theme.text.primary }}>
            <span>⚠️</span>
            Consider
          </h5>
          <ul className="space-y-1">
            {match.potentialChallenges.map((challenge, index) => (
              <li key={index} className="text-sm" style={{ color: theme.text.secondary }}>
                • {challenge}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isUnlocked ? (
          <LoadingButton
            onClick={handleUnlock}
            loading={isUnlocking}
            className="flex-1 py-4 rounded-2xl font-bold text-lg"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Unlock Contact Details
          </LoadingButton>
        ) : (
          <div className="flex-1 space-y-3">
            <div 
              className="p-4 rounded-2xl"
              style={{ backgroundColor: theme.success + '20', border: `1px solid ${theme.success}` }}
            >
              <h5 className="font-medium mb-2" style={{ color: theme.text.primary }}>
                Contact Details:
              </h5>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Email: {match.designer.firstName.toLowerCase()}.{match.designer.lastName?.toLowerCase()}@example.com
              </p>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Portfolio: Available in profile
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowFullProfile(true)}
          className="px-6 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02]"
          style={{
            backgroundColor: 'transparent',
            border: `2px solid ${theme.border}`,
            color: theme.text.secondary
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  )
}

function CompatibilityBar({ label, score, theme }: { label: string, score: number, theme: any }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: theme.accent }}>
          {score}%
        </span>
      </div>
      <div 
        className="h-2 rounded-full"
        style={{ backgroundColor: theme.border }}
      >
        <div
          className="h-2 rounded-full transition-all duration-700 animate-slideUp"
          style={{
            backgroundColor: theme.accent,
            width: `${score}%`,
            animationDelay: '200ms'
          }}
        />
      </div>
    </div>
  )
}