'use client'

import { useState, useEffect } from 'react'
import { getTheme } from '@/lib/design-system'
import { EnhancedDesignerProfile } from '@/components/admin/EnhancedDesignerProfile'
import { LoadingSpinner } from '@/components/shared'

interface DesignerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  city: string
  country: string
  yearsExperience: number
  designPhilosophy: string
  primaryCategories: string[]
  secondaryCategories: string[]
  styleKeywords: string[]
  preferredIndustries: string[]
  preferredProjectSizes: string[]
  expertTools: string[]
  specialSkills: string[]
  turnaroundTimes: Record<string, number>
  revisionRoundsIncluded: number
  collaborationStyle: string
  currentAvailability: string
  idealClientTypes: string[]
  dreamProjectDescription: string
  portfolioLink: string
  isApproved: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface PortfolioImage {
  id: string
  url: string
  title: string
  description: string
  category: string
  displayOrder: number
  createdAt: string
}

export default function EnhancedDesignerProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [profile, setProfile] = useState<DesignerProfile | null>(null)
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    fetchDesignerProfile()
  }, [])

  const fetchDesignerProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/designer/profile/enhanced', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.designer)
      setPortfolioImages(data.portfolioImages || [])

      console.log('✅ Enhanced profile loaded')

    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (updatedData: Partial<DesignerProfile>) => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch('/api/designer/profile/enhanced', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }

      const data = await response.json()
      setProfile(prev => prev ? { ...prev, ...data.designer } : null)
      setSuccessMessage('Profile updated successfully!')

      console.log('✅ Profile updated successfully')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePortfolioUpload = async (formData: FormData) => {
    try {
      setError(null)

      const response = await fetch('/api/designer/portfolio/upload', {
        method: 'POST',
        body: formData, // Don't set Content-Type for FormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload portfolio')
      }

      const data = await response.json()
      setPortfolioImages(prev => [...prev, ...data.images])
      setSuccessMessage(`Successfully uploaded ${data.images.length} portfolio images!`)

      console.log('✅ Portfolio uploaded successfully')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (error) {
      console.error('Error uploading portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload portfolio')
    }
  }

  const handlePortfolioDelete = async (imageId: string) => {
    try {
      setError(null)

      const response = await fetch('/api/designer/portfolio/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete image')
      }

      setPortfolioImages(prev => prev.filter(img => img.id !== imageId))
      setSuccessMessage('Portfolio image deleted successfully!')

      console.log('✅ Portfolio image deleted')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (error) {
      console.error('Error deleting portfolio image:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete image')
    }
  }

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p 
            className="mt-4 text-lg animate-pulse"
            style={{ color: theme.text.secondary }}
          >
            Loading your enhanced profile...
          </p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="text-center max-w-md">
          <div 
            className="text-6xl mb-4"
            style={{ color: theme.error }}
          >
            ⚠️
          </div>
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: theme.text.primary }}
          >
            Unable to Load Profile
          </h2>
          <p 
            className="mb-6"
            style={{ color: theme.text.secondary }}
          >
            {error}
          </p>
          <button
            onClick={() => fetchDesignerProfile()}
            className="px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.svg" 
              alt="OneDesigner" 
              className="w-8 h-8"
            />
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Enhanced Profile
              </h1>
              <p 
                className="text-sm"
                style={{ color: theme.text.muted }}
              >
                Manage your detailed designer profile and portfolio
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-2xl transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: theme.nestedBg,
              border: `2px solid ${theme.border}`,
              color: theme.text.primary
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div 
            className="mb-6 p-4 rounded-2xl animate-slideUp"
            style={{
              backgroundColor: theme.success + '20',
              border: `2px solid ${theme.success}`,
              color: theme.success
            }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">✅</span>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div 
            className="mb-6 p-4 rounded-2xl animate-slideUp"
            style={{
              backgroundColor: theme.error + '20',
              border: `2px solid ${theme.error}`,
              color: theme.error
            }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Enhanced Profile Form */}
        {profile && (
          <EnhancedDesignerProfile
            designer={profile}
            portfolioImages={portfolioImages}
            isDarkMode={isDarkMode}
            onUpdate={handleProfileUpdate}
            onPortfolioUpload={handlePortfolioUpload}
            onPortfolioDelete={handlePortfolioDelete}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  )
}