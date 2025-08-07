'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { getTheme } from '@/lib/design-system'

interface DesignerRequest {
  id: string
  matchId: string
  status: string
  sentAt: string
  brief: {
    projectType: string
    industry: string
    timeline: string
  }
  client: {
    email: string
  }
  match: {
    score: number
    personalizedReasons: string[]
  }
}

export default function DesignerDashboardPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<DesignerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [designerName, setDesignerName] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      const response = await fetch('/api/designer/auth/session', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/designer/login')
        return
      }

      const data = await response.json()
      setDesignerName(data.designer.first_name)
      
      // Store in sessionStorage for other components
      sessionStorage.setItem('designerId', data.designer.id)
      sessionStorage.setItem('designerName', data.designer.first_name)
      
      await fetchRequests()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/designer/login')
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/designer/requests')
      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/designer/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Signout error:', error)
    }
    
    sessionStorage.removeItem('designerId')
    sessionStorage.removeItem('designerName')
    router.push('/designer/login')
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/designer/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: 'accept' }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept request')
      }

      // Refresh requests
      fetchRequests()
      alert('Request accepted! The client will be notified.')
    } catch (error) {
      console.error('Error accepting request:', error)
      alert('Failed to accept request. Please try again.')
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to decline this request?')) {
      return
    }

    try {
      const response = await fetch(`/api/designer/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: 'decline' }),
      })

      if (!response.ok) {
        throw new Error('Failed to decline request')
      }

      // Refresh requests
      fetchRequests()
    } catch (error) {
      console.error('Error declining request:', error)
      alert('Failed to decline request. Please try again.')
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <Navigation 
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        showSignOut={true}
        onSignOut={handleSignOut}
      />
      
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            Welcome back, {designerName}! 🎨
          </h1>
          <p className="mt-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Ready to tackle some awesome projects?
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔄</div>
            <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Loading your requests...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <div className="text-8xl mb-6">📭</div>
            <h2 className="text-3xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              No requests yet! 
            </h2>
            <p className="text-lg max-w-md mx-auto transition-colors duration-300" style={{ color: theme.text.secondary }}>
              When clients fall in love with your work, you'll see their requests here
            </p>
            <Link 
              href="/designer/profile"
              className="inline-block font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] mt-8"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Update Your Profile ✨
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">
              Your Matches ({requests.length})
            </h2>
            
            {requests.map((request) => (
              <div key={request.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl font-bold">{request.match.score}%</span>
                      <span className="text-sm text-muted-foreground">Match Score</span>
                    </div>
                    <h3 className="text-xl font-semibold">
                      {request.brief.projectType} Project
                    </h3>
                    <p className="text-muted-foreground">
                      {request.brief.industry} • {request.brief.timeline}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium mb-2">Why you're a perfect match:</h4>
                  <ul className="space-y-1">
                    {request.match.personalizedReasons.slice(0, 3).map((reason, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="btn-primary"
                    >
                      Accept & Connect
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className="btn-secondary"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-green-800">
                      ✅ You accepted this request. The client has been notified and can now contact you directly.
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  Received {new Date(request.sentAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/designer/profile" className="text-sm text-muted-foreground hover:text-foreground">
            Update your profile to get better matches →
          </Link>
        </div>
      </div>
    </main>
  )
}