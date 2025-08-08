'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { LoadingButton } from '@/components/shared'
import { DESIGN_CATEGORIES } from '@/lib/constants'

interface DesignerData {
  id: string
  firstName: string
  lastName: string
  email: string
  title?: string
  city?: string
  country?: string
  yearsExperience?: number
  designPhilosophy?: string
  primaryCategories?: string[]
  secondaryCategories?: string[]
  styleKeywords?: string[]
  portfolioProjects?: any[]
  preferredIndustries?: string[]
  preferredProjectSizes?: string[]
  expertTools?: string[]
  specialSkills?: string[]
  turnaroundTimes?: Record<string, number>
  revisionRoundsIncluded?: number
  collaborationStyle?: string
  currentAvailability?: string
  idealClientTypes?: string[]
  dreamProjectDescription?: string
  isApproved?: boolean
  isVerified?: boolean
  rating?: number
  totalProjects?: number
  createdAt?: string
}

interface EnhancedDesignerProfileProps {
  designer: DesignerData
  isDarkMode: boolean
  onApprove?: (designerId: string) => Promise<void>
  onReject?: (designerId: string) => Promise<void>
  portfolioImages?: Array<{
    id: string
    url: string
    title: string
    description: string
    category: string
  }>
}

export function EnhancedDesignerProfile({ 
  designer, 
  isDarkMode, 
  onApprove, 
  onReject,
  portfolioImages = []
}: EnhancedDesignerProfileProps) {
  const theme = getTheme(isDarkMode)
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const handleApprove = async () => {
    if (!onApprove) return
    setIsProcessing(true)
    try {
      await onApprove(designer.id)
    } catch (error) {
      console.error('Failed to approve designer:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsProcessing(true)
    try {
      await onReject(designer.id)
    } catch (error) {
      console.error('Failed to reject designer:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    return DESIGN_CATEGORIES[categoryId as keyof typeof DESIGN_CATEGORIES]?.name || categoryId
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <InfoCard title="Designer Profile" theme={theme}>
        <div className="flex items-start gap-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            {designer.firstName[0]}{designer.lastName[0]}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {designer.firstName} {designer.lastName}
              </h2>
              <p className="text-lg" style={{ color: theme.text.secondary }}>
                {designer.title || 'Designer'}
              </p>
              <p style={{ color: theme.text.muted }}>
                {designer.city && designer.country ? `${designer.city}, ${designer.country}` : 'Location not specified'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ApprovalBadge status={designer.isApproved} theme={theme} />
              <VerificationBadge status={designer.isVerified} theme={theme} />
              {designer.yearsExperience && (
                <span 
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: theme.nestedBg, color: theme.text.secondary }}
                >
                  {designer.yearsExperience}+ years experience
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!designer.isApproved && (
            <div className="flex gap-3">
              <LoadingButton
                onClick={handleApprove}
                loading={isProcessing}
                className="px-6 py-2 rounded-2xl font-medium"
                style={{ backgroundColor: theme.success, color: '#000' }}
              >
                Approve
              </LoadingButton>
              <LoadingButton
                onClick={handleReject}
                loading={isProcessing}
                className="px-6 py-2 rounded-2xl font-medium"
                style={{ 
                  backgroundColor: 'transparent',
                  border: `2px solid ${theme.error}`,
                  color: theme.error
                }}
              >
                Reject
              </LoadingButton>
            </div>
          )}
        </div>
      </InfoCard>

      {/* Design Philosophy */}
      {designer.designPhilosophy && (
        <InfoCard title="Design Philosophy" theme={theme}>
          <p className="text-lg italic" style={{ color: theme.text.secondary }}>
            "{designer.designPhilosophy}"
          </p>
        </InfoCard>
      )}

      {/* Categories & Specializations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Primary Categories" theme={theme}>
          <div className="space-y-2">
            {designer.primaryCategories?.map(categoryId => (
              <CategoryTag 
                key={categoryId} 
                category={getCategoryName(categoryId)} 
                theme={theme} 
                isPrimary 
              />
            )) || <p style={{ color: theme.text.muted }}>None specified</p>}
          </div>
        </InfoCard>
        
        <InfoCard title="Secondary Categories" theme={theme}>
          <div className="space-y-2">
            {designer.secondaryCategories?.map(categoryId => (
              <CategoryTag 
                key={categoryId} 
                category={getCategoryName(categoryId)} 
                theme={theme} 
              />
            )) || <p style={{ color: theme.text.muted }}>None specified</p>}
          </div>
        </InfoCard>
      </div>

      {/* Style & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Style Keywords" theme={theme}>
          <div className="flex flex-wrap gap-2">
            {designer.styleKeywords?.map(keyword => (
              <span 
                key={keyword}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
              >
                {keyword}
              </span>
            )) || <p style={{ color: theme.text.muted }}>None specified</p>}
          </div>
        </InfoCard>

        <InfoCard title="Expert Tools" theme={theme}>
          <div className="flex flex-wrap gap-2">
            {designer.expertTools?.map(tool => (
              <span 
                key={tool}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: theme.nestedBg, color: theme.text.secondary }}
              >
                {tool}
              </span>
            )) || <p style={{ color: theme.text.muted }}>None specified</p>}
          </div>
        </InfoCard>
      </div>

      {/* Portfolio */}
      <InfoCard title="Portfolio Images" theme={theme}>
        {portfolioImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolioImages.map((image, index) => (
              <div key={image.id} className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: theme.text.primary }}>
                    {image.title}
                  </h4>
                  {image.description && (
                    <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                      {image.description}
                    </p>
                  )}
                  {image.category && (
                    <span 
                      className="inline-block text-xs px-2 py-1 rounded-full mt-2"
                      style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
                    >
                      {image.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: theme.text.muted }}>No portfolio images uploaded</p>
        )}
      </InfoCard>

      {/* Working Preferences */}
      <InfoCard title="Working Preferences" theme={theme}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h5 className="font-medium mb-2" style={{ color: theme.text.primary }}>
              Collaboration Style
            </h5>
            <p style={{ color: theme.text.secondary }}>
              {designer.collaborationStyle || 'Not specified'}
            </p>
          </div>
          
          <div>
            <h5 className="font-medium mb-2" style={{ color: theme.text.primary }}>
              Revisions Included
            </h5>
            <p style={{ color: theme.text.secondary }}>
              {designer.revisionRoundsIncluded || 'Not specified'} rounds
            </p>
          </div>

          <div>
            <h5 className="font-medium mb-2" style={{ color: theme.text.primary }}>
              Current Availability
            </h5>
            <span 
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                designer.currentAvailability === 'available' ? 'bg-green-100 text-green-800' :
                designer.currentAvailability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {designer.currentAvailability || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Project Preferences */}
        <div className="mt-6 space-y-4">
          <div>
            <h5 className="font-medium mb-2" style={{ color: theme.text.primary }}>
              Preferred Industries
            </h5>
            <div className="flex flex-wrap gap-2">
              {designer.preferredIndustries?.map(industry => (
                <span 
                  key={industry}
                  className="px-2 py-1 rounded text-sm"
                  style={{ backgroundColor: theme.nestedBg, color: theme.text.secondary }}
                >
                  {industry}
                </span>
              )) || <p style={{ color: theme.text.muted }}>All industries</p>}
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2" style={{ color: theme.text.primary }}>
              Preferred Project Sizes
            </h5>
            <div className="flex gap-2">
              {designer.preferredProjectSizes?.map(size => (
                <span 
                  key={size}
                  className="px-3 py-1 rounded-full text-sm capitalize"
                  style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
                >
                  {size}
                </span>
              )) || <p style={{ color: theme.text.muted }}>All sizes</p>}
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Dream Project */}
      {designer.dreamProjectDescription && (
        <InfoCard title="Dream Project" theme={theme}>
          <p style={{ color: theme.text.secondary }}>
            {designer.dreamProjectDescription}
          </p>
        </InfoCard>
      )}

      {/* Contact Information */}
      <InfoCard title="Contact Information" theme={theme}>
        <div className="space-y-2">
          <p>
            <span className="font-medium" style={{ color: theme.text.primary }}>
              Email:
            </span>{' '}
            <span style={{ color: theme.text.secondary }}>
              {designer.email}
            </span>
          </p>
          <p>
            <span className="font-medium" style={{ color: theme.text.primary }}>
              Registered:
            </span>{' '}
            <span style={{ color: theme.text.secondary }}>
              {designer.createdAt ? new Date(designer.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </p>
        </div>
      </InfoCard>
    </div>
  )
}

// Helper Components
function InfoCard({ title, children, theme }: { title: string, children: React.ReactNode, theme: any }) {
  return (
    <div 
      className="p-6 rounded-3xl"
      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
    >
      <h3 className="font-bold text-lg mb-4" style={{ color: theme.text.primary }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function CategoryTag({ category, theme, isPrimary = false }: { category: string, theme: any, isPrimary?: boolean }) {
  return (
    <span 
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isPrimary ? 'border-2' : ''}`}
      style={{
        backgroundColor: isPrimary ? theme.accent + '20' : theme.nestedBg,
        color: isPrimary ? theme.accent : theme.text.secondary,
        borderColor: isPrimary ? theme.accent : 'transparent'
      }}
    >
      {category}
    </span>
  )
}

function ApprovalBadge({ status, theme }: { status?: boolean, theme: any }) {
  return (
    <span 
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {status ? '✓ Approved' : '⏳ Pending Approval'}
    </span>
  )
}

function VerificationBadge({ status, theme }: { status?: boolean, theme: any }) {
  return (
    <span 
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status ? '✓ Verified' : '○ Unverified'}
    </span>
  )
}