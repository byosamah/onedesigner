'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { getTheme } from '../../design-system'

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

export default function TestAdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [designers, setDesigners] = useState<Designer[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      const response = await fetch('/api/admin/auth/session', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/test-redesign/admin')
        return
      }

      await Promise.all([fetchDesigners(), fetchStats()])
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/test-redesign/admin')
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
      
      toast.success('Designer approved successfully')
      await fetchDesigners()
      setSelectedDesigner(null)
    } catch (error) {
      console.error('Error approving designer:', error)
      toast.error('Failed to approve designer')
    }
  }

  const handleReject = async (designerId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
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
      
      toast.success('Designer rejected')
      await fetchDesigners()
      setSelectedDesigner(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting designer:', error)
      toast.error('Failed to reject designer')
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const filteredDesigners = designers.filter(d => {
    if (activeTab === 'pending') return !d.is_approved && d.is_verified
    if (activeTab === 'approved') return d.is_approved
    if (activeTab === 'rejected') return !d.is_approved && !d.is_verified
    return false
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
      {/* Navigation */}
      <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/test-redesign" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
              </svg>
              OneDesigner Admin
            </Link>
            
            <div className="flex gap-4">
              <Link href="/test-redesign/admin/performance" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Performance
              </Link>
              <Link href="/test-redesign/admin/settings" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Settings
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Sign Out
            </button>
            
            {/* Theme Toggle */}
            <div className="border-l pl-6" style={{ borderColor: theme.border }}>
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
                animationDelay: '0.4s'
              }}>
              <div className="text-2xl mb-3">🎯</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stats.totalMatches}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>Total Matches</div>
            </div>
            
            <div className="rounded-2xl p-6 transition-all duration-300 animate-slideUp" 
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                animationDelay: '0.5s'
              }}>
              <div className="text-2xl mb-3">💼</div>
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>{stats.totalClients}</div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>Total Clients</div>
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
            Pending ({designers.filter(d => !d.is_approved && d.is_verified).length})
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
            Approved ({designers.filter(d => d.is_approved).length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'rejected' ? theme.accent : 'transparent',
              color: activeTab === 'rejected' ? '#000' : theme.text.secondary,
              border: `2px solid ${activeTab === 'rejected' ? theme.accent : theme.border}`
            }}
          >
            Rejected ({designers.filter(d => !d.is_approved && !d.is_verified).length})
          </button>
        </div>

        {/* Designers List */}
        <div className="space-y-4">
          {filteredDesigners.map((designer) => (
            <div 
              key={designer.id}
              className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.005]"
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
                    </h3>
                    <p className="text-sm mb-1 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {designer.title} • {designer.city}, {designer.country}
                    </p>
                    <p className="text-sm" style={{ color: theme.text.muted }}>
                      {designer.email} • {designer.years_experience} years exp
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {activeTab === 'pending' && (
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
            </div>
          ))}
        </div>

        {filteredDesigners.length === 0 && (
          <div className="text-center py-16 rounded-3xl" style={{ backgroundColor: theme.cardBg }}>
            <div className="text-5xl mb-6">📭</div>
            <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              No {activeTab} designers
            </h3>
            <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
              {activeTab === 'pending' ? 'All designers have been reviewed' : `No ${activeTab} designers to show`}
            </p>
          </div>
        )}
      </div>

      {/* Designer Details Modal */}
      {selectedDesigner && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setSelectedDesigner(null)}
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
              
              {activeTab === 'pending' && (
                <div className="pt-6 space-y-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Rejection reason (if rejecting)..."
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
                      className="flex-1 font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: theme.error, color: '#FFF' }}
                    >
                      Reject Designer
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedDesigner(null)}
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