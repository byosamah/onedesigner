'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedLoadingMessages } from '@/components/AnimatedLoadingMessages'

interface Designer {
  id: string
  firstName: string
  lastName?: string
  lastInitial: string
  title: string
  city: string
  country: string
  yearsExperience: number
  rating: number
  totalProjects: number
  styles: string[]
  industries: string[]
}

interface MatchResult {
  phase: 'instant' | 'refined' | 'final'
  match: {
    score: number
    confidence?: 'low' | 'medium' | 'high'
    designer: Designer
    matchExplanation?: string
    keyStrengths?: string[]
    uniqueValue?: string
  }
  elapsed: number
  alternatives?: Array<{
    score: number
    designer: Designer
  }>
}

interface OptimizedMatchFinderProps {
  briefId: string
  onMatchFound?: (match: MatchResult) => void
}

export function OptimizedMatchFinder({ briefId, onMatchFound }: OptimizedMatchFinderProps) {
  const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(null)
  const [isRefining, setIsRefining] = useState(false)
  const [timeline, setTimeline] = useState<string>('')
  const [error, setError] = useState<string>('')
  const eventSourceRef = useRef<EventSource | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!briefId) return

    // Start streaming connection
    const eventSource = new EventSource(`/api/match/find-optimized?briefId=${briefId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close()
        setIsRefining(false)
        return
      }

      try {
        const data: MatchResult = JSON.parse(event.data)
        
        if ('error' in data) {
          setError((data as any).error)
          eventSource.close()
          return
        }
        
        setCurrentMatch(data)
        setIsRefining(data.phase !== 'final')
        
        // Update timeline indicator
        if (data.phase === 'instant') {
          setTimeline(`Found match in ${data.elapsed}ms!`)
        } else if (data.phase === 'refined') {
          setTimeline(`Enhanced match (${data.elapsed}ms)`)
        } else if (data.phase === 'final') {
          setTimeline(`Perfect match found (${data.elapsed}ms)`)
        }

        if (onMatchFound) {
          onMatchFound(data)
        }
      } catch (err) {
        console.error('Failed to parse match data:', err)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      eventSource.close()
      setIsRefining(false)
      
      // Check if it's an authentication error
      if (error && 'target' in error && 'readyState' in (error.target as any)) {
        const eventSource = error.target as EventSource
        if (eventSource.readyState === EventSource.CLOSED) {
          // Connection was closed, possibly due to auth error
          setError('Session expired. Please refresh the page.')
          return
        }
      }
      
      // Fallback to non-streaming endpoint
      fetchInstantMatch()
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [briefId])

  // Fallback for non-streaming support
  const fetchInstantMatch = async () => {
    try {
      const response = await fetch('/api/match/find-optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to find match')
      }

      const data = await response.json()
      
      if (data.match) {
        setCurrentMatch({
          phase: 'instant',
          match: data.match,
          elapsed: 50
        })
      }
    } catch (err) {
      console.error('Fallback match error:', err)
      setError('Failed to find a match. Please try again.')
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Unable to Find Match</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 mr-2"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => router.push('/brief')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  if (!currentMatch) {
    return <MatchSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Performance Timeline */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{timeline}</span>
            {isRefining && <RefiningIndicator />}
          </div>
          <div className="flex gap-2">
            <PhaseIndicator phase="instant" active={true} />
            <PhaseIndicator phase="refined" active={currentMatch.phase !== 'instant'} />
            <PhaseIndicator phase="final" active={currentMatch.phase === 'final'} />
          </div>
        </div>
      </div>

      {/* Main Match Card */}
      <MatchCard
        match={currentMatch.match}
        phase={currentMatch.phase}
        isRefining={isRefining}
      />

    </div>
  )
}

function MatchCard({ match, phase, isRefining }: any) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 transition-all ${isRefining ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <div className="flex items-start gap-6 mb-6">
        <div className={`w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl ${!isUnlocked && 'blur-sm'}`}>
          {match.designer?.firstName?.[0] || '?'}
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {match.designer?.firstName || 'Designer'} {!isUnlocked ? (match.designer?.lastInitial || '') + '***' : match.designer?.lastName || ''}
          </h2>
          <p className="text-lg text-gray-600">{match.designer?.title || 'Designer'}</p>
          <p className="text-gray-600">
            📍 {match.designer?.city || 'Location'}, {match.designer?.country || ''}
          </p>
          
          <div className="flex gap-4 mt-3 text-sm">
            <span>⭐ {match.designer?.rating || '5.0'} rating</span>
            <span>🎯 {match.designer?.totalProjects || '10'} projects</span>
            <span>⏰ {match.designer?.yearsExperience || '5'} years exp</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold">{match.score}%</div>
          <div className="text-sm text-gray-600">Match Score</div>
          {match.confidence && (
            <div className={`text-xs mt-1 ${
              match.confidence === 'high' ? 'text-green-600' : 
              match.confidence === 'medium' ? 'text-yellow-600' : 
              'text-gray-600'
            }`}>
              {match.confidence} confidence
            </div>
          )}
        </div>
      </div>

      {/* Smart Explanation (appears after refined phase) */}
      {match.matchExplanation && phase !== 'instant' && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm leading-relaxed">{match.matchExplanation}</p>
        </div>
      )}

      {/* Key Strengths */}
      {match.keyStrengths && match.keyStrengths.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Why They're Perfect</h3>
          <div className="space-y-2">
            {match.keyStrengths.map((strength: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-sm">{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6">
        <button 
          onClick={() => setIsUnlocked(true)}
          disabled={isRefining}
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isRefining ? 'Finding Better Match...' : 'Unlock Designer Details'}
        </button>
      </div>
    </div>
  )
}


function RefiningIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
      </div>
      <span className="text-sm text-blue-600">Enhancing match...</span>
    </div>
  )
}

function PhaseIndicator({ phase, active }: { phase: string; active: boolean }) {
  const labels = {
    instant: 'Instant',
    refined: 'AI Enhanced',
    final: 'Deep Analysis'
  }
  
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
      active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
    }`}>
      {labels[phase as keyof typeof labels]}
    </div>
  )
}

function MatchSkeleton() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-6 animate-pulse">🔍</div>
      <h2 className="text-xl font-semibold mb-4">Finding your perfect designer...</h2>
      <AnimatedLoadingMessages />
    </div>
  )
}