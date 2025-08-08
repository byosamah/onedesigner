'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { LoadingButton } from '@/components/shared'
import { DESIGN_CATEGORIES } from '@/lib/constants'

interface Designer {
  id: string
  firstName: string
  lastName: string
  email: string
  title?: string
  city?: string
  country?: string
  primaryCategories?: string[]
  isApproved?: boolean
  isVerified?: boolean
  createdAt?: string
}

interface DesignersListProps {
  designers: Designer[]
  isDarkMode: boolean
  onViewProfile: (designerId: string) => void
  onApprove?: (designerId: string) => Promise<void>
  onReject?: (designerId: string) => Promise<void>
  loading?: boolean
}

export function DesignersList({ 
  designers, 
  isDarkMode, 
  onViewProfile, 
  onApprove, 
  onReject,
  loading = false 
}: DesignersListProps) {
  const theme = getTheme(isDarkMode)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const filteredDesigners = designers.filter(designer => {
    if (filter === 'pending') return !designer.isApproved
    if (filter === 'approved') return designer.isApproved
    return true
  })

  const handleApprove = async (designerId: string) => {
    if (!onApprove) return
    
    setProcessingIds(prev => new Set([...prev, designerId]))
    try {
      await onApprove(designerId)
    } catch (error) {
      console.error('Failed to approve designer:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(designerId)
        return newSet
      })
    }
  }

  const handleReject = async (designerId: string) => {
    if (!onReject) return
    
    setProcessingIds(prev => new Set([...prev, designerId]))
    try {
      await onReject(designerId)
    } catch (error) {
      console.error('Failed to reject designer:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(designerId)
        return newSet
      })
    }
  }

  const getCategoryName = (categoryId: string) => {
    return DESIGN_CATEGORIES[categoryId as keyof typeof DESIGN_CATEGORIES]?.name || categoryId
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="p-6 rounded-3xl animate-pulse"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: theme.border }}
              />
              <div className="flex-1 space-y-2">
                <div 
                  className="h-4 rounded w-32"
                  style={{ backgroundColor: theme.border }}
                />
                <div 
                  className="h-3 rounded w-48"
                  style={{ backgroundColor: theme.border }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3">
        {(['all', 'pending', 'approved'] as const).map(filterOption => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 capitalize ${
              filter === filterOption ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
            style={{
              backgroundColor: filter === filterOption ? theme.accent : 'transparent',
              color: filter === filterOption ? '#000' : theme.text.secondary,
              border: `2px solid ${filter === filterOption ? theme.accent : theme.border}`
            }}
          >
            {filterOption} ({
              filterOption === 'all' ? designers.length :
              filterOption === 'pending' ? designers.filter(d => !d.isApproved).length :
              designers.filter(d => d.isApproved).length
            })
          </button>
        ))}
      </div>

      {/* Designers List */}
      <div className="space-y-4">
        {filteredDesigners.length === 0 ? (
          <div 
            className="text-center py-12 rounded-3xl"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
          >
            <p className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
              No designers found
            </p>
            <p style={{ color: theme.text.secondary }}>
              {filter === 'pending' ? 'No designers pending approval' : 
               filter === 'approved' ? 'No approved designers yet' : 
               'No designers have registered yet'}
            </p>
          </div>
        ) : (
          filteredDesigners.map(designer => (
            <DesignerCard
              key={designer.id}
              designer={designer}
              theme={theme}
              onViewProfile={() => onViewProfile(designer.id)}
              onApprove={() => handleApprove(designer.id)}
              onReject={() => handleReject(designer.id)}
              isProcessing={processingIds.has(designer.id)}
              getCategoryName={getCategoryName}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div 
        className="p-4 rounded-2xl text-center"
        style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}
      >
        <p className="text-sm" style={{ color: theme.text.secondary }}>
          Total: {designers.length} designers • 
          Approved: {designers.filter(d => d.isApproved).length} • 
          Pending: {designers.filter(d => !d.isApproved).length}
        </p>
      </div>
    </div>
  )
}

interface DesignerCardProps {
  designer: Designer
  theme: any
  onViewProfile: () => void
  onApprove: () => Promise<void>
  onReject: () => Promise<void>
  isProcessing: boolean
  getCategoryName: (id: string) => string
}

function DesignerCard({ 
  designer, 
  theme, 
  onViewProfile, 
  onApprove, 
  onReject, 
  isProcessing,
  getCategoryName 
}: DesignerCardProps) {
  return (
    <div 
      className="p-6 rounded-3xl hover:scale-[1.01] transition-all duration-300"
      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            {designer.firstName[0]}{designer.lastName[0]}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-lg" style={{ color: theme.text.primary }}>
                {designer.firstName} {designer.lastName}
              </h3>
              <StatusBadge isApproved={designer.isApproved} theme={theme} />
            </div>
            
            <p className="mb-2" style={{ color: theme.text.secondary }}>
              {designer.title || 'Designer'} • {designer.city && designer.country ? `${designer.city}, ${designer.country}` : 'Location not specified'}
            </p>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {designer.primaryCategories?.slice(0, 3).map(categoryId => (
                <span 
                  key={categoryId}
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
                >
                  {getCategoryName(categoryId)}
                </span>
              ))}
              {designer.primaryCategories && designer.primaryCategories.length > 3 && (
                <span 
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: theme.nestedBg, color: theme.text.muted }}
                >
                  +{designer.primaryCategories.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Registration Date */}
          <div className="text-right mr-4">
            <p className="text-xs" style={{ color: theme.text.muted }}>
              Registered
            </p>
            <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
              {designer.createdAt ? new Date(designer.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onViewProfile}
              className="px-4 py-2 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${theme.border}`,
                color: theme.text.secondary
              }}
            >
              View Profile
            </button>

            {!designer.isApproved && (
              <>
                <LoadingButton
                  onClick={onApprove}
                  loading={isProcessing}
                  className="px-4 py-2 rounded-2xl font-medium"
                  style={{ backgroundColor: theme.success, color: '#000' }}
                >
                  Approve
                </LoadingButton>
                <LoadingButton
                  onClick={onReject}
                  loading={isProcessing}
                  className="px-4 py-2 rounded-2xl font-medium"
                  style={{ 
                    backgroundColor: 'transparent',
                    border: `2px solid ${theme.error}`,
                    color: theme.error
                  }}
                >
                  Reject
                </LoadingButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ isApproved, theme }: { isApproved?: boolean, theme: any }) {
  return (
    <span 
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {isApproved ? '✓ Approved' : '⏳ Pending'}
    </span>
  )
}