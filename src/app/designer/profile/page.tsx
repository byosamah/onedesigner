'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { logger } from '@/lib/core/logging-service'
import { RejectionFeedbackModal } from '@/components/designer/RejectionFeedbackModal'

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
  transformDesignerApiToUI,
  transformDesignerUIToApi,
  cleanDesignerData,
  getChangedFields
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

  // Fetch designer profile on mount
  useEffect(() => {
    fetchDesignerProfile()
  }, [])

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
      
      // Transform API response to UI format using centralized transformer
      const transformedData = transformDesignerApiToUI(data.designer)
      logger.info('Transformed profile data:', transformedData)
      
      setProfile(transformedData)
      setFormData(transformedData)
      
      // Check if designer was rejected and hasn't seen feedback
      if (transformedData.status === 'rejected' && 
          transformedData.rejectionReason && 
          !transformedData.rejectionSeen) {
        setShowRejectionModal(true)
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
      
      // Clean and transform data for API
      const cleanedData = cleanDesignerData(formData)
      const apiData = transformDesignerUIToApi(cleanedData)
      
      // Check if reapproval is needed
      const needsReapproval = profile?.isApproved && 
        checkReapprovalNeeded(transformDesignerUIToApi(profile), apiData)
      
      const response = await fetch('/api/designer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      const updatedData = await response.json()
      
      // Transform response back to UI format
      const transformedData = transformDesignerApiToUI(updatedData.designer)
      setProfile(transformedData)
      setFormData(transformedData)
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
    const isDisabled = !isEditing && profile?.isApproved
    
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
            {profile?.status === 'approved' || profile?.isApproved ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                ✓ Approved
              </span>
            ) : profile?.status === 'rejected' ? (
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
        {profile?.status === 'rejected' && profile?.rejectionReason && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: theme.warning + '20', border: `2px solid ${theme.warning}` }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <strong style={{ color: theme.text.primary }}>Feedback from admin:</strong>
                <p style={{ color: theme.text.secondary, marginTop: '0.5rem' }}>
                  {profile.rejectionReason}
                </p>
                <p className="text-sm mt-2" style={{ color: theme.text.muted }}>
                  Please update your profile based on this feedback and save to resubmit for approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form Sections */}
        <div className="space-y-8">
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
          
          {/* Portfolio Links */}
          {fieldsByCategory.portfolio.length > 0 && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.cardBg }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.text.primary }}>
                Portfolio Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fieldsByCategory.portfolio.map(field => renderField(field))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Feedback Modal */}
      {showRejectionModal && profile?.rejectionReason && (
        <RejectionFeedbackModal
          rejectionReason={profile.rejectionReason}
          onClose={() => setShowRejectionModal(false)}
        />
      )}
    </main>
  )
}