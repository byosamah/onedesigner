'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingButton } from '@/components/forms'
import { useTheme } from '@/lib/hooks/useTheme'
import { logger } from '@/lib/core/logging-service'

// Import centralized configuration
import { 
  DESIGNER_FIELDS,
  getFieldsForContext,
  getFieldsByCategory,
  validateField,
  type DesignerField
} from '@/lib/config/designer-fields'

import {
  transformDesignerUIToApi,
  cleanDesignerData,
  mergeWithDefaults
} from '@/lib/utils/designer-data-transformer'

export default function DesignerApplyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { theme, isDarkMode, toggleTheme } = useTheme()

  // Get application fields from centralized config
  const applicationFields = getFieldsForContext('application')
  
  // Initialize form data with defaults from field config
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {}
    applicationFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.key] = field.defaultValue
      } else {
        // Set appropriate empty values based on type
        switch (field.type) {
          case 'multiselect':
            initialData[field.key] = []
            break
          case 'checkbox':
            initialData[field.key] = false
            break
          case 'number':
            initialData[field.key] = 0
            break
          default:
            initialData[field.key] = ''
        }
      }
    })
    return initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)

  // Group fields by category for step-based form
  const fieldsByStep = {
    1: getFieldsByCategory('personal').filter(f => f.showInApplication),
    2: getFieldsByCategory('professional').filter(f => f.showInApplication),
    3: getFieldsByCategory('portfolio').filter(f => f.showInApplication),
    4: [...getFieldsByCategory('experience').filter(f => f.showInApplication),
        ...getFieldsByCategory('preferences').filter(f => f.showInApplication)]
  }

  const totalSteps = 4

  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/designer/check-auth')
      const data = await response.json()
      
      if (data.authenticated) {
        setIsAuthenticated(true)
        // Pre-fill email if available
        if (data.designer?.email) {
          setFormData(prev => ({ ...prev, email: data.designer.email }))
        }
      } else {
        // Redirect to signup if not authenticated
        router.push('/designer/signup')
      }
    } catch (error) {
      logger.error('Auth check failed:', error)
      router.push('/designer/signup')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }))
    
    // Clear validation error for this field
    if (errors[fieldKey]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[fieldKey]
        return next
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const stepFields = fieldsByStep[step as keyof typeof fieldsByStep] || []
    const stepErrors: Record<string, string> = {}
    let isValid = true

    stepFields.forEach(field => {
      const validation = validateField(field.key, formData[field.key])
      if (!validation.valid) {
        stepErrors[field.key] = validation.error || 'Invalid value'
        isValid = false
      }
    })

    setErrors(stepErrors)
    return isValid
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all steps
    let allValid = true
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        allValid = false
        setCurrentStep(i) // Go to first step with errors
        break
      }
    }

    if (!allValid) return

    setIsLoading(true)
    try {
      // Clean and transform data for API
      const cleanedData = cleanDesignerData(formData)
      const apiData = transformDesignerUIToApi(cleanedData)
      
      const response = await fetch('/api/designer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Redirect to success page
      router.push('/designer/apply/success')
    } catch (error) {
      logger.error('Application submission error:', error)
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to submit application' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (field: DesignerField) => {
    const value = formData[field.key] || ''
    const error = errors[field.key]
    
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
              disabled={field.key === 'email' && isAuthenticated} // Email is pre-filled
              placeholder={field.placeholder}
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`,
                opacity: field.key === 'email' && isAuthenticated ? 0.7 : 1
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
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 resize-none"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`
              }}
            />
            <div className="mt-1 flex justify-between">
              <div>
                {field.helpText && !error && (
                  <p className="text-xs" style={{ color: theme.text.muted }}>
                    {field.helpText}
                  </p>
                )}
                {error && (
                  <p className="text-xs" style={{ color: theme.error }}>
                    {error}
                  </p>
                )}
              </div>
              {field.validation?.minLength && (
                <p className="text-xs" style={{ 
                  color: value.length < field.validation.minLength ? theme.text.muted : theme.success 
                }}>
                  {value.length}/{field.validation.minLength} min
                </p>
              )}
            </div>
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
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`
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
              placeholder={field.placeholder}
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text.primary,
                border: `2px solid ${error ? theme.error : theme.border}`
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
      
      default:
        return null
    }
  }

  if (isCheckingAuth || !mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-5xl mb-6 animate-pulse">⚡</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Loading application...
          </h2>
        </div>
      </main>
    )
  }

  const currentStepFields = fieldsByStep[currentStep as keyof typeof fieldsByStep] || []

  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
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

      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
              Designer Application
            </h1>
            <span className="text-sm font-medium px-3 py-1 rounded-full" 
                  style={{ backgroundColor: theme.tagBg, color: theme.text.secondary }}>
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${(currentStep / totalSteps) * 100}%`,
                backgroundColor: theme.accent
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Render current step fields */}
          <div className="mb-8">
            {currentStepFields.map(field => renderField(field))}
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: theme.error + '20' }}>
              <p style={{ color: theme.error }}>{errors.submit}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  border: `2px solid ${theme.border}`,
                  color: theme.text.primary
                }}
              >
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                Next Step
              </button>
            ) : (
              <LoadingButton
                type="submit"
                loading={isLoading}
                className="ml-auto px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: theme.success, color: '#fff' }}
              >
                Submit Application
              </LoadingButton>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}