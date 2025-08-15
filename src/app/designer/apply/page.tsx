'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingButton } from '@/components/forms'
import { useTheme } from '@/lib/hooks/useTheme'
import { logger } from '@/lib/core/logging-service'
import { getCountries, getCitiesByCountry, type Country } from '@/lib/api/location-api'

// Define the form data type locally to avoid server-side imports
interface DesignerFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  profilePicture?: string | null
  title: string
  portfolioUrl: string
  dribbbleUrl?: string | null
  behanceUrl?: string | null
  linkedinUrl?: string | null
  country: string
  city: string
  availability: 'immediate' | '1-2weeks' | '2-4weeks' | '1-2months' | 'unavailable'
  bio: string
  portfolioImages?: string[]
}

export default function DesignerApplyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { theme, isDarkMode, toggleTheme } = useTheme()

  const [formData, setFormData] = useState<Partial<DesignerFormData>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: '',
    title: '',
    portfolioUrl: '',
    dribbbleUrl: '',
    behanceUrl: '',
    linkedinUrl: '',
    country: '',
    city: '',
    availability: 'immediate',
    bio: '',
    portfolioImages: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMoreLinks, setShowMoreLinks] = useState(false)
  
  // Location API states
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  // Fetch countries on mount
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

  // Fetch cities when country changes
  useEffect(() => {
    if (formData.country) {
      const fetchCities = async () => {
        setLoadingCities(true)
        setCities([]) // Clear previous cities
        setFormData(prev => ({ ...prev, city: '' })) // Reset city selection
        
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

  useEffect(() => {
    setMounted(true)
    
    // Check if designer is authenticated and load existing data
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/designer/check')
        const data = await response.json()
        
        if (data.exists && data.designer?.email) {
          const designer = data.designer
          logger.info('✅ Designer authenticated:', designer.email)
          
          // Check designer status and redirect accordingly
          if (designer.is_approved) {
            logger.info('✅ Designer already approved, redirecting to dashboard')
            router.push('/designer/dashboard')
            return
          }
          
          // Check if application is complete but pending approval
          if (designer.first_name && designer.last_name && designer.portfolio_url && designer.title) {
            logger.info('⏳ Application pending approval, redirecting to pending page')
            router.push('/designer/application-pending')
            return
          }
          
          // Load existing data from the designer object
          if (designer) {
            setFormData({
              firstName: designer.first_name || '',
              lastName: designer.last_name || '',
              email: designer.email || '',
              phone: designer.phone || '',
              profilePicture: designer.avatar_url || '',
              title: designer.title || '',
              portfolioUrl: designer.portfolio_url || designer.website_url || '',
              dribbbleUrl: designer.dribbble_url || '',
              behanceUrl: designer.behance_url || '',
              linkedinUrl: designer.linkedin_url || '',
              country: designer.country || '',
              city: designer.city || '',
              availability: designer.availability || 'immediate',
              bio: designer.bio || '',
              portfolioImages: [
                designer.portfolio_image_1,
                designer.portfolio_image_2,
                designer.portfolio_image_3
              ].filter(Boolean)
            })
          } else {
            setFormData(prev => ({ ...prev, email: designer.email }))
          }
          
          setIsAuthenticated(true)
          setIsCheckingAuth(false)
        } else {
          logger.info('❌ Not authenticated, redirecting to signup')
          setTimeout(() => {
            router.push('/designer/signup')
          }, 100)
        }
      } catch (error) {
        logger.error('Auth check error:', error)
        setTimeout(() => {
          router.push('/designer/signup')
        }, 100)
      }
    }
    
    checkAuth()
  }, [router])

  const handleProfilePictureUpload = async (file: File | null) => {
    if (!file) return

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Image must be less than 5MB')
      return
    }

    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => ({ ...prev, profilePicture: base64String }))
    }
    reader.readAsDataURL(file)
  }

  const handlePortfolioImageUpload = async (index: number, file: File | null) => {
    if (!file) return

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Image must be less than 5MB')
      return
    }

    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => {
        const newImages = [...(prev.portfolioImages || [])]
        newImages[index] = base64String
        return { ...prev, portfolioImages: newImages }
      })
    }
    reader.readAsDataURL(file)
  }

  const removePortfolioImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.portfolioImages || [])]
      newImages.splice(index, 1)
      return { ...prev, portfolioImages: newImages }
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email?.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Profile picture is now required
    if (!formData.profilePicture) {
      newErrors.profilePicture = 'Profile picture or logo is required'
    }
    
    if (!formData.title?.trim()) newErrors.title = 'Professional title is required'
    if (!formData.portfolioUrl?.trim()) {
      newErrors.portfolioUrl = 'Portfolio/Website URL is required'
    } else {
      try {
        // Check if URL is valid (add https:// if missing for validation)
        const urlToValidate = formData.portfolioUrl.match(/^https?:\/\//i) 
          ? formData.portfolioUrl 
          : `https://${formData.portfolioUrl}`
        new URL(urlToValidate)
      } catch {
        newErrors.portfolioUrl = 'Please enter a valid URL'
      }
    }
    
    if (!formData.country?.trim()) newErrors.country = 'Country is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    
    // Updated bio validation: 500-1000 characters
    if (!formData.bio?.trim()) {
      newErrors.bio = 'Bio is required'
    } else if (formData.bio.trim().length < 500) {
      newErrors.bio = 'Bio must be at least 500 characters'
    } else if (formData.bio.trim().length > 1000) {
      newErrors.bio = 'Bio must be less than 1000 characters'
    }

    if (!formData.portfolioImages || formData.portfolioImages.length === 0) {
      newErrors.portfolioImages = 'Please upload at least one portfolio image'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsLoading(true)
    try {
      // Ensure URLs have protocol before sending
      const dataToSend = {
        ...formData,
        portfolioUrl: formData.portfolioUrl?.match(/^https?:\/\//i) 
          ? formData.portfolioUrl 
          : `https://${formData.portfolioUrl}`,
        dribbbleUrl: formData.dribbbleUrl && formData.dribbbleUrl.trim() 
          ? (formData.dribbbleUrl.match(/^https?:\/\//i) 
            ? formData.dribbbleUrl 
            : `https://${formData.dribbbleUrl}`)
          : '',
        behanceUrl: formData.behanceUrl && formData.behanceUrl.trim()
          ? (formData.behanceUrl.match(/^https?:\/\//i) 
            ? formData.behanceUrl 
            : `https://${formData.behanceUrl}`)
          : '',
        linkedinUrl: formData.linkedinUrl && formData.linkedinUrl.trim()
          ? (formData.linkedinUrl.match(/^https?:\/\//i) 
            ? formData.linkedinUrl 
            : `https://${formData.linkedinUrl}`)
          : '',
      }
      
      const response = await fetch('/api/designer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error('Submission error:', data)
        alert(data.error || 'Failed to submit application')
        throw new Error(data.error || 'Failed to submit application')
      }
      
      // Navigate to success page
      router.push('/designer/apply/success')
    } catch (error) {
      logger.error('Error submitting application:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚡</div>
          <p style={{ color: theme.text.secondary }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
          {/* Theme Toggle */}
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
      </nav>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Join Our Designer Network
          </h1>
          <p className="text-base sm:text-lg" style={{ color: theme.text.secondary }}>
            Get matched with clients looking for your unique expertise
          </p>
        </div>

        <div 
          className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border"
          style={{ 
            backgroundColor: theme.cardBg,
            borderColor: theme.border
          }}
        >
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: theme.text.primary }}>
                Basic Information
              </h2>
              
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      First Name <span style={{ color: theme.error }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: errors.firstName ? theme.error : theme.border,
                        '--tw-ring-color': theme.accent
                      } as any}
                      placeholder="John"
                      data-error={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p className="text-sm mt-1" style={{ color: theme.error }}>
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      Last Name <span style={{ color: theme.error }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: errors.lastName ? theme.error : theme.border,
                        '--tw-ring-color': theme.accent
                      } as any}
                      placeholder="Doe"
                      data-error={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p className="text-sm mt-1" style={{ color: theme.error }}>
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Profile Picture or Logo <span style={{ color: theme.error }}>*</span>
                  </label>
                  <p className="text-xs mb-4" style={{ color: theme.text.secondary }}>
                    Upload your professional photo or personal logo (max 5MB)
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <input
                        type="file"
                        id="profile-picture"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleProfilePictureUpload(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-picture"
                        className="block w-32 h-32 rounded-full border-2 border-dashed cursor-pointer hover:scale-105 transition-transform duration-300 overflow-hidden"
                        style={{
                          backgroundColor: theme.nestedBg,
                          borderColor: theme.border
                        }}
                      >
                        {formData.profilePicture ? (
                          <img
                            src={formData.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <span className="text-3xl mb-2">📷</span>
                            <span className="text-xs text-center px-2" style={{ color: theme.text.muted }}>
                              Click to upload
                            </span>
                          </div>
                        )}
                      </label>
                      {formData.profilePicture && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, profilePicture: '' })}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            backgroundColor: theme.error,
                            color: '#fff'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  {errors.profilePicture && (
                    <p className="text-sm mt-2" style={{ color: theme.error }}>
                      {errors.profilePicture}
                    </p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      Email <span style={{ color: theme.error }}>*</span>
                      <span className="ml-2 text-xs" style={{ color: theme.text.muted }}>(verified)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 opacity-75 cursor-not-allowed"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: theme.border
                      } as any}
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: theme.border,
                        '--tw-ring-color': theme.accent
                      } as any}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: theme.text.primary }}>
                Professional Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Professional Title <span style={{ color: theme.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: errors.title ? theme.error : theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="Senior Product Designer"
                    data-error={!!errors.title}
                  />
                  {errors.title && (
                    <p className="text-sm mt-1" style={{ color: theme.error }}>
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Portfolio/Website URL <span style={{ color: theme.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    onBlur={(e) => {
                      // Auto-add https:// if no protocol is provided
                      const value = e.target.value.trim()
                      if (value && !value.match(/^https?:\/\//i)) {
                        const newValue = `https://${value}`
                        setFormData({ ...formData, portfolioUrl: newValue })
                        // Update the input field value directly
                        e.currentTarget.value = newValue
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: errors.portfolioUrl ? theme.error : theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="yourportfolio.com or https://yourportfolio.com"
                    data-error={!!errors.portfolioUrl}
                  />
                  {errors.portfolioUrl && (
                    <p className="text-sm mt-1" style={{ color: theme.error }}>
                      {errors.portfolioUrl}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
                    You can enter with or without https:// - we'll add it automatically
                  </p>
                </div>

                {/* More Links Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowMoreLinks(!showMoreLinks)}
                    className="text-sm font-medium transition-colors duration-300 flex items-center gap-2"
                    style={{ color: theme.accent }}
                  >
                    {showMoreLinks ? '− Hide' : '+ Add'} More Links
                  </button>
                  
                  {showMoreLinks && (
                    <div className="mt-4 space-y-4 animate-slideUp">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                          Dribbble URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.dribbbleUrl || ''}
                          onChange={(e) => setFormData({ ...formData, dribbbleUrl: e.target.value })}
                          onBlur={(e) => {
                            const value = e.target.value.trim()
                            if (value && !value.match(/^https?:\/\//i)) {
                              const newValue = `https://${value}`
                              setFormData({ ...formData, dribbbleUrl: newValue })
                              e.currentTarget.value = newValue
                            }
                          }}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                          style={{ 
                            backgroundColor: theme.nestedBg, 
                            color: theme.text.primary,
                            borderColor: theme.border,
                            '--tw-ring-color': theme.accent
                          } as any}
                          placeholder="dribbble.com/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                          Behance URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.behanceUrl || ''}
                          onChange={(e) => setFormData({ ...formData, behanceUrl: e.target.value })}
                          onBlur={(e) => {
                            const value = e.target.value.trim()
                            if (value && !value.match(/^https?:\/\//i)) {
                              const newValue = `https://${value}`
                              setFormData({ ...formData, behanceUrl: newValue })
                              e.currentTarget.value = newValue
                            }
                          }}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                          style={{ 
                            backgroundColor: theme.nestedBg, 
                            color: theme.text.primary,
                            borderColor: theme.border,
                            '--tw-ring-color': theme.accent
                          } as any}
                          placeholder="behance.net/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                          LinkedIn URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.linkedinUrl || ''}
                          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                          onBlur={(e) => {
                            const value = e.target.value.trim()
                            if (value && !value.match(/^https?:\/\//i)) {
                              const newValue = `https://${value}`
                              setFormData({ ...formData, linkedinUrl: newValue })
                              e.currentTarget.value = newValue
                            }
                          }}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                          style={{ 
                            backgroundColor: theme.nestedBg, 
                            color: theme.text.primary,
                            borderColor: theme.border,
                            '--tw-ring-color': theme.accent
                          } as any}
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Availability Section */}
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: theme.text.primary }}>
                Location & Availability
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      Country <span style={{ color: theme.error }}>*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: errors.country ? theme.error : theme.border,
                        '--tw-ring-color': theme.accent
                      } as any}
                      data-error={!!errors.country}
                      disabled={loadingCountries}
                    >
                      <option value="">
                        {loadingCountries ? 'Loading countries...' : 'Select country'}
                      </option>
                      {countries.map((country) => (
                        <option key={country.iso2} value={country.country}>
                          {country.country}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-sm mt-1" style={{ color: theme.error }}>
                        {errors.country}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      City <span style={{ color: theme.error }}>*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: errors.city ? theme.error : theme.border,
                        '--tw-ring-color': theme.accent
                      } as any}
                      data-error={!!errors.city}
                      disabled={!formData.country || loadingCities}
                    >
                      <option value="">
                        {!formData.country 
                          ? 'Select country first' 
                          : loadingCities 
                          ? 'Loading cities...' 
                          : cities.length === 0 
                          ? 'No cities available' 
                          : 'Select city'}
                      </option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-sm mt-1" style={{ color: theme.error }}>
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                    Current Availability
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'immediate', label: 'Immediate', icon: '⚡' },
                      { value: '1-2weeks', label: '1-2 weeks', icon: '📅' },
                      { value: '2-4weeks', label: '2-4 weeks', icon: '📆' },
                      { value: '1-2months', label: '1+ months', icon: '🗓️' },
                      { value: 'unavailable', label: 'Unavailable', icon: '⏸️' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, availability: option.value as any })}
                        className="relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] text-center"
                        style={{
                          backgroundColor: formData.availability === option.value ? theme.nestedBg : theme.cardBg,
                          borderColor: formData.availability === option.value ? theme.accent : theme.border,
                          color: theme.text.primary
                        }}
                      >
                        <div className="text-xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Bio <span style={{ color: theme.error }}>*</span>
              </label>
              <p className="text-sm mb-3" style={{ color: theme.text.secondary }}>
                Help clients understand who you are and why you're the perfect designer for their project. Be detailed and comprehensive.
              </p>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: theme.nestedBg, 
                  color: theme.text.primary,
                  borderColor: errors.bio ? theme.error : theme.border,
                  '--tw-ring-color': theme.accent
                } as any}
                placeholder="I'm a passionate UI/UX designer with over 5 years of experience creating digital experiences that delight users and drive business results. My journey in design began with a fascination for how people interact with technology, which led me to specialize in creating intuitive and beautiful interfaces. I've worked with startups and established companies across various industries including fintech, healthcare, and e-commerce. My design philosophy centers on understanding user needs through research and testing, then translating those insights into elegant solutions. I believe that great design is not just about aesthetics, but about solving real problems and creating meaningful experiences. I'm skilled in design thinking methodologies, user research, wireframing, prototyping, and visual design. I use tools like Figma, Sketch, and Adobe Creative Suite to bring ideas to life. What sets me apart is my ability to balance business objectives with user needs, ensuring that every design decision contributes to both user satisfaction and company goals..."
                data-error={!!errors.bio}
              />
              {errors.bio && (
                <p className="text-sm mt-1" style={{ color: theme.error }}>
                  {errors.bio}
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                {formData.bio?.length || 0} / 1000 characters (minimum 500)
              </p>
            </div>

            {/* Portfolio Samples Section */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Portfolio Samples <span style={{ color: theme.error }}>*</span>
              </label>
              <p className="text-xs mb-4" style={{ color: theme.text.secondary }}>
                Upload up to 3 of your best work samples. These will be shown to potential clients.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="relative">
                    <input
                      type="file"
                      id={`portfolio-image-${index}`}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handlePortfolioImageUpload(index, e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`portfolio-image-${index}`}
                      className="block aspect-square rounded-xl border-2 border-dashed cursor-pointer hover:scale-105 transition-transform duration-300 overflow-hidden"
                      style={{
                        backgroundColor: theme.nestedBg,
                        borderColor: theme.border
                      }}
                    >
                      {formData.portfolioImages?.[index] ? (
                        <img
                          src={formData.portfolioImages[index]}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-2xl mb-2">📸</span>
                          <span className="text-xs text-center px-2" style={{ color: theme.text.muted }}>
                            Click to upload
                          </span>
                        </div>
                      )}
                    </label>
                    {formData.portfolioImages?.[index] && (
                      <button
                        type="button"
                        onClick={() => removePortfolioImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          backgroundColor: theme.error,
                          color: '#fff'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.portfolioImages && (
                <p className="text-sm mt-2" style={{ color: theme.error }}>
                  {errors.portfolioImages}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <LoadingButton
                onClick={handleSubmit}
                loading={isLoading}
                theme={theme}
                className="px-8 py-3 text-base font-medium"
                size="lg"
                variant="primary"
              >
                Submit Application
              </LoadingButton>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            Already applied?{' '}
            <Link
              href="/designer/login"
              className="font-medium transition-colors duration-300 hover:opacity-80"
              style={{ color: theme.accent }}
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}