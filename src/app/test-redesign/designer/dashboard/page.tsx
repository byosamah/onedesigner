'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTheme } from '../../design-system'

// Mock data for demo
const mockDesigner = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah@design.studio',
  title: 'Senior Product Designer',
  city: 'San Francisco',
  country: 'USA',
  yearsExperience: 8,
  rating: 4.9,
  totalProjects: 47,
  earnings: 127500,
  pendingEarnings: 3500,
  profileViews: 234,
  matchScore: 94,
  responseRate: 98,
  avgResponseTime: '2 hours'
}

const mockRequests = [
  {
    id: '1',
    clientName: 'Alex Chen',
    company: 'TechFlow',
    projectType: 'SaaS Dashboard',
    budget: '$10k-25k',
    timeline: '2-3 months',
    matchScore: 94,
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: '2',
    clientName: 'Maria Rodriguez',
    company: 'FoodieApp',
    projectType: 'Mobile App',
    budget: '$5k-10k',
    timeline: '1-2 months',
    matchScore: 87,
    receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  }
]

const mockActiveProjects = [
  {
    id: '1',
    clientName: 'David Kim',
    company: 'FinanceHub',
    projectType: 'Web App Redesign',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 65
  }
]

type TabType = 'requests' | 'active' | 'completed'

