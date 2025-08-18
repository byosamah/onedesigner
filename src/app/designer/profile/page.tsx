'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { logger } from '@/lib/core/logging-service'
import { RejectionFeedbackModal } from '@/components/designer/RejectionFeedbackModal'
import { PortfolioImageUpload } from '@/components/forms/PortfolioImageUpload'

// Import location API for dynamic country/city loading
import { getCountries, getCitiesByCountry, type Country } from '@/lib/api/location-api'

// Import centralized configuration
import { 
  DESIGNER_FIELDS,
  getFieldsForContext,
  getFieldsByCategory,
  validateField,
  getEditableFields,
  checkReapprovalNeeded,
  type DesignerField,
  type FieldCategory
} from '@/lib/config/designer-fields'

import {
  cleanDesignerData
} from '@/lib/utils/designer-data-transformer'

export default function DesignerProfilePage() {
  const router = useRouter()
  const { theme, isDarkMode, toggleTheme } = useTheme()
  
  // State management
  const [profile, setProfile] = useState<Record<string, any> | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [autoEditOnRejection, setAutoEditOnRejection] = useState(false)
  
  // Location API states (same as application form)
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  // Portfolio images state
  const [portfolioImages, setPortfolioImages] = useState<(string | null)[]>([null, null, null])
  
  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarFileInputRef = useRef<HTMLInputElement>(null)

  // Get fields for profile context
  const profileFields = getFieldsForContext('profile')
  
  // Group fields by category for organized display
  const fieldsByCategory = {
    personal: getFieldsByCategory('personal').filter(f => f.showInProfile),
    professional: getFieldsByCategory('professional').filter(f => f.showInProfile),
    portfolio: getFieldsByCategory('portfolio').filter(f => f.showInProfile),
    experience: getFieldsByCategory('experience').filter(f => f.showInProfile),
    preferences: getFieldsByCategory('preferences').filter(f => f.showInProfile)
  }

  // Load countries on mount (same as application form)
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true)
      try {
        const countriesList = await getCountries()
        setCountries(countriesList)
      } catch (error) {
        logger.error('Failed to fetch countries:', error)
      } finally {
        setLoadingCountries(false)
      }
    }
    
    fetchCountries()
  }, [])

  // Load cities when country changes (same as application form)
  useEffect(() => {
    if (formData.country) {
      const fetchCities = async () => {
        setLoadingCities(true)
        setCities([]) // Clear previous cities
        
        try {
          const citiesList = await getCitiesByCountry(formData.country)
          setCities(citiesList)
        } catch (error) {
          logger.error('Failed to fetch cities:', error)
        } finally {
          setLoadingCities(false)
        }
      }
      
      fetchCities()
    } else {
      setCities([])
    }
  }, [formData.country])

  // Fetch designer profile on mount
  useEffect(() => {
    fetchDesignerProfile()
  }, [])

  // Reset form data when profile changes (prevents stale form state)
  useEffect(() => {
    if (profile) {
      setFormData(profile)
      // Reset edit mode when profile is freshly loaded
      setIsEditing(false)
      setValidationErrors({})
    }
  }, [profile?.id, profile?.updated_at]) // Re-run when profile ID or last update changes

  const fetchDesignerProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/designer/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/designer/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      logger.info('Profile API response:', data)
      
      // Don't transform to camelCase - keep snake_case for form fields
      // The fields use snake_case keys (first_name, not firstName)
      const designerData = data.designer
      logger.info('Designer profile data:', designerData)
      
      // Extract portfolio images from tools array
      const currentPortfolioImages: (string | null)[] = [null, null, null]
      if (Array.isArray(designerData.tools) && designerData.tools.length > 0) {
        designerData.portfolio_image_1 = designerData.tools[0] || null
        designerData.portfolio_image_2 = designerData.tools[1] || null
        designerData.portfolio_image_3 = designerData.tools[2] || null
        
        // Set portfolio images state for the upload component
        currentPortfolioImages[0] = designerData.tools[0] || null
        currentPortfolioImages[1] = designerData.tools[1] || null
        currentPortfolioImages[2] = designerData.tools[2] || null
      }
      
      setProfile(designerData)
      setFormData(designerData)
      setPortfolioImages(currentPortfolioImages)
      
      // Check if designer was rejected and hasn't seen feedback
      const status = designerData.is_approved === false && designerData.rejection_reason ? 'rejected' : 
                     designerData.is_approved ? 'approved' : 'pending'
      
      if (status === 'rejected' && 
          designerData.rejection_reason && 
          !designerData.rejection_seen) {
        setShowRejectionModal(true)
        setAutoEditOnRejection(true) // Will enable edit mode after modal closes
        markRejectionAsSeen()
      }
      
    } catch (error) {
      logger.error('Profile fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const markRejectionAsSeen = async () => {
    try {
      await fetch('/api/designer/rejection-seen', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      logger.error('Error marking rejection as seen:', error)
    }
  }

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[fieldKey]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[fieldKey]
        return next
      })
    }
  }

  const handleAvatarUpload = async (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    // Validate file size
    if (file.size > maxSize) {
      setError('Avatar image must be less than 10MB')
      return
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError('Avatar must be JPEG, PNG, or WebP format')
      return
    }

    setIsUploadingAvatar(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/designer/avatar/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Avatar upload failed')
      }

      const result = await response.json()
      
      // Update form data and profile with new avatar URL
      const newAvatarUrl = result.avatarUrl
      setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }))
      setProfile(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : null)
      
      setSuccessMessage('Avatar updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (error) {
      logger.error('Avatar upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    let isValid = true

    profileFields.forEach(field => {
      if (isEditing || !profile?.isApproved) {
        const validation = validateField(field.key, formData[field.key])
        if (!validation.valid) {
          errors[field.key] = validation.error || 'Invalid value'
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSave = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      
      // Data is already in snake_case, no need to transform
      const cleanedData = cleanDesignerData(formData)
      
      // Handle portfolio images - store in tools array
      // Use the portfolio images state which gets updated by the upload component
      cleanedData.tools = portfolioImages.filter(Boolean)
      
      // Check if reapproval is needed
      const needsReapproval = profile?.is_approved && 
        checkReapprovalNeeded(profile, cleanedData)
      
      const response = await fetch('/api/designer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cleanedData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      const updatedData = await response.json()
      
      // Keep data in snake_case format and update portfolio images state
      const updatedDesigner = updatedData.designer
      setProfile(updatedDesigner)
      setFormData(updatedDesigner)
      
      // Update portfolio images state from the saved tools array
      const updatedPortfolioImages: (string | null)[] = [null, null, null]
      if (Array.isArray(updatedDesigner.tools)) {
        updatedPortfolioImages[0] = updatedDesigner.tools[0] || null
        updatedPortfolioImages[1] = updatedDesigner.tools[1] || null
        updatedPortfolioImages[2] = updatedDesigner.tools[2] || null
      }
      setPortfolioImages(updatedPortfolioImages)
      
      setIsEditing(false)
      
      if (needsReapproval) {
        setSuccessMessage('Profile updated! Your changes will be reviewed by our team.')
      } else {
        setSuccessMessage('Profile updated successfully!')
      }
      
      setTimeout(() => setSuccessMessage(null), 5000)
      
    } catch (error) {
      logger.error('Save error:', error)
      setError(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const renderField = (field: DesignerField) => {
    const value = formData[field.key] || ''
    const error = validationErrors[field.key]
    const isDisabled = !isEditing
    
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.key} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
              {field.label}
              {field.validation?.required && <span style={{ color: theme.error }}> *</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={isDisabled || field.key === 'email'} // Email never editable
              placeholder={field.placeholder}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`,
                opacity: isDisabled ? 0.7 : 1
              }}
            />
            {field.helpText && !error && (
              <p className="mt-1 text-xs" style={{ color: theme.text.muted }}>
                {field.helpText}
              </p>
            )}
            {error && (
              <p className="mt-1 text-xs" style={{ color: theme.error }}>
                {error}
              </p>
            )}
          </div>
        )
      
      case 'textarea':
        return (
          <div key={field.key} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
              {field.label}
              {field.validation?.required && <span style={{ color: theme.error }}> *</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={isDisabled}
              placeholder={field.placeholder}
              rows={4}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 resize-none"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`,
                opacity: isDisabled ? 0.7 : 1
              }}
            />
            {field.helpText && !error && (
              <p className="mt-1 text-xs" style={{ color: theme.text.muted }}>
                {field.helpText}
              </p>
            )}
            {error && (
              <p className="mt-1 text-xs" style={{ color: theme.error }}>
                {error}
              </p>
            )}
          </div>
        )
      
      case 'select':
        // Special handling for country and city fields (dynamic data)
        if (field.key === 'country') {
          return (
            <div key={field.key} className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                {field.label}
                {field.validation?.required && <span style={{ color: theme.error }}> *</span>}
              </label>
              <select
                value={value}
                onChange={(e) => {
                  handleFieldChange(field.key, e.target.value)
                  // Clear city when country changes
                  if (formData.city) {
                    handleFieldChange('city', '')
                  }
                }}
                disabled={isDisabled || loadingCountries}
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: theme.cardBg,
                  color: theme.text.primary,
                  border: `2px solid ${error ? theme.error : theme.border}`,
                  opacity: isDisabled ? 0.7 : 1
                }}
              >
                <option value="">{loadingCountries ? 'Loading countries...' : 'Select your country'}</option>
                {countries.map(country => (
                  <option key={country.country} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-1 text-xs" style={{ color: theme.error }}>
                  {error}
                </p>
              )}
            </div>
          )
        }
        
        if (field.key === 'city') {
          return (
            <div key={field.key} className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                {field.label}
                {field.validation?.required && <span style={{ color: theme.error }}> *</span>}
              </label>
              <select
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                disabled={isDisabled || !formData.country || loadingCities}
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: theme.cardBg,
                  color: theme.text.primary,
                  border: `2px solid ${error ? theme.error : theme.border}`,
                  opacity: isDisabled || !formData.country ? 0.7 : 1
                }}
              >
                <option value="">
                  {!formData.country ? 'Select country first' : 
                   loadingCities ? 'Loading cities...' : 
                   'Select your city'}
                </option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-1 text-xs" style={{ color: theme.error }}>
                  {error}
                </p>
              )}
            </div>
          )
        }
        
        // Default select field (for other non-location fields)
        return (
          <div key={field.key} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
              {field.label}
              {field.validation?.required && <span style={{ color: theme.error }}> *</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={isDisabled}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`,
                opacity: isDisabled ? 0.7 : 1
              }}
            >
              <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-1 text-xs" style={{ color: theme.error }}>
                {error}
              </p>
            )}
          </div>
        )
      
      case 'url':
        return (
          <div key={field.key} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
              {field.label}
              {field.validation?.required && <span style={{ color: theme.error }}> *</span>}
            </label>
            <input
              type="url"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={isDisabled}
              placeholder={field.placeholder}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`,
                opacity: isDisabled ? 0.7 : 1
              }}
            />
            {error && (
              <p className="mt-1 text-xs" style={{ color: theme.error }}>
                {error}
              </p>
            )}
          </div>
        )
        
      case 'image':
        // Only handle avatar_url - portfolio images are handled by PortfolioImageUpload component
        if (field.key === 'avatar_url') {
          return (
            <div key={field.key} className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                {field.label}
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {value ? (
                    <img 
                      src={value} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                      style={{ border: `2px solid ${theme.border}` }}
                    />
                  ) : (
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ 
                        backgroundColor: theme.tagBg, 
                        color: theme.text.secondary,
                        border: `2px solid ${theme.border}` 
                      }}
                    >
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </div>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin text-2xl">⚡</div>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: isUploadingAvatar ? theme.border : theme.accent,
                        color: isUploadingAvatar ? theme.text.muted : '#000',
                        border: `2px solid ${isUploadingAvatar ? theme.border : theme.accent}`,
                        cursor: isUploadingAvatar ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                    </button>
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleAvatarUpload(file)
                        }
                      }}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>
          )
        } else {
          // Portfolio images are handled by PortfolioImageUpload component, skip rendering here
          return null
        }
      
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-5xl mb-6 animate-pulse">⚡</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Loading your profile...
          </h2>
        </div>
      </main>
    )
  }

  if (error && !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Error Loading Profile
          </h2>
          <p className="mb-6" style={{ color: theme.text.secondary }}>
            {error}
          </p>
          <button
            onClick={() => fetchDesignerProfile()}
            className="px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/designer/dashboard" className="flex items-center gap-2 text-xl font-bold" style={{ color: theme.text.primary }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
              </svg>
              OneDesigner
            </Link>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: theme.tagBg, color: theme.text.secondary }}>
              Designer Profile
            </span>
          </div>
          
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors duration-300"
            style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
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
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header with status and actions */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text.primary }}>
              My Profile
            </h1>
            <p className="text-base" style={{ color: theme.text.secondary }}>
              Manage your designer profile and portfolio
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status Badge */}
            {profile?.is_approved ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                ✓ Approved
              </span>
            ) : profile?.rejection_reason ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.error + '20', color: theme.error }}>
                ❌ Rejected
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                ⏳ Under Review
              </span>
            )}
            
            {/* Edit/Save Button */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(profile || {})
                    setValidationErrors({})
                  }}
                  className="px-6 py-2 rounded-xl font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: theme.success, color: '#fff' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: theme.success + '20' }}>
            <span className="text-2xl">✅</span>
            <span style={{ color: theme.success }}>{successMessage}</span>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: theme.error + '20' }}>
            <span className="text-2xl">⚠️</span>
            <span style={{ color: theme.error }}>{error}</span>
          </div>
        )}
        
        {/* Rejection Banner */}
        {profile?.rejection_reason && !profile?.is_approved && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: theme.warning + '20', border: `2px solid ${theme.warning}` }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <strong style={{ color: theme.text.primary }}>Feedback from admin:</strong>
                <p style={{ color: theme.text.secondary, marginTop: '0.5rem' }}>
                  {profile.rejection_reason}
                </p>
                <p className="text-sm mt-2" style={{ color: theme.text.muted }}>
                  Please update your profile based on this feedback and save to resubmit for approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form Sections */}
        <div className="space-y-8" key={profile?.id || 'no-profile'}>
          {/* Personal Information */}
          {fieldsByCategory.personal.length > 0 && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.cardBg }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.text.primary }}>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fieldsByCategory.personal.map(field => renderField(field))}
              </div>
            </div>
          )}
          
          {/* Professional Information */}
          {fieldsByCategory.professional.length > 0 && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.cardBg }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.text.primary }}>
                Professional Information
              </h2>
              {fieldsByCategory.professional.map(field => renderField(field))}
            </div>
          )}
          
          {/* Portfolio */}
          {fieldsByCategory.portfolio.length > 0 && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.cardBg }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.text.primary }}>
                Portfolio
              </h2>
              <div className="space-y-6">
                {/* Portfolio images using PortfolioImageUpload component */}
                <div>
                  <PortfolioImageUpload
                    isDarkMode={isDarkMode}
                    images={portfolioImages}
                    onImagesChange={setPortfolioImages}
                    disabled={!isEditing}
                  />
                </div>
                
                {/* Portfolio links in a grid */}
                {fieldsByCategory.portfolio
                  .filter(field => !field.key.startsWith('portfolio_image'))
                  .length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                      Portfolio Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {fieldsByCategory.portfolio
                        .filter(field => !field.key.startsWith('portfolio_image'))
                        .map(field => renderField(field))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Feedback Modal */}
      {showRejectionModal && profile?.rejection_reason && (
        <RejectionFeedbackModal
          rejectionReason={profile.rejection_reason}
          onClose={() => {
            setShowRejectionModal(false)
            // Automatically enable edit mode when closing rejection modal
            if (autoEditOnRejection) {
              setIsEditing(true)
              setAutoEditOnRejection(false)
            }
          }}
        />
      )}
    </main>
  )
}