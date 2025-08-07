'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTheme } from '../design-system'

// Mock data for demonstration
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
    created_at: '2024-01-15T10:00:00Z',
    designer: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      title: 'Senior Product Designer',
      city: 'San Francisco',
      rating: 4.9,
      totalProjects: 47,
      email: 'sarah@design.studio',
      phone: '+1 (555) 123-4567'
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
    created_at: '2024-01-10T14:30:00Z',
    designer: {
      firstName: 'Marcus',
      lastName: 'Chen',
      title: 'UI/UX Designer',
      city: 'New York',
      rating: 4.8,
      totalProjects: 32,
      email: 'marcus@designstudio.co',
      phone: '+1 (555) 987-6543'
    },
    brief: {
      project_type: 'Mobile App',
      company_name: 'FoodieApp',
      budget: '$5k-10k'
    }
  },
  {
    id: '3',
    score: 91,
    status: 'locked',
    created_at: '2024-01-20T09:00:00Z',
    designer: {
      firstName: 'Emma',
      lastInitial: 'W',
      title: 'Brand Designer',
      city: 'London',
      rating: 4.95,
      totalProjects: 64
    },
    brief: {
      project_type: 'Brand Identity',
      company_name: 'GrowthCo',
      budget: '$15k-30k'
    }
  }
]

export default function TestClientDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const activeMatches = mockMatches.filter(m => m.status === 'locked' || new Date(m.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const pastMatches = mockMatches.filter(m => m.status === 'unlocked' && new Date(m.created_at) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

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

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/test-redesign" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link 
                href="/test-redesign/brief" 
                className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                New Project →
              </Link>
              
              <div className="text-sm px-4 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: theme.tagBg, color: theme.text.primary }}>
                <span className="font-normal">You have</span> <span className="font-bold">{mockClient.match_credits} credits</span>
              </div>
            </div>
            
            {/* Theme Toggle */}
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

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Welcome back, {mockClient.name} 👋
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Manage your designer matches and projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Matches', value: mockMatches.length, emoji: '🎯' },
            { label: 'Active Projects', value: activeMatches.length, emoji: '🚀' },
            { label: 'Credits Left', value: mockClient.match_credits, emoji: '💳' },
            { label: 'Success Rate', value: '94%', emoji: '📈' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="rounded-2xl p-6 transition-all duration-300 animate-slideUp"
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="text-2xl mb-3">{stat.emoji}</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stat.value}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>{stat.label}</div>
            </div>
          ))}
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
            Active Matches ({activeMatches.length})
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
                      {match.designer.firstName} {match.status === 'unlocked' ? match.designer.lastName : match.designer.lastInitial + '***'}
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
                  
                  {/* Action Button */}
                  {match.status === 'unlocked' ? (
                    <div className="text-right">
                      {match.designer.email && (
                        <div className="text-sm mb-1" style={{ color: theme.text.secondary }}>
                          {match.designer.email}
                        </div>
                      )}
                      <Link 
                        href={`mailto:${match.designer.email}`}
                        className="inline-block font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] text-sm"
                        style={{ backgroundColor: theme.accent, color: '#000' }}
                      >
                        Contact Designer →
                      </Link>
                    </div>
                  ) : (
                    <Link 
                      href="/test-redesign/match"
                      className="font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: 'transparent',
                        border: `2px solid ${theme.accent}`,
                        color: theme.accent
                      }}
                    >
                      Unlock Contact
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {((activeTab === 'active' && activeMatches.length === 0) || 
          (activeTab === 'past' && pastMatches.length === 0)) && (
          <div className="text-center py-16">
            <div className="text-5xl mb-6">🎨</div>
            <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              No {activeTab} matches yet
            </h3>
            <p className="mb-8 transition-colors duration-300" style={{ color: theme.text.secondary }}>
              {activeTab === 'active' 
                ? "Time to find your next perfect designer match!"
                : "Your past matches will appear here"}
            </p>
            {activeTab === 'active' && (
              <Link 
                href="/test-redesign/brief"
                className="inline-block font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                Start New Project →
              </Link>
            )}
          </div>
        )}

        {/* Buy More Credits */}
        {mockClient.match_credits < 3 && (
          <div className="mt-12 rounded-2xl p-8 text-center" style={{ backgroundColor: theme.nestedBg }}>
            <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Running low on credits?
            </h3>
            <p className="mb-6 transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Get more designer matches with our credit packages
            </p>
            <Link 
              href="/test-redesign/pricing"
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