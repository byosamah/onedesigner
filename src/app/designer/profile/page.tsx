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

      // If profile has a country, trigger city loading
      if (profile.country) {
        logger.info('Profile has country, loading cities for:', profile.country)
        const fetchCities = async () => {
          setLoadingCities(true)
          try {
            const citiesList = await getCitiesByCountry(profile.country)
            setCities(citiesList)
            logger.info(`Loaded ${citiesList.length} cities for ${profile.country}`)
          } catch (error) {
            logger.error('Failed to fetch cities for profile country:', error)
          } finally {
            setLoadingCities(false)
          }
        }
        fetchCities()
      }
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
      logger.info('Designer profile data:', {
        ...designerData,
        country: designerData.country,
        city: designerData.city,
        availability: designerData.availability,
        hasCountry: !!designerData.country,
        hasCity: !!designerData.city,
        hasAvailability: !!designerData.availability
      })
      
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
      // Convert to base64 for preview (don't save to database yet)
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Avatar = e.target?.result as string
        
        // Update form data with base64 for preview
        setFormData(prev => ({ ...prev, avatar_url: base64Avatar }))
        
        setIsUploadingAvatar(false)
      }
      
      reader.onerror = () => {
        setError('Failed to read avatar image')
        setIsUploadingAvatar(false)
      }
      
      reader.readAsDataURL(file)

    } catch (error) {
      logger.error('Avatar processing error:', error)
      setError(error instanceof Error ? error.message : 'Failed to process avatar')
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

  const uploadPendingAvatar = async (base64Avatar: string): Promise<string> => {
    try {
      // Convert base64 to File
      const response = await fetch(base64Avatar)
      const blob = await response.blob()
      const file = new File([blob], 'avatar.jpg', { type: blob.type })
      
      // Upload to server
      const formData = new FormData()
      formData.append('avatar', file)

      const uploadResponse = await fetch('/api/designer/avatar/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar')
      }

      const result = await uploadResponse.json()
      return result.avatarUrl
      
    } catch (error) {
      logger.error('Error uploading avatar:', error)
      setError('Failed to upload avatar')
      throw error
    }
  }

  const uploadPendingImages = async (images: (string | null)[]): Promise<(string | null)[]> => {
    // Prepare all upload promises
    const uploadPromises = images.map(async (image, i) => {
      // If not a base64 image, return as-is
      if (!image || !image.startsWith('data:image/')) {
        return image
      }

      try {
        // Convert base64 to File
        const response = await fetch(image)
        const blob = await response.blob()
        const file = new File([blob], `portfolio_${i + 1}.jpg`, { type: blob.type })

        // Upload to server
        const formData = new FormData()
        formData.append(`image${i + 1}`, file)

        const uploadResponse = await fetch('/api/designer/portfolio/images', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload portfolio image ${i + 1}`)
        }

        const result = await uploadResponse.json()
        // Use the first uploaded URL (since we're uploading one image at a time)
        return result.uploaded[0] || result.images[i] // Return uploaded URL

      } catch (error) {
        logger.error(`Error uploading portfolio image ${i + 1}:`, error)
        // Don't throw - return null for failed uploads to allow others to succeed
        return null
      }
    })

    // Upload all images in parallel
    const results = await Promise.all(uploadPromises)
    return results
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

      // Upload avatar and portfolio images in parallel for better performance
      const uploadPromises: Promise<any>[] = []

      // Prepare portfolio image upload
      const portfolioUploadPromise = uploadPendingImages(portfolioImages)
      uploadPromises.push(portfolioUploadPromise)

      // Prepare avatar upload if needed
      let avatarUploadPromise: Promise<string> | null = null
      if (cleanedData.avatar_url && cleanedData.avatar_url.startsWith('data:image/')) {
        avatarUploadPromise = uploadPendingAvatar(cleanedData.avatar_url)
        uploadPromises.push(avatarUploadPromise)
      }

      // Execute all uploads in parallel
      const uploadResults = await Promise.all(uploadPromises)

      // Apply results
      const uploadedPortfolioImages = uploadResults[0] as (string | null)[]
      cleanedData.tools = uploadedPortfolioImages.filter(Boolean)

      if (avatarUploadPromise) {
        cleanedData.avatar_url = uploadResults[uploadResults.length - 1] as string
      }
      
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
      
      // Check if this was a rejection recovery (designer was rejected and is now resubmitting)
      const wasRejected = profile?.rejection_reason && !profile?.is_approved
      
      if (wasRejected) {
        setSuccessMessage('Profile resubmitted! We\'ll review your updates within 48 hours.')
      } else if (needsReapproval) {
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
            
            {/* Edit/Save Button - Only allow editing for approved or rejected designers */}
            {!isEditing ? (
              <>
                {profile?.is_approved || profile?.rejection_reason ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: theme.accent, color: '#000' }}
                  >
                    {profile?.rejection_reason ? 'Address Feedback' : 'Edit Profile'}
                  </button>
                ) : (
                  <div className="px-6 py-2 rounded-xl font-medium" style={{ 
                    backgroundColor: theme.border + '40', 
                    color: theme.text.muted,
                    opacity: 0.7
                  }}>
                    Under Review - Editing Disabled
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    // Only reset form data if user wants to discard changes
                    if (confirm('Discard unsaved changes?')) {
                      setFormData(profile || {})
                      setPortfolioImages([
                        profile?.tools?.[0] || null,
                        profile?.tools?.[1] || null,
                        profile?.tools?.[2] || null
                      ])
                    } else {
                      return // Keep editing
                    }
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
                  className="px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  style={{
                    backgroundColor: isSaving ? theme.border : theme.success,
                    color: isSaving ? theme.text.secondary : '#fff',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving && (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  )}
                  {isSaving ? 'Saving...' :
                   profile?.rejection_reason && !profile?.is_approved ? 'Resubmit for Review' :
                   'Save Changes'}
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

        {/* Under Review Banner */}
        {!profile?.is_approved && !profile?.rejection_reason && (
          <div className="mb-6 p-6 rounded-xl text-center" style={{ 
            backgroundColor: theme.accent + '10', 
            border: `2px solid ${theme.accent}40` 
          }}>
            <div className="text-4xl mb-3">⏳</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Your Profile is Under Review
            </h3>
            <p className="text-base mb-3" style={{ color: theme.text.secondary }}>
              Our team is carefully reviewing your application. We'll notify you within 48 hours.
            </p>
            <p className="text-sm" style={{ color: theme.text.muted }}>
              Profile editing is temporarily disabled during the review process.
            </p>
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
                    autoSave={false}
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