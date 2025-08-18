'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { useTheme } from '@/lib/hooks/useTheme'
import { logger } from '@/lib/core/logging-service'

// TODO(human): Update this interface to match the actual application fields
interface Designer {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  city: string
  country: string
  yearsExperience: number | string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  websiteUrl?: string
  bio?: string
  styles?: string[]
  projectTypes?: string[]
  industries?: string[]
  specializations?: string[]
  softwareSkills?: string[]
  // Additional fields
  phone?: string
  portfolioUrl?: string
  projectPriceFrom?: number
  projectPriceTo?: number
  availability?: string
  timezone?: string
  dribbbleUrl?: string
  behanceUrl?: string
  linkedinUrl?: string
  previousClients?: string
  projectPreferences?: string
  workingStyle?: string
  communicationStyle?: string
  remoteExperience?: string
  teamCollaboration?: string
  totalProjects?: number
  updatedAt?: string
  rejectionReason?: string
  tools?: (string | null)[]
  portfolio_images?: (string | null)[]
  avatar?: string
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
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [designers, setDesigners] = useState<Designer[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const { theme, isDarkMode, toggleTheme } = useTheme()

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
      logger.error('Auth check error:', error)
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
      logger.error('Error fetching designers:', error)
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
      logger.error('Error fetching stats:', error)
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
      logger.error('Error approving designer:', error)
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
      logger.error('Error rejecting designer:', error)
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
      logger.error('Signout error:', error)
    }
    