export default function TestDesignerDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('requests')
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return Math.floor(diffInHours * 60) + ' minutes ago'
    } else if (diffInHours < 24) {
      return Math.floor(diffInHours) + ' hours ago'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4" style={{ borderBottom: '1px solid ' + theme.border }}>
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
                href="/test-redesign/designer/profile" 
                className="text-sm font-medium transition-colors duration-300" 
                style={{ color: theme.text.secondary }}
              >
                Edit Profile
              </Link>
              
              <Link 
                href="/test-redesign/designer/earnings" 
                className="text-sm font-medium transition-colors duration-300" 
                style={{ color: theme.text.secondary }}
              >
                Earnings
              </Link>
              
              <button className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Sign Out
              </button>
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
            Hey {mockDesigner.firstName}! Let's ship some pixels 🚀
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            {mockRequests.filter(r => r.status === 'pending').length} new matches waiting. Time to make magic happen.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: '1px solid ' + theme.border,
              animationDelay: '0.1s'
            }}>
            <div className="text-2xl mb-3">💰</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>
              {'$'}{(mockDesigner.earnings / 1000).toFixed(0)}k
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Total Earned</div>
            {mockDesigner.pendingEarnings > 0 && (
              <div className="text-xs mt-2" style={{ color: theme.accent }}>
                +{'$'}{mockDesigner.pendingEarnings.toLocaleString()} pending
              </div>
            )}
          </div>
          
          <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: '1px solid ' + theme.border,
              animationDelay: '0.2s'
            }}>
            <div className="text-2xl mb-3">⚡</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>
              {mockDesigner.responseRate}%
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Response Rate</div>
            <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
              Avg: {mockDesigner.avgResponseTime}
            </div>
          </div>
          
          <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: '1px solid ' + theme.border,
              animationDelay: '0.3s'
            }}>
            <div className="text-2xl mb-3">🎯</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>
              {mockDesigner.matchScore}%
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Match Quality</div>
            <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
              Top 5% designer
            </div>
          </div>
          
          <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
            style={{ 
              backgroundColor: theme.cardBg,
              border: '1px solid ' + theme.border,
              animationDelay: '0.4s'
            }}>
            <div className="text-2xl mb-3">👀</div>
            <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>
              {mockDesigner.profileViews}
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>Profile Views</div>
            <div className="text-xs mt-2" style={{ color: theme.success }}>
              +23% this week
            </div>
          </div>
        </div>

        {/* Response Time Alert */}
        {mockRequests.filter(r => r.status === 'pending').length > 0 && (
          <div className="rounded-2xl p-6 mb-8 transition-all duration-300" 
            style={{ 
              backgroundColor: isDarkMode ? '#2A2A2A' : '#FEF3C7',
              border: '1px solid ' + theme.accent
            }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  ⏰ Quick reminder: Respond within 48 hours
                </h3>
                <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  Founders love fast responses. Your current avg: {mockDesigner.avgResponseTime} (killing it! 🔥)
                </p>
              </div>
              <button 
                className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                View All Requests →
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('requests')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'requests' ? theme.accent : 'transparent',
              color: activeTab === 'requests' ? '#000' : theme.text.secondary,
              border: '2px solid ' + (activeTab === 'requests' ? theme.accent : theme.border)
            }}
          >
            Match Requests ({mockRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'active' ? theme.accent : 'transparent',
              color: activeTab === 'active' ? '#000' : theme.text.secondary,
              border: '2px solid ' + (activeTab === 'active' ? theme.accent : theme.border)
            }}
          >
            Active Projects ({mockActiveProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'completed' ? theme.accent : 'transparent',
              color: activeTab === 'completed' ? '#000' : theme.text.secondary,
              border: '2px solid ' + (activeTab === 'completed' ? theme.accent : theme.border)
            }}
          >
            Completed ({mockDesigner.totalProjects})
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="space-y-4">
          {activeTab === 'requests' && mockRequests.map((request, index) => (
            <div 
              key={request.id}
              className="rounded-3xl p-6 transition-all duration-300 hover:scale-[1.01] animate-slideUp"
              style={{ 
                backgroundColor: theme.cardBg,
                border: '1px solid ' + theme.border,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: (index * 0.1) + 's'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {request.clientName} @ {request.company}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" 
                      style={{ backgroundColor: theme.accent, color: '#000' }}>
                      {request.matchScore}% match
                    </span>
                    <span className="text-sm" style={{ color: theme.text.muted }}>
                      {formatTime(request.receivedAt)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Project</p>
                      <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        {request.projectType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Budget</p>
                      <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        {request.budget}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Timeline</p>
                      <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        {request.timeline}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: theme.accent, color: '#000' }}
                    >
                      Accept Match →
                    </button>
                    <button 
                      className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: 'transparent',
                        border: '2px solid ' + theme.border,
                        color: theme.text.secondary
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="font-medium py-2 px-4 rounded-xl transition-all duration-300"
                      style={{ color: theme.text.muted }}
                    >
                      Pass
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'active' && mockActiveProjects.map((project, index) => (
            <div 
              key={project.id}
              className="rounded-3xl p-6 transition-all duration-300 hover:scale-[1.01] animate-slideUp"
              style={{ 
                backgroundColor: theme.cardBg,
                border: '1px solid ' + theme.border,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: (index * 0.1) + 's'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    {project.clientName} @ {project.company}
                  </h3>
                  <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                    {project.projectType} • Started {formatTime(project.startDate)}
                  </p>
                </div>
                <button 
                  className="font-medium py-2 px-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: theme.nestedBg, color: theme.text.secondary }}
                >
                  Message Client
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: theme.text.muted }}>Progress</span>
                  <span style={{ color: theme.accent }}>{project.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.nestedBg }}>
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: project.progress + '%',
                      backgroundColor: theme.accent
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'completed' && (
            <div className="text-center py-16 rounded-3xl" style={{ backgroundColor: theme.cardBg }}>
              <div className="text-5xl mb-6">🎉</div>
              <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                {mockDesigner.totalProjects} projects shipped!
              </h3>
              <p className="transition-colors duration-300 mb-6" style={{ color: theme.text.secondary }}>
                You've helped {mockDesigner.totalProjects} founders turn ideas into reality
              </p>
              <Link 
                href="/test-redesign/designer/portfolio"
                className="inline-block font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                View Portfolio →
              </Link>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-16 rounded-2xl p-8" style={{ backgroundColor: theme.nestedBg }}>
          <h3 className="text-xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
            💡 Pro tips to get more matches
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl mb-3">📸</div>
              <h4 className="font-semibold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Update portfolio weekly
              </h4>
              <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Fresh work = 3x more views. Founders love seeing recent projects.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-3">⚡</div>
              <h4 className="font-semibold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Respond in &lt; 4 hours
              </h4>
              <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Fast designers close 2x more deals. Set up notifications!
              </p>
            </div>
            <div>
              <div className="text-2xl mb-3">🎯</div>
              <h4 className="font-semibold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Be specific in your bio
              </h4>
              <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                "SaaS expert" beats "UI/UX designer". Niche down = level up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}