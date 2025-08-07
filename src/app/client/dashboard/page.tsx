'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { toast } from '@/lib/toast'
import { getTheme } from '@/lib/design-system'

// Mock data for demo
const mockClient = {
  id: '1',
  email: 'founder@startup.com',
  name: 'Alex Chen',
  match_credits: 7
}

const mockMatches = [
  {
    id: '1',
    score: 94,
    status: 'unlocked',
    reasons: ['Great experience with SaaS', 'Fast turnaround'],
    personalized_reasons: ['Matches your style preference'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    designer: {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      lastInitial: 'J',
      title: 'Senior Product Designer',
      city: 'San Francisco',
      country: 'USA',
      yearsExperience: 8,
      rating: 4.9,
      totalProjects: 47,
      email: 'sarah@design.studio',
      phone: '+1 (555) 123-4567',
      website: 'sarahdesigns.com'
    },
    brief: {
      project_type: 'SaaS Dashboard',
      company_name: 'TechFlow',
      budget: '$10k-25k'
    }
  },
  {
    id: '2',
    score: 87,
    status: 'unlocked',
    reasons: ['Mobile app expertise', 'Great communication'],
    personalized_reasons: ['Worked with similar industries'],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    designer: {
      id: '2',
      firstName: 'Marcus',
      lastName: 'Chen',
      lastInitial: 'C',
      title: 'UI/UX Designer',
      city: 'New York',
      country: 'USA',
      yearsExperience: 6,
      rating: 4.8,
      totalProjects: 32,
      email: 'marcus@designstudio.co',
      phone: '+1 (555) 987-6543',
      website: 'marcuschen.design'
    },
    brief: {
      project_type: 'Mobile App',
      company_name: 'FoodieApp',
      budget: '$5k-10k'
    }
  }
]

interface Client {
  id: string
  email: string
  name: string | null
  match_credits: number
}

interface Designer {
  id: string
  firstName: string
  lastName?: string
  lastInitial: string
  title: string
  city: string
  country: string
  yearsExperience?: number
  rating?: number
  totalProjects?: number
  email?: string
  phone?: string
  website?: string
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
  }
}

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')
  const theme = getTheme(isDarkMode)
  
  // Use mock data for demo - comment out for production
  const demoClient = mockClient
  const demoMatches = mockMatches

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const activeMatches = (demoMatches || matches).filter(m => 
    new Date(m.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  const pastMatches = (demoMatches || matches).filter(m => 
    new Date(m.created_at) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )

  useEffect(() => {
    checkSession()
    fetchMatches()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok || !data.user) {
        router.push('/')
        return
      }
      
      setClient(data.client)
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/')
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/client/matches', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch matches')
      
      const data = await response.json()
      // Only show unlocked and accepted matches
      const unlockedMatches = (data.matches || []).filter(
        (match: any) => match.status === 'unlocked' || match.status === 'accepted'
      )
      setMatches(unlockedMatches)
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    // For demo, just simulate refresh
    setTimeout(() => setRefreshing(false), 1000)
    // For production, uncomment: fetchMatches()
  }

  const handleNewProject = () => {
    router.push('/client/brief')
  }

  const handlePurchaseCredits = () => {
    router.push('/client/purchase')
  }

  const getMatchStatusBadge = (status: string) => {
    const labels = {
      pending: 'Locked',
      unlocked: 'Unlocked', 
      accepted: 'Connected',
      declined: 'Unavailable',
    }
    
    const colors = {
      pending: '#f59e0b',
      unlocked: theme.accent,
      accepted: '#10b981',
      declined: theme.text.muted,
    }
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: isDarkMode ? 'rgba(240, 173, 78, 0.1)' : 'rgba(240, 173, 78, 0.15)',
          color: colors[status as keyof typeof colors] || theme.text.muted
        }}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: theme.accent }}></div>
          <p className="mt-4 transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Loading your matches...
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <div style={{ borderBottom: `1px solid ${theme.border}` }}>
        <Navigation 
          theme={theme}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          showCredits={true}
          credits={(demoClient || client)?.match_credits || 0}
          showDashboardLink={true}
        />
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Welcome back, {(demoClient || client)?.name || 'there'} 👋
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Your designer matches are ready
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              animationDelay: '0.1s'
            }}>
            <div className="text-2xl mb-3">🎯</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{(demoMatches || matches).length}</div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Total Matches</div>
          </div>
          
          <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              animationDelay: '0.2s'
            }}>
            <div className="text-2xl mb-3">💳</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{(demoClient || client)?.match_credits || 0}</div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Credits Left</div>
          </div>
          
          <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              animationDelay: '0.3s'
            }}>
            <div className="text-2xl mb-3">🚀</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{activeMatches.length}</div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Active Projects</div>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="rounded-2xl p-6 transition-all duration-300 animate-slideUp hover:scale-[1.02]" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              animationDelay: '0.4s'
            }}>
            <div className="text-2xl mb-3">{refreshing ? '⚡' : '🔄'}</div>
            <div className="text-lg font-semibold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Update matches</div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'active' ? theme.accent : 'transparent',
              color: activeTab === 'active' ? '#000' : theme.text.secondary,
              border: `2px solid ${activeTab === 'active' ? theme.accent : theme.border}`
            }}
          >
            Recent Matches ({activeMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'past' ? theme.accent : 'transparent',
              color: activeTab === 'past' ? '#000' : theme.text.secondary,
              border: `2px solid ${activeTab === 'past' ? theme.accent : theme.border}`
            }}
          >
            Past Matches ({pastMatches.length})
          </button>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {(activeTab === 'active' ? activeMatches : pastMatches).map((match, index) => (
            <div 
              key={match.id}
              className="rounded-3xl p-6 transition-all duration-300 hover:scale-[1.01] animate-slideUp"
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Designer Avatar */}
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: theme.accent, color: '#000' }}
                  >
                    {match.designer.firstName[0]}
                  </div>
                  
                  {/* Designer Info */}
                  <div>
                    <h3 className="text-xl font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {match.designer.firstName} {match.designer.lastName}
                    </h3>
                    <p className="text-sm mb-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {match.designer.title} • {match.designer.city}
                    </p>
                    <div className="flex items-center gap-4 text-sm" style={{ color: theme.text.muted }}>
                      <span>{match.brief.project_type}</span>
                      <span>•</span>
                      <span>{formatDate(match.created_at)}</span>
                      {match.designer.rating && (
                        <>
                          <span>•</span>
                          <span>⭐ {match.designer.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right side */}
                <div className="flex items-center gap-6">
                  {/* Match Score */}
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: theme.accent }}>{match.score}%</div>
                    <div className="text-xs" style={{ color: theme.text.muted }}>Match</div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="text-right">
                    <div className="text-sm mb-2" style={{ color: theme.text.secondary }}>
                      {match.designer.email}
                    </div>
                    <Link 
                      href={`mailto:${match.designer.email}`}
                      className="inline-block font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] text-sm"
                      style={{ backgroundColor: theme.accent, color: '#000' }}
                    >
                      Contact Designer →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state for past matches */}
        {activeTab === 'past' && pastMatches.length === 0 && (
          <div className="text-center py-16 rounded-3xl" style={{ backgroundColor: theme.cardBg }}>
            <div className="text-5xl mb-6">📭</div>
            <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              No past matches yet
            </h3>
            <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Your older matches will appear here
            </p>
          </div>
        )}

        {/* Buy More Credits */}
        {((demoClient || client)?.match_credits || 0) < 3 && (
          <div className="mt-12 rounded-2xl p-8 text-center" style={{ backgroundColor: theme.nestedBg }}>
            <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Running low on credits?
            </h3>
            <p className="mb-6 transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Get more designer matches to find your perfect fit
            </p>
            <Link 
              href="/client/purchase"
              className="inline-block font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Buy More Credits →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}