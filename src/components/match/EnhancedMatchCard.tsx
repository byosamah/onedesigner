'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { LoadingButton } from '@/components/shared'
import { PRICING_PACKAGES } from '@/lib/constants'
import { WorkingRequestModal } from '@/components/modals/WorkingRequestModal'
import { logger } from '@/lib/core/logging-service'

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
    totalProjects: number
    availability?: string
    portfolioImages?: string[]
    profilePicture?: string
    styles?: string[]
    industries?: string[]
    email?: string
    phone?: string
    portfolioUrl?: string
    linkedinUrl?: string
    dribbbleUrl?: string
    behanceUrl?: string
  }
  status?: string
}

interface EnhancedMatchCardProps {
  match: MatchData
  isDarkMode: boolean
  onUnlock?: (matchId: string) => Promise<void>
  onFindNewMatch?: () => Promise<void>
  isUnlocked?: boolean
  isTopMatch?: boolean
  matchCredits?: number
}

export function EnhancedMatchCard({ match, isDarkMode, onUnlock, onFindNewMatch, isUnlocked = false, isTopMatch = false, matchCredits = 0 }: EnhancedMatchCardProps) {
  const theme = getTheme(isDarkMode)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isFindingNewMatch, setIsFindingNewMatch] = useState(false)
  const [showFullProfile, setShowFullProfile] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null)
  const [showWorkingRequestModal, setShowWorkingRequestModal] = useState(false)

  // Helper function to validate URLs
  const isValidUrl = (url: string | undefined): boolean => {
    return !!(url && 
             url.trim() !== '' && 
             !url.includes('null') && 
             !url.includes('undefined') &&
             (url.startsWith('http://') || url.startsWith('https://')))
  }

  const handleUnlock = async () => {
    if (!onUnlock) return

    setIsUnlocking(true)
    try {
      await onUnlock(match.id)
    } catch (error) {
      logger.error('Failed to unlock designer:', error)
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleFindNewMatch = async () => {
    if (!onFindNewMatch) return

    setIsFindingNewMatch(true)
    try {
      await onFindNewMatch()
    } catch (error) {
      logger.error('Failed to find new match:', error)
    } finally {
      setIsFindingNewMatch(false)
    }
  }

  const handlePurchase = async (packageId: string) => {
    setPurchasingPackage(packageId)
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productKey: packageId,
          matchId: match.id 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'No checkout URL received')
      }
      
      // Redirect to checkout
      window.location.href = data.checkoutUrl
    } catch (error) {
      logger.error('Purchase error:', error)
      setPurchasingPackage(null)
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
      className="relative rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] animate-slideUp"
      style={{
        backgroundColor: theme.cardBg,
        border: 'none',
        boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Designer Header */}
      <div className="flex items-start gap-6 mb-6">
        <div className="flex-shrink-0">
          {match.designer.profilePicture ? (
            <img 
              src={match.designer.profilePicture}
              alt={`${match.designer.firstName} ${match.designer.lastInitial}.`}
              className={`w-20 h-20 rounded-full object-cover border-2 transition-all duration-300 ${
                !isUnlocked ? 'blur-sm' : ''
              }`}
              style={{ borderColor: theme.accent }}
            />
          ) : (
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                !isUnlocked ? 'blur-sm' : ''
              }`}
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              {match.designer.firstName[0]}{match.designer.lastInitial}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              {match.designer.firstName} {isUnlocked ? match.designer.lastName : `${match.designer.lastInitial}.`}
            </h3>
            <span className="text-base" style={{ color: theme.text.secondary }}>
              {match.designer.country}
            </span>
          </div>
          
          <p className="text-lg mb-3" style={{ color: theme.text.secondary }}>
            {match.designer.title}
          </p>
        </div>

        {/* Match Score */}
        <div className="text-center flex-shrink-0">
          <div className="text-5xl font-bold mb-1" style={{ color: theme.accent }}>
            {match.score}%
          </div>
          <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>
            Match Score
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getConfidenceColor() }}
            />
            <p className="text-xs capitalize" style={{ color: getConfidenceColor() }}>
              {match.confidence}
            </p>
          </div>
        </div>
      </div>


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

      {/* Designer Profile Highlights - Primary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ProfileHighlight 
          icon="📍"
          label="Location" 
          value={`${match.designer.city}, ${match.designer.country}`} 
          theme={theme} 
        />
        {match.designer.availability && (
          <ProfileHighlight 
            icon="✅"
            label="Availability" 
            value={match.designer.availability === 'immediate' ? 'Available Now' : 
                   match.designer.availability === 'within_week' ? 'Within a Week' :
                   match.designer.availability === 'within_month' ? 'Within a Month' :
                   match.designer.availability} 
            theme={theme} 
          />
        )}
        {match.designer.styles && match.designer.styles.length > 0 && (
          <ProfileHighlight 
            icon="🎨"
            label="Styles" 
            value={match.designer.styles.slice(0, 2).join(', ')} 
            theme={theme} 
          />
        )}
        {match.designer.industries && match.designer.industries.length > 0 && (
          <ProfileHighlight 
            icon="🏢"
            label="Industries" 
            value={match.designer.industries.slice(0, 2).join(', ')} 
            theme={theme} 
          />
        )}
      </div>

      {/* Portfolio Gallery - Always visible between highlights */}
      <div className="mb-4">
        <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
          <span>🎨</span>
          Portfolio Samples
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {match.designer.portfolioImages && match.designer.portfolioImages.length > 0 ? (
            <>
              {match.designer.portfolioImages.slice(0, 3).map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg"
                  onClick={() => {
                    setSelectedImageIndex(index)
                    setShowImageModal(true)
                  }}
                  style={{ backgroundColor: theme.nestedBg }}
                >
                  <img 
                    src={imageUrl} 
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
              {/* Show placeholder for remaining slots if less than 3 images */}
              {Array.from({ length: 3 - match.designer.portfolioImages.length }, (_, index) => (
                <div 
                  key={`placeholder-filled-${index}`}
                  className="aspect-square rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: theme.nestedBg, border: `2px dashed ${theme.border}` }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1" style={{ color: theme.text.muted }}>📸</div>
                    <p className="text-xs" style={{ color: theme.text.muted }}>Coming Soon</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            /* Show 3 placeholder images when no portfolio images exist */
            [0, 1, 2].map((index) => (
              <div 
                key={`placeholder-empty-${index}`}
                className="aspect-square rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: theme.nestedBg, border: `2px dashed ${theme.border}` }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1" style={{ color: theme.text.muted }}>📸</div>
                  <p className="text-xs" style={{ color: theme.text.muted }}>Portfolio Coming</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>



      {/* Contact Details / Potential Challenges */}
      {isUnlocked ? (
        <div 
          className="p-6 rounded-2xl mb-6"
          style={{ backgroundColor: theme.success + '10', border: `1px solid ${theme.success}40` }}
        >
          <h5 className="font-medium mb-4 flex items-center gap-2" style={{ color: theme.text.primary }}>
            <span>📧</span>
            Contact & Links
          </h5>
          <div className="space-y-3">
            {/* Always show email */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>Email:</span>
              <span className="text-sm" style={{ color: theme.text.primary }}>
                {match.designer.email || `${match.designer.firstName.toLowerCase()}.${match.designer.lastName?.toLowerCase()}@example.com`}
              </span>
            </div>
            
            {/* Only show phone if it exists */}
            {match.designer.phone && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>Phone:</span>
                <span className="text-sm" style={{ color: theme.text.primary }}>{match.designer.phone}</span>
              </div>
            )}
            
            {/* Only show portfolio URL if it's valid */}
            {isValidUrl(match.designer.portfolioUrl) && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>Portfolio:</span>
                <a href={match.designer.portfolioUrl} target="_blank" rel="noopener noreferrer" 
                   className="text-sm hover:underline" style={{ color: theme.accent }}>
                  View Portfolio →
                </a>
              </div>
            )}
            
            {/* Only show LinkedIn URL if it's valid */}
            {isValidUrl(match.designer.linkedinUrl) && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>LinkedIn:</span>
                <a href={match.designer.linkedinUrl} target="_blank" rel="noopener noreferrer"
                   className="text-sm hover:underline" style={{ color: theme.accent }}>
                  View Profile →
                </a>
              </div>
            )}
            
            {/* Only show Dribbble URL if it's valid */}
            {isValidUrl(match.designer.dribbbleUrl) && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>Dribbble:</span>
                <a href={match.designer.dribbbleUrl} target="_blank" rel="noopener noreferrer"
                   className="text-sm hover:underline" style={{ color: theme.accent }}>
                  View Work →
                </a>
              </div>
            )}
            
            {/* Only show Behance URL if it's valid */}
            {isValidUrl(match.designer.behanceUrl) && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>Behance:</span>
                <a href={match.designer.behanceUrl} target="_blank" rel="noopener noreferrer"
                   className="text-sm hover:underline" style={{ color: theme.accent }}>
                  View Work →
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        match.potentialChallenges && match.potentialChallenges.length > 0 && (
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
        )
      )}

      {/* Purchase Options - Show when no credits */}
      {!isUnlocked && matchCredits === 0 && (
        <div className="mb-4">
          <p className="text-sm text-center mb-3" style={{ color: theme.text.secondary }}>
            Choose a package to unlock this designer:
          </p>
          <div className="grid grid-cols-3 gap-3">
            {/* Starter Package */}
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/checkout/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      productKey: 'STARTER_PACK',
                      matchId: match.id 
                    }),
                  })
                  const data = await response.json()
                  if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl
                  } else {
                    alert('Failed to create checkout. Please try again.')
                  }
                } catch (error) {
                  logger.error('Checkout error:', error)
                  alert('Failed to create checkout. Please try again.')
                }
              }}
              className="p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] text-center"
              style={{
                backgroundColor: theme.nestedBg,
                borderColor: theme.border
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: theme.text.secondary }}>
                Starter
              </div>
              <div className="text-lg font-bold mb-1" style={{ color: theme.text.primary }}>
                $5
              </div>
              <div className="text-xs" style={{ color: theme.text.muted }}>
                3 matches
              </div>
            </button>

            {/* Growth Package - Recommended */}
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/checkout/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      productKey: 'GROWTH_PACK',
                      matchId: match.id 
                    }),
                  })
                  const data = await response.json()
                  if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl
                  } else {
                    alert('Failed to create checkout. Please try again.')
                  }
                } catch (error) {
                  logger.error('Checkout error:', error)
                  alert('Failed to create checkout. Please try again.')
                }
              }}
              className="p-3 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] text-center relative"
              style={{
                backgroundColor: theme.accent + '10',
                borderColor: theme.accent
              }}
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                  backgroundColor: theme.accent, 
                  color: '#000',
                  fontSize: '10px'
                }}>
                  POPULAR
                </span>
              </div>
              <div className="text-xs font-medium mb-1 mt-1" style={{ color: theme.text.secondary }}>
                Growth
              </div>
              <div className="text-lg font-bold mb-1" style={{ color: theme.text.primary }}>
                $15
              </div>
              <div className="text-xs" style={{ color: theme.text.muted }}>
                10 matches
              </div>
            </button>

            {/* Scale Package */}
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/checkout/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      productKey: 'SCALE_PACK',
                      matchId: match.id 
                    }),
                  })
                  const data = await response.json()
                  if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl
                  } else {
                    alert('Failed to create checkout. Please try again.')
                  }
                } catch (error) {
                  logger.error('Checkout error:', error)
                  alert('Failed to create checkout. Please try again.')
                }
              }}
              className="p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] text-center"
              style={{
                backgroundColor: theme.nestedBg,
                borderColor: theme.border
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: theme.text.secondary }}>
                Scale
              </div>
              <div className="text-lg font-bold mb-1" style={{ color: theme.text.primary }}>
                $30
              </div>
              <div className="text-xs" style={{ color: theme.text.muted }}>
                25 matches
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isUnlocked ? (
          matchCredits > 0 ? (
            <button
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="flex-1 font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              {isUnlocking ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Unlocking...
                </span>
              ) : (
                'Unlock Contact Details →'
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 font-bold py-4 rounded-xl opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: theme.border,
                color: theme.text.muted
              }}
            >
              Unlock Contact Details →
            </button>
          )
        ) : (
          <>
            <button
              onClick={async () => {
                // First check if user is logged in as a client
                try {
                  const sessionResponse = await fetch('/api/auth/session')
                  if (!sessionResponse.ok) {
                    // Not logged in at all - redirect to client login
                    window.location.href = `/client/login?redirect=/match/${match.brief_id || match.id}`
                    return
                  }
                  
                  const sessionData = await sessionResponse.json()
                  if (!sessionData.client) {
                    // Logged in but not as a client - show error or redirect
                    alert('Please log in as a client to send working requests to designers')
                    window.location.href = `/client/login?redirect=/match/${match.brief_id || match.id}`
                    return
                  }
                  
                  // User is logged in as a client - show working request modal
                  setShowWorkingRequestModal(true)
                } catch (error) {
                  logger.error('Error checking session:', error)
                  window.location.href = `/client/login?redirect=/match/${match.brief_id || match.id}`
                }
              }}
              className="flex-1 font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: theme.success,
                color: '#fff'
              }}
            >
              Send Working Request →
            </button>
          </>
        )}
      </div>

      {/* Purchase Options - Show when unlocked and no credits */}
      {isUnlocked && matchCredits === 0 && (
        <div className="mt-6 space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
              You're out of matches! Get more to find additional designers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRICING_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id}
                className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative"
                style={{ 
                  backgroundColor: pkg.popular ? (isDarkMode ? '#2A2A2A' : '#FFF9F0') : theme.nestedBg,
                  border: pkg.popular ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                  boxShadow: pkg.popular ? (isDarkMode ? 'none' : '0 4px 12px rgba(240, 173, 78, 0.15)') : 'none'
                }}
                onClick={() => handlePurchase(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold" 
                    style={{ backgroundColor: theme.accent, color: '#000' }}>
                    POPULAR
                  </div>
                )}
                
                <div className="text-center">
                  <h4 className="font-bold text-sm mb-1" style={{ color: theme.text.primary }}>
                    {pkg.name}
                  </h4>
                  <div className="text-2xl font-bold mb-1" style={{ color: theme.accent }}>
                    ${pkg.price}
                  </div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>
                    {pkg.credits} matches
                  </div>
                  
                  <button 
                    disabled={purchasingPackage === pkg.id}
                    className="w-full mt-3 font-semibold py-2 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: pkg.popular ? theme.accent : 'transparent',
                      border: pkg.popular ? 'none' : `1px solid ${theme.accent}`,
                      color: pkg.popular ? '#000' : theme.accent
                    }}
                  >
                    {purchasingPackage === pkg.id ? (
                      <span className="flex items-center justify-center gap-1">
                        <span className="animate-spin text-xs">⚡</span>
                        <span>Processing...</span>
                      </span>
                    ) : (
                      'Get Matches'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Find New Match Section - Only show when unlocked and has credits */}
      {isUnlocked && matchCredits > 0 && onFindNewMatch && (
        <div 
          className="mt-6 p-6 rounded-2xl border"
          style={{ 
            backgroundColor: theme.nestedBg,
            borderColor: theme.border
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-bold mb-2" style={{ color: theme.text.primary }}>
                Looking for another designer?
              </h4>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Find a new match for this project • Uses 1 credit • New designer will be unlocked automatically
              </p>
            </div>
            <button
              onClick={handleFindNewMatch}
              disabled={isFindingNewMatch}
              className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              {isFindingNewMatch ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🔄</span>
                  Finding...
                </span>
              ) : (
                'Find New Match →'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && match.designer.portfolioImages && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: theme.cardBg, color: theme.text.primary }}
            >
              ✕
            </button>

            {/* Navigation arrows */}
            {match.designer.portfolioImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => 
                      prev === 0 ? match.designer.portfolioImages!.length - 1 : prev - 1
                    )
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: theme.cardBg, color: theme.text.primary }}
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => 
                      prev === match.designer.portfolioImages!.length - 1 ? 0 : prev + 1
                    )
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: theme.cardBg, color: theme.text.primary }}
                >
                  →
                </button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center">
              <img
                src={match.designer.portfolioImages[selectedImageIndex]}
                alt={`Portfolio ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Image counter */}
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: theme.cardBg, color: theme.text.primary }}
            >
              {selectedImageIndex + 1} / {match.designer.portfolioImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Working Request Modal */}
      <WorkingRequestModal
        isOpen={showWorkingRequestModal}
        onClose={() => setShowWorkingRequestModal(false)}
        onConfirm={async () => {
          try {
            const response = await fetch(`/api/client/matches/${match.id}/contact`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                designerId: match.designer.id
                // No message needed - will be auto-generated
              })
            })

            const data = await response.json()
            
            if (!response.ok) {
              // Check if it's an authentication error
              if (response.status === 401) {
                alert(data.error || 'Please log in as a client to send working requests')
                window.location.href = `/client/login?redirect=/match/${match.brief_id || match.id}`
                return
              }
              throw new Error(data.error || 'Failed to send working request')
            }

            // Success is handled by the modal itself
            // Optionally reload page after a delay
            setTimeout(() => {
              window.location.reload()
            }, 2500)
          } catch (error) {
            logger.error('Error sending working request:', error)
            alert(error instanceof Error ? error.message : 'Failed to send working request')
            throw error // Re-throw to let WorkingRequestModal handle loading state
          }
        }}
        designerName={match.designer.firstName}
        projectType={match.designer.title}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}

function ProfileHighlight({ icon, label, value, theme, compact = false }: { icon: string, label: string, value: string, theme: any, compact?: boolean }) {
  if (compact) {
    return (
      <div 
        className="p-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
        style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{icon}</span>
          <div className="text-xs font-medium" style={{ color: theme.text.secondary }}>
            {label}
          </div>
        </div>
        <div className="text-sm font-semibold pl-5" style={{ color: theme.text.primary }}>
          {value}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium mb-1" style={{ color: theme.text.secondary }}>
            {label}
          </div>
          <div className="text-sm font-medium break-words" style={{ color: theme.text.primary }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}