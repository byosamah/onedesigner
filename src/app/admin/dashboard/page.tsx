'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { getTheme } from '@/lib/design-system'

interface Designer {
  id: string
  first_name: string
  last_name: string
  email: string
  title: string
  city: string
  country: string
  years_experience: number
  is_verified: boolean
  is_approved: boolean
  created_at: string
  website_url?: string
  bio?: string
  styles?: string[]
  project_types?: string[]
}

interface Stats {
  totalDesigners: number
  pendingApproval: number
  approvedDesigners: number
  totalClients: number
  totalMatches: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending')
  const [designers, setDesigners] = useState<Designer[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
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
      const response = await fetch('/api/admin/auth/session', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/admin')
        return
      }

      await Promise.all([fetchDesigners(), fetchStats()])
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin')
    }
  }

  const fetchDesigners = async () => {
    try {
      const response = await fetch('/api/admin/designers', {
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to fetch designers')
      
      const data = await response.json()
      setDesigners(data.designers || [])
    } catch (error) {
      console.error('Error fetching designers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprove = async (designerId: string) => {
    try {
      const response = await fetch(`/api/admin/designers/${designerId}/approve`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to approve designer')

      await fetchDesigners()
      await fetchStats()
      alert('Designer approved successfully!')
    } catch (error) {
      console.error('Error approving designer:', error)
      alert('Failed to approve designer')
    }
  }

  const handleReject = async (designerId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      const response = await fetch(`/api/admin/designers/${designerId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to reject designer')

      await fetchDesigners()
      await fetchStats()
      setSelectedDesigner(null)
      setRejectionReason('')
      alert('Designer rejected')
    } catch (error) {
      console.error('Error rejecting designer:', error)
      alert('Failed to reject designer')
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Signout error:', error)
    }
    
    sessionStorage.removeItem('adminEmail')
    router.push('/admin')
  }

  const filteredDesigners = designers.filter(designer => {
    if (activeTab === 'pending') return designer.is_verified && !designer.is_approved
    if (activeTab === 'approved') return designer.is_approved
    return true
  })

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-5xl mb-6 animate-pulse">⚡</div>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Loading admin panel...
          </h2>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation component */}
      <div style={{ borderBottom: `1px solid ${theme.border}` }}>
        <Navigation 
          theme={theme}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          title="OneDesigner Admin"
          showSignOut={true}
          onSignOut={handleSignOut}
        />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Admin Dashboard
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Manage designers and monitor platform activity
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: '0.1s'
              }}>
              <div className="text-2xl mb-3">👥</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stats.totalDesigners}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>Total Designers</div>
            </div>
            
            <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: '0.2s'
              }}>
              <div className="text-2xl mb-3">⏳</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stats.pendingApproval}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>Pending Approval</div>
            </div>
            
            <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: '0.3s'
              }}>
              <div className="text-2xl mb-3">✅</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stats.approvedDesigners}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>Approved</div>
            </div>
            
            <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: '0.4s'
              }}>
              <div className="text-2xl mb-3">💼</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stats.totalClients}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>Total Clients</div>
            </div>
            
            <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                animationDelay: '0.5s'
              }}>
              <div className="text-2xl mb-3">🎯</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stats.totalMatches}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>Total Matches</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'pending' ? theme.accent : 'transparent',
              color: activeTab === 'pending' ? '#000' : theme.text.secondary,
              border: `2px solid ${activeTab === 'pending' ? theme.accent : theme.border}`
            }}
          >
            Pending ({stats?.pendingApproval || 0})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'approved' ? theme.accent : 'transparent',
              color: activeTab === 'approved' ? '#000' : theme.text.secondary,
              border: `2px solid ${activeTab === 'approved' ? theme.accent : theme.border}`
            }}
          >
            Approved ({stats?.approvedDesigners || 0})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'all' ? theme.accent : 'transparent',
              color: activeTab === 'all' ? '#000' : theme.text.secondary,
              border: `2px solid ${activeTab === 'all' ? theme.accent : theme.border}`
            }}
          >
            All Designers ({stats?.totalDesigners || 0})
          </button>
        </div>

        {/* Designers List */}
        <div className="space-y-4">
          {filteredDesigners.length === 0 ? (
            <div className="text-center py-16 rounded-3xl" style={{ backgroundColor: theme.cardBg }}>
              <div className="text-5xl mb-6">📭</div>
              <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                No {activeTab === 'all' ? '' : activeTab} designers
              </h3>
              <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                {activeTab === 'pending' ? 'All designers have been reviewed' : `No ${activeTab === 'all' ? '' : activeTab} designers to show`}
              </p>
            </div>
          ) : (
            filteredDesigners.map((designer) => (
              <div 
                key={designer.id}
                className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.002]"
                style={{ 
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: theme.accent, color: '#000' }}
                    >
                      {designer.first_name[0]}{designer.last_name[0]}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                        {designer.first_name} {designer.last_name}
                        {designer.is_approved && (
                          <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                            ✓ Approved
                          </span>
                        )}
                        {!designer.is_approved && designer.is_verified && (
                          <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                            ⏳ Pending
                          </span>
                        )}
                      </h3>
                      <p className="text-sm mb-1 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                        {designer.title} • {designer.city}, {designer.country} • {designer.years_experience} years exp
                      </p>
                      <p className="text-sm" style={{ color: theme.text.muted }}>
                        {designer.email}
                        {designer.website_url && (
                          <>
                            {' • '}
                            <a 
                              href={designer.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:opacity-80 transition-opacity"
                              style={{ color: theme.accent }}
                            >
                              Portfolio →
                            </a>
                          </>
                        )}
                      </p>
                      {designer.bio && (
                        <p className="text-sm mt-2 line-clamp-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                          {designer.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!designer.is_approved && designer.is_verified && (
                      <>
                        <button
                          onClick={() => handleApprove(designer.id)}
                          className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                          style={{ backgroundColor: theme.success, color: '#FFF' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedDesigner(designer)}
                          className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                          style={{ 
                            backgroundColor: 'transparent',
                            border: `2px solid ${theme.error}`,
                            color: theme.error
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedDesigner(designer)}
                      className="font-medium py-2 px-4 rounded-xl transition-all duration-300"
                      style={{ 
                        backgroundColor: theme.nestedBg,
                        color: theme.text.secondary
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                
                <div className="text-xs mt-4 transition-colors duration-300" style={{ color: theme.text.muted }}>
                  Applied: {new Date(designer.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Designer Details Modal */}
      {selectedDesigner && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => {
            setSelectedDesigner(null)
            setRejectionReason('')
          }}
        >
          <div 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8"
            style={{ backgroundColor: theme.cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Designer Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Name</p>
                <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {selectedDesigner.first_name} {selectedDesigner.last_name}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Email</p>
                <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {selectedDesigner.email}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Title</p>
                <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {selectedDesigner.title}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Location</p>
                <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {selectedDesigner.city}, {selectedDesigner.country}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Experience</p>
                <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {selectedDesigner.years_experience} years
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Bio</p>
                <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {selectedDesigner.bio || 'No bio provided'}
                </p>
              </div>
              
              {selectedDesigner.website_url && (
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Website</p>
                  <a 
                    href={selectedDesigner.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-colors duration-300 hover:opacity-80"
                    style={{ color: theme.accent }}
                  >
                    {selectedDesigner.website_url}
                  </a>
                </div>
              )}
              
              {!selectedDesigner.is_approved && selectedDesigner.is_verified && (
                <div className="pt-6 space-y-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Rejection reason (required if rejecting)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedDesigner.id)}
                      className="flex-1 font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: theme.success, color: '#FFF' }}
                    >
                      Approve Designer
                    </button>
                    <button
                      onClick={() => handleReject(selectedDesigner.id)}
                      disabled={!rejectionReason.trim()}
                      className="flex-1 font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: theme.error, color: '#FFF' }}
                    >
                      Reject Designer
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                setSelectedDesigner(null)
                setRejectionReason('')
              }}
              className="mt-6 w-full font-medium py-3 rounded-xl transition-all duration-300"
              style={{ 
                backgroundColor: theme.nestedBg,
                color: theme.text.secondary
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}