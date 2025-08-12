'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { LoadingSpinner } from '@/components/shared'
import { toast } from '@/lib/toast'
import { getTheme } from '@/lib/design-system'
import { logger } from '@/lib/core/logging-service'

interface EnhancedDesigner {
  id: string
  firstName: string
  lastName: string
  lastInitial: string
  title: string
  city: string
  country: string
  email?: string
  phone?: string
  website?: string
  bio: string
  yearsExperience: number
  rating: number
  totalProjects: number
  styles: string[]
  industries: string[]
  // Image fields
  avatar_url?: string
  // Enhanced fields
  designPhilosophy: string
  primaryCategories: string[]
  styleKeywords: string[]
  avgClientSatisfaction: number
  onTimeDeliveryRate: number
  collaborationStyle?: string
  turnaroundTimes?: Record<string, number>
}

interface EnhancedMatch {
  id: string
  score: number
  status: string
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
  created_at: string
  designer: EnhancedDesigner
  brief: {
    designCategory: string
    company_name?: string
    budget: string
    timeline: string
    description: string
    styleKeywords?: string[]
    targetAudience?: string
  }
}

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [match, setMatch] = useState<EnhancedMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [credits, setCredits] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    fetchMatch()
  }, [params.id])

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/client/matches/${params.id}`)
      
      if (response.status === 401) {
        router.push(`/auth/signin?redirect=/client/match/${params.id}`)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch match')
      }

      const data = await response.json()
      console.log('Match data received:', data.match)
      console.log('Designer data:', data.match?.designer)
      setMatch(data.match)
      setCredits(data.credits || 0)
    } catch (error) {
      logger.error('Error fetching match:', error)
      toast.error('Failed to load match details')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!match || credits < 1) return

    setUnlocking(true)
    try {
      const response = await fetch(`/api/client/matches/${match.id}/unlock`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to unlock')
      }

      const data = await response.json()
      setMatch(data.match)
      setCredits(data.credits)
      toast.success('Designer contact unlocked!')
    } catch (error) {
      logger.error('Unlock error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to unlock designer')
    } finally {
      setUnlocking(false)
    }
  }

  const handleContactDesigner = () => {
    if (match?.designer.email) {
      window.location.href = `mailto:${match.designer.email}`
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <Navigation 
          theme={theme} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme}
        />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </main>
    )
  }

  if (!match) {
    return (
      <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <Navigation 
          theme={theme} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme}
        />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-3xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Match Not Found
            </h2>
            <p className="text-lg mb-8 transition-colors duration-300" style={{ color: theme.text.secondary }}>
              This match doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={() => router.push('/client/dashboard')}
              className="font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  const isUnlocked = match.status === 'unlocked' || match.status === 'completed'

  // Avatar component with fallback
  const DesignerAvatar = ({ designer, size = 80, className = "" }: { designer: EnhancedDesigner, size?: number, className?: string }) => {
    const [imageError, setImageError] = useState(false)
    
    const getInitials = () => {
      const firstName = designer.firstName || (designer as any).first_name || ''
      const lastName = designer.lastName || (designer as any).last_name || designer.lastInitial || ''
      return `${firstName[0] || ''}${lastName[0] || ''}`
    }
    
    // Force showing image first, only show initials if error
    if (imageError || !designer.avatar_url) {
      console.log('Showing initials because:', { imageError, avatar_url: designer.avatar_url })
      return (
        <div 
          className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
          style={{ 
            width: size, 
            height: size,
            backgroundColor: theme.accent,
            fontSize: size / 3
          }}
        >
          {getInitials()}
        </div>
      )
    }
    
    console.log('Attempting to load avatar:', designer.avatar_url)
    
    return (
      <img
        src={designer.avatar_url}
        alt={`${designer.firstName || (designer as any).first_name} ${designer.lastName || (designer as any).last_name}`}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
      />
    )
  }

  // Portfolio Image component with error handling
  const PortfolioImage = ({ src, alt, index }: { src: string, alt: string, index: number }) => {
    const [imageError, setImageError] = useState(false)
    
    console.log('Portfolio image:', { src, alt, imageError })
    
    if (imageError) {
      console.log('Portfolio image failed to load:', src)
      return (
        <div 
          className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: theme.border }}
        >
          <span style={{ color: theme.text.muted }}>Image {index + 1}</span>
        </div>
      )
    }
    
    return (
      <img
        src={src}
        alt={alt}
        className="aspect-square object-cover rounded-xl"
        onError={() => {
          console.log('Portfolio image error:', src)
          setImageError(true)
        }}
      />
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation 
        theme={theme} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        showBackButton={true}
        onBack={() => router.push('/client/dashboard')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Match Score Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="text-4xl sm:text-5xl lg:text-6xl">🎯</div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold transition-colors duration-300" style={{ color: theme.accent }}>
                {match.score}%
              </h1>
              <p className="text-sm sm:text-base lg:text-lg font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Match Score
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="px-4 py-2 rounded-full text-sm font-medium" 
              style={{ 
                backgroundColor: theme.success + '20',
                color: theme.success
              }}>
              {match.confidence} Confidence
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium" 
              style={{ 
                backgroundColor: match.riskLevel === 'Low' ? theme.success + '20' : theme.accent + '20',
                color: match.riskLevel === 'Low' ? theme.success : theme.accent
              }}>
              {match.riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Designer Info */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-all duration-300" 
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-4 flex-1">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {isUnlocked ? (
                  <DesignerAvatar designer={match.designer} size={80} />
                ) : (
                  <div className="relative">
                    <DesignerAvatar designer={match.designer} size={80} className="blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                        🔒
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Designer Info */}
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {isUnlocked ? `${match.designer.firstName || (match.designer as any).first_name} ${match.designer.lastName || (match.designer as any).last_name}` : `Designer ${match.designer.firstName || (match.designer as any).first_name}***`}
                </h2>
                <p className="text-xl mb-4 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  {match.designer.title} • {match.designer.city}, {match.designer.country}
                </p>
                <div className="flex items-center gap-6 text-sm flex-wrap">
                  <span style={{ color: theme.text.muted }}>
                    {match.designer.yearsExperience || (match.designer as any).years_experience} years experience
                  </span>
                  <span style={{ color: theme.text.muted }}>
                    ⭐ {match.designer.rating}/5 rating
                  </span>
                  <span style={{ color: theme.text.muted }}>
                    {match.designer.totalProjects || (match.designer as any).total_projects} projects completed
                  </span>
                  {match.designer.avgClientSatisfaction && (
                    <span style={{ color: theme.text.muted }}>
                      {match.designer.avgClientSatisfaction}% client satisfaction
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isUnlocked && (
              <div className="text-center">
                <p className="text-sm mb-3" style={{ color: theme.text.secondary }}>
                  You have <strong>{credits}</strong> matches available
                </p>
                <LoadingButton
                  onClick={handleUnlock}
                  isLoading={unlocking}
                  disabled={credits < 1}
                  className="font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  Unlock Contact (1 match)
                </LoadingButton>
              </div>
            )}
          </div>

          {/* Why They're a Great Match */}
          <div className="rounded-2xl p-6 mb-6" 
            style={{ 
              backgroundColor: theme.nestedBg,
              border: `1px solid ${theme.border}`
            }}>
            <h3 className="font-bold text-lg mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Why they're perfect for your project:
            </h3>
            <p className="mb-4 transition-colors duration-300" style={{ color: theme.text.secondary }}>
              {match.matchSummary}
            </p>
            <ul className="space-y-2">
              {match.personalizedReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                    {reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Design Philosophy */}
          {match.designer.designPhilosophy && (
            <div className="rounded-2xl p-6 mb-6" 
              style={{ 
                backgroundColor: theme.nestedBg,
                border: `1px solid ${theme.border}`
              }}>
              <h3 className="font-bold text-lg mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Design Philosophy:
              </h3>
              <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                {match.designer.designPhilosophy}
              </p>
            </div>
          )}

          {/* Portfolio Images - Generated dynamically */}
          <div className="rounded-2xl p-6 mb-6" 
            style={{ 
              backgroundColor: theme.nestedBg,
              border: `1px solid ${theme.border}`
            }}>
            <h3 className="font-bold text-lg mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Portfolio:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((index) => {
                // Generate portfolio image based on designer's category
                const category = match.designer.title?.includes('Graphic') ? 'abstract' :
                                match.designer.title?.includes('Web') ? 'tech' :
                                match.designer.title?.includes('UI/UX') ? 'app' :
                                match.designer.title?.includes('Product') ? 'product' :
                                match.designer.title?.includes('Motion') ? 'motion' : 'design'
                
                const portfolioImageUrl = `https://picsum.photos/seed/${category}${index}-${match.designer.id}/800/600`
                
                return (
                  <div key={index} className="relative group">
                    {isUnlocked ? (
                      <PortfolioImage 
                        src={portfolioImageUrl} 
                        alt={`Portfolio ${index}`} 
                        index={index - 1}
                      />
                    ) : (
                      <div className="relative">
                        <PortfolioImage 
                          src={portfolioImageUrl} 
                          alt={`Portfolio ${index}`} 
                          index={index - 1}
                        />
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <div className="bg-black/50 text-white text-xs px-3 py-2 rounded-lg">
                            🔒 Unlock to view
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Categories & Style */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {match.designer.primaryCategories && match.designer.primaryCategories.length > 0 && (
              <div className="rounded-2xl p-6" 
                style={{ 
                  backgroundColor: theme.nestedBg,
                  border: `1px solid ${theme.border}`
                }}>
                <h3 className="font-bold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Specializes In:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.designer.primaryCategories.map((cat) => (
                    <span key={cat} className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: theme.accent + '20',
                        color: theme.accent
                      }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {match.designer.styleKeywords && match.designer.styleKeywords.length > 0 && (
              <div className="rounded-2xl p-6" 
                style={{ 
                  backgroundColor: theme.nestedBg,
                  border: `1px solid ${theme.border}`
                }}>
                <h3 className="font-bold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Design Style:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.designer.styleKeywords.map((style) => (
                    <span key={style} className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: theme.tagBg,
                        color: theme.text.secondary
                      }}>
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {isUnlocked && (
            <div className="rounded-2xl p-6" 
              style={{ 
                backgroundColor: theme.success + '10',
                border: `1px solid ${theme.success + '40'}`
              }}>
              <h3 className="font-bold text-lg mb-4 transition-colors duration-300" style={{ color: theme.success }}>
                Contact Information
              </h3>
              <div className="space-y-3">
                {match.designer.email && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Email:</span>
                    <a href={`mailto:${match.designer.email}`} 
                      className="transition-colors duration-300 hover:opacity-80"
                      style={{ color: theme.accent }}>
                      {match.designer.email}
                    </a>
                  </div>
                )}
                {match.designer.phone && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Phone:</span>
                    <span style={{ color: theme.text.secondary }}>{match.designer.phone}</span>
                  </div>
                )}
                {match.designer.website && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Portfolio:</span>
                    <a href={match.designer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 hover:opacity-80"
                      style={{ color: theme.accent }}>
                      {match.designer.website}
                    </a>
                  </div>
                )}
              </div>
              <button
                onClick={handleContactDesigner}
                className="mt-6 font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: theme.success, color: '#FFF' }}
              >
                Contact Designer →
              </button>
            </div>
          )}
        </div>

        {/* Match Analysis */}
        <div className="rounded-3xl p-8 transition-all duration-300" 
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}>
          <h3 className="font-bold text-xl mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Match Analysis
          </h3>
          
          {/* Score Breakdown */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {Object.entries(match.scoreBreakdown).map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              return (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: theme.nestedBg }}>
                  <span style={{ color: theme.text.secondary }}>{label}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: theme.border }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${value}%`,
                          backgroundColor: value >= 80 ? theme.success : value >= 60 ? theme.accent : theme.error
                        }} />
                    </div>
                    <span className="font-medium" style={{ color: theme.text.primary }}>{value}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Potential Challenges */}
          {match.potentialChallenges && match.potentialChallenges.length > 0 && (
            <div className="rounded-2xl p-6" 
              style={{ 
                backgroundColor: theme.accent + '10',
                border: `1px solid ${theme.accent + '40'}`
              }}>
              <h4 className="font-bold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Things to Consider:
              </h4>
              <ul className="space-y-2">
                {match.potentialChallenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span style={{ color: theme.accent }}>⚠️</span>
                    <span className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {challenge}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}