    sessionStorage.removeItem('adminEmail')
    router.push('/admin')
  }

  const filteredDesigners = designers.filter(designer => {
    if (activeTab === 'pending') return designer.isVerified && !designer.isApproved && !designer.rejectionReason
    if (activeTab === 'approved') return designer.isApproved
    if (activeTab === 'rejected') return !designer.isApproved && designer.rejectionReason
    if (activeTab === 'resubmitted') return !designer.isApproved && !designer.rejectionReason && designer.editedAfterApproval
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
            Pending ({designers.filter(d => d.isVerified && !d.isApproved && !d.rejectionReason).length})
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
            onClick={() => setActiveTab('resubmitted')}
            className="font-semibold py-2 px-6 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: activeTab === 'resubmitted' ? theme.accent : 'transparent',
              color: activeTab === 'resubmitted' ? '#000' : theme.text.secondary,
              border: `2px solid ${activeTab === 'resubmitted' ? theme.accent : theme.border}`
            }}
          >
            🔄 Resubmitted ({designers.filter(d => !d.isApproved && !d.rejectionReason && d.editedAfterApproval).length})
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
            Rejected ({designers.filter(d => !d.isApproved && d.rejectionReason).length})
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
                className="rounded-3xl p-6 transition-all duration-300 hover:scale-[1.002] cursor-pointer"
                style={{ 
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => setSelectedDesigner(designer)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0">
                    {designer.avatar ? (
                      <img 
                        src={designer.avatar} 
                        alt={`${designer.firstName} ${designer.lastName}`}
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: theme.accent }}
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2"
                        style={{ 
                          backgroundColor: theme.nestedBg,
                          borderColor: theme.accent,
                          color: theme.accent
                        }}
                      >
                        {designer.firstName?.[0]?.toUpperCase()}{designer.lastName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                            {designer.firstName} {designer.lastName}
                          </h3>
                          {designer.isApproved && (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" 
                              style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                              ✓ Approved
                            </span>
                          )}
                          {!designer.isApproved && designer.isVerified && !designer.rejectionReason && (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" 
                              style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                              ⏳ Pending
                            </span>
                          )}
                          {!designer.isApproved && designer.rejectionReason && (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" 
                              style={{ backgroundColor: theme.error + '20', color: theme.error }}>
                              ✗ Rejected
                            </span>
                          )}
                        </div>
                        
                        {/* Professional Info */}
                        <p className="text-sm font-medium mt-1" style={{ color: theme.text.secondary }}>
                          {designer.title} • {designer.city}, {designer.country} • {designer.yearsExperience} years exp
                        </p>
                        
                        {/* Contact Info */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-sm" style={{ color: theme.text.muted }}>
                            {designer.email}
                          </p>
                          {designer.websiteUrl && (
                            <a 
                              href={designer.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm hover:opacity-80 transition-opacity"
                              style={{ color: theme.accent }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Portfolio →
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDesigner(designer)
                        }}
                        className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] whitespace-nowrap"
                        style={{ 
                          backgroundColor: theme.nestedBg,
                          color: theme.text.primary,
                          border: `1px solid ${theme.border}`
                        }}
                      >
                        View Details
                      </button>
                    </div>
                    
                    {/* Bio */}
                    {designer.bio && (
                      <p className="text-sm line-clamp-2 mt-3" style={{ color: theme.text.secondary }}>
                        {designer.bio}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {designer.projectTypes && designer.projectTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {designer.projectTypes.slice(0, 3).map((cat) => (
                          <span 
                            key={cat}
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ backgroundColor: theme.tagBg, color: theme.text.secondary }}
                          >
                            {cat}
                          </span>
                        ))}
                        {designer.projectTypes.length > 3 && (
                          <span 
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ backgroundColor: theme.tagBg, color: theme.text.muted }}
                          >
                            +{designer.projectTypes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Rejection Reason (if any) */}
                    {designer.rejectionReason && (
                      <div className="mt-3 p-3 rounded-xl" 
                        style={{ backgroundColor: theme.error + '10', border: `1px solid ${theme.error}20` }}>
                        <p className="text-xs font-medium mb-1" style={{ color: theme.error }}>Rejection Reason:</p>
                        <p className="text-sm" style={{ color: theme.text.secondary }}>{designer.rejectionReason}</p>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs" style={{ color: theme.text.muted }}>
                        Applied: {new Date(designer.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
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
            
            {/* Avatar Section */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 flex items-center justify-center" 
                style={{ 
                  borderColor: theme.accent,
                  backgroundColor: selectedDesigner.avatar ? 'transparent' : theme.nestedBg 
                }}>
                {selectedDesigner.avatar ? (
                  <img 
                    src={selectedDesigner.avatar} 
                    alt={`${selectedDesigner.firstName} ${selectedDesigner.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-4xl mb-1" style={{ color: theme.text.muted }}>
                      {selectedDesigner.firstName?.[0]?.toUpperCase()}{selectedDesigner.lastName?.[0]?.toUpperCase()}
                    </div>
                    <div className="text-xs text-center" style={{ color: theme.text.muted }}>
                      No Photo
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ color: theme.text.primary }}>Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Name</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {selectedDesigner.firstName} {selectedDesigner.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Email</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {selectedDesigner.email}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Phone</p>
                    <p className="transition-colors duration-300" style={{ color: selectedDesigner.phone ? theme.text.primary : theme.text.muted }}>
                      {selectedDesigner.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ color: theme.text.primary }}>Professional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Title</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {selectedDesigner.title}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Availability</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {selectedDesigner.availability ? (
                        selectedDesigner.availability === 'immediate' ? '⚡ Available Immediately' :
                        selectedDesigner.availability === '1-2weeks' ? '📅 1-2 weeks' :
                        selectedDesigner.availability === '2-4weeks' ? '📆 2-4 weeks' :
                        selectedDesigner.availability === '1-2months' ? '🗓️ 1+ months' :
                        selectedDesigner.availability === 'unavailable' ? '⏸️ Unavailable' :
                        selectedDesigner.availability
                      ) : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ color: theme.text.primary }}>Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>City</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {selectedDesigner.city || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Country</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {selectedDesigner.country || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: theme.text.muted }}>Bio</p>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.nestedBg }}>
                  <p className="transition-colors duration-300 whitespace-pre-wrap" style={{ color: selectedDesigner.bio ? theme.text.primary : theme.text.muted }}>
                    {selectedDesigner.bio || 'No bio provided'}
                  </p>
                </div>
                {selectedDesigner.bio && (
                  <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
                    {selectedDesigner.bio.length} characters
                  </p>
                )}
              </div>
              
              {/* Portfolio Images Section */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: theme.text.muted }}>Portfolio Samples</p>
                <div className="grid grid-cols-3 gap-4">
                  {selectedDesigner.portfolio_images && Array.isArray(selectedDesigner.portfolio_images) && selectedDesigner.portfolio_images.length > 0 ? (
                    selectedDesigner.portfolio_images.slice(0, 3).map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2" style={{ borderColor: theme.border }}>
                        {image && (image.startsWith('data:image') || image.startsWith('http')) ? (
                          <img 
                            src={image} 
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => {
                              const newWindow = window.open();
                              if (newWindow) {
                                newWindow.document.write(`<img src="${image}" style="max-width: 100%; height: auto;" />`);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.nestedBg }}>
                            <div className="text-center">
                              <div className="text-2xl mb-1" style={{ color: theme.text.muted }}>📷</div>
                              <div className="text-xs" style={{ color: theme.text.muted }}>No Image</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    [1, 2, 3].map((index) => (
                      <div key={index} className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center" 
                           style={{ borderColor: theme.border, backgroundColor: theme.nestedBg }}>
                        <div className="text-center">
                          <div className="text-2xl mb-1" style={{ color: theme.text.muted }}>📷</div>
                          <div className="text-xs" style={{ color: theme.text.muted }}>No Image</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {(!selectedDesigner.portfolio_images || !Array.isArray(selectedDesigner.portfolio_images) || selectedDesigner.portfolio_images.filter(Boolean).length === 0) && (
                  <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                    Portfolio images will appear here when uploaded by the designer.
                  </p>
                )}
              </div>
              
              {/* Portfolio Links */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ color: theme.text.primary }}>Portfolio Links</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Main Portfolio</p>
                    {selectedDesigner.portfolioUrl ? (
                      <a 
                        href={selectedDesigner.portfolioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="transition-colors duration-300 hover:opacity-80 flex items-center gap-2"
                        style={{ color: theme.accent }}
                      >
                        🌐 {selectedDesigner.portfolioUrl} <span style={{ color: theme.text.muted }}>↗</span>
                      </a>
                    ) : (
                      <p style={{ color: theme.text.muted }}>Not provided</p>
                    )}
                  </div>
                  
                  {(selectedDesigner.dribbbleUrl || selectedDesigner.behanceUrl || selectedDesigner.linkedinUrl) && (
                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: theme.text.muted }}>Additional Links</p>
                      <div className="space-y-2">
                        {selectedDesigner.dribbbleUrl && (
                          <a 
                            href={selectedDesigner.dribbbleUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block transition-colors duration-300 hover:opacity-80"
                            style={{ color: theme.accent }}
                          >
                            🎨 Dribbble: {selectedDesigner.dribbbleUrl} ↗
                          </a>
                        )}
                        
                        {selectedDesigner.behanceUrl && (
                          <a 
                            href={selectedDesigner.behanceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block transition-colors duration-300 hover:opacity-80"
                            style={{ color: theme.accent }}
                          >
                            🎯 Behance: {selectedDesigner.behanceUrl} ↗
                          </a>
                        )}
                        
                        {selectedDesigner.linkedinUrl && (
                          <a 
                            href={selectedDesigner.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block transition-colors duration-300 hover:opacity-80"
                            style={{ color: theme.accent }}
                          >
                            💼 LinkedIn: {selectedDesigner.linkedinUrl} ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!selectedDesigner.dribbbleUrl && !selectedDesigner.behanceUrl && !selectedDesigner.linkedinUrl && (
                    <p className="text-sm" style={{ color: theme.text.muted }}>
                      No additional portfolio links provided
                    </p>
                  )}
                </div>
              </div>
              
              
              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ color: theme.text.primary }}>Application Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Applied On</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {new Date(selectedDesigner.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  {selectedDesigner.updatedAt && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Last Updated</p>
                      <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                        {new Date(selectedDesigner.updatedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.muted }}>Status</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {selectedDesigner.isApproved ? '✅ Approved' : 
                       selectedDesigner.rejectionReason ? '❌ Rejected' : 
                       '⏳ Pending Review'}
                    </p>
                  </div>
                </div>
                
                {selectedDesigner.rejectionReason && (
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: theme.error + '10', border: `1px solid ${theme.error}20` }}>
                    <p className="text-sm font-medium mb-2" style={{ color: theme.error }}>Rejection Reason:</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {selectedDesigner.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
              
              {!selectedDesigner.isApproved && selectedDesigner.isVerified && (
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