'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { toast } from '@/lib/toast'
import { getTheme } from '@/lib/design-system'

interface Designer {
  id: string
  first_name: string
  last_initial: string
  title: string
  city: string
  country: string
  email?: string
  phone?: string
  website?: string
  bio: string
  years_experience: number
  rating: number
  total_projects: number
  styles: string[]
  industries: string[]
}

interface Match {
  id: string
  score: number
  status: string
  reasons: string[]
  personalized_reasons: string[]
  created_at: string
  designer: Designer
  brief: {
    project_type: string
    company_name: string
    budget: string
    timeline: string
    details: string
  }
}

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    fetchMatch()
    fetchCredits()
  }, [params.id])

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/client/matches/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch match')
      
      const data = await response.json()
      setMatch(data.match)
    } catch (error) {
      console.error('Error fetching match:', error)
      toast.error('Failed to load match details')
      router.push('/client/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setCredits(data.client?.match_credits || 0)
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const handleUnlock = async () => {
    if (credits < 1) {
      router.push('/client/purchase')
      return
    }

    setUnlocking(true)
    try {
      const response = await fetch(`/api/client/matches/${params.id}/unlock`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unlock match')
      }

      const data = await response.json()
      toast.success('Match unlocked successfully!')
      
      // Refresh match data
      await fetchMatch()
      await fetchCredits()
    } catch (error) {
      console.error('Error unlocking match:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to unlock match')
    } finally {
      setUnlocking(false)
    }
  }

  const handlePurchaseCredits = () => {
    router.push('/client/purchase')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading match details...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Match not found</p>
          <button
            onClick={() => router.push('/client/dashboard')}
            className="mt-4 text-black hover:underline"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/client/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Your Credits</p>
              <p className="text-lg font-semibold">{credits}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Designer Info */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {match.designer.first_name} {match.designer.last_initial}.
                </h1>
                <p className="text-lg text-gray-600">
                  {match.designer.title} • {match.designer.city}, {match.designer.country}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{match.designer.years_experience} years experience</span>
                  <span>•</span>
                  <span>⭐ {match.designer.rating}/5</span>
                  <span>•</span>
                  <span>{match.designer.total_projects} projects</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{match.score}%</p>
                <p className="text-sm text-gray-500">Match Score</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-600">{match.designer.bio}</p>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Design Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {match.designer.styles.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {match.designer.industries.map((industry) => (
                    <span
                      key={industry}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Match Reasons */}
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2">Why they're perfect for your project</h3>
              <p className="text-gray-700">{match.personalized_reasons.join(' ')}</p>
            </div>

            {/* Contact Info or Unlock */}
            {match.status === 'pending' ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to connect?</h3>
                <p className="text-gray-600 mb-4">
                  Unlock this designer's contact information to start your project
                </p>
                {credits >= 1 ? (
                  <button
                    onClick={handleUnlock}
                    disabled={unlocking}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {unlocking ? 'Unlocking...' : 'Unlock Contact (1 Credit)'}
                  </button>
                ) : (
                  <div>
                    <p className="text-red-600 mb-4">You need at least 1 credit to unlock</p>
                    <button
                      onClick={handlePurchaseCredits}
                      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                    >
                      Purchase Credits
                    </button>
                  </div>
                )}
              </div>
            ) : match.status === 'unlocked' ? (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Waiting for designer response</h3>
                <p className="text-gray-600">
                  We've notified {match.designer.first_name} about your interest. 
                  They typically respond within 24-48 hours.
                </p>
              </div>
            ) : match.status === 'accepted' && match.designer.email ? (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Designer Contact Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${match.designer.email}`} className="text-blue-600 hover:underline">
                      {match.designer.email}
                    </a>
                  </p>
                  {match.designer.phone && (
                    <p>
                      <span className="font-medium">Phone:</span>{' '}
                      <a href={`tel:${match.designer.phone}`} className="text-blue-600 hover:underline">
                        {match.designer.phone}
                      </a>
                    </p>
                  )}
                  {match.designer.website && (
                    <p>
                      <span className="font-medium">Website:</span>{' '}
                      <a
                        href={match.designer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {match.designer.website}
                      </a>
                    </p>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  🎉 You can now contact {match.designer.first_name} directly to discuss your project!
                </p>
              </div>
            ) : match.status === 'declined' ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Designer Unavailable</h3>
                <p className="text-gray-600">
                  Unfortunately, {match.designer.first_name} is unable to take on your project at this time.
                  Your credit was not used for this match.
                </p>
                <button
                  onClick={() => router.push('/client/dashboard')}
                  className="mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                >
                  View Other Matches
                </button>
              </div>
            ) : null}
          </div>

          {/* Project Brief Summary */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Your Project Brief</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Company:</span> {match.brief.company_name}</p>
              <p><span className="font-medium">Project Type:</span> {match.brief.project_type}</p>
              <p><span className="font-medium">Budget:</span> {match.brief.budget}</p>
              <p><span className="font-medium">Timeline:</span> {match.brief.timeline}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}