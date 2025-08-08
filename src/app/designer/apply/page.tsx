'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton, LoadingSpinner } from '@/components/forms'
import { DESIGN_STYLES, PROJECT_TYPES, INDUSTRIES } from '@/lib/constants'
import { useTheme } from '@/lib/hooks/useTheme'

export default function DesignerApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Step 2: Professional Info
    title: '',
    yearsExperience: '',
    websiteUrl: '',
    hourlyRate: '',
    
    // Step 3: Location & Availability
    city: '',
    country: '',
    timezone: '',
    availability: 'available',
    
    // Step 4: Style & Expertise
    styles: [] as string[],
    projectTypes: [] as string[],
    industries: [] as string[],
    bio: '',
  })

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleStyleToggle = (styleId: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(styleId)
        ? prev.styles.filter(s => s !== styleId)
        : [...prev.styles, styleId]
    }))
  }

  const handleProjectTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(typeId)
        ? prev.projectTypes.filter(t => t !== typeId)
        : [...prev.projectTypes, typeId]
    }))
  }

  const handleIndustryToggle = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/designer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Store email for verification
      sessionStorage.setItem('designerEmail', formData.email)
      
      // Navigate to verification page
      router.push('/designer/apply/verify')
    } catch (error) {
      console.error('Error submitting application:', error)
      // Handle error (show toast, etc)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Basic Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
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
          </>
        )

      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Professional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Professional Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Senior Product Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Years of Experience
                </label>
                <select
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                >
                  <option value="">Select experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Portfolio/Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Hourly Rate (USD)
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="150"
                />
              </div>
            </div>
          </>
        )

      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Location & Availability
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="United States"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="EST (UTC-5)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Current Availability
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'available', label: 'Available immediately' },
                    { value: '1-2weeks', label: 'Available in 1-2 weeks' },
                    { value: '2-4weeks', label: 'Available in 2-4 weeks' },
                    { value: 'unavailable', label: 'Not currently available' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={formData.availability === option.value}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-5 h-5 accent-current"
                        style={{ accentColor: theme.accent }}
                      />
                      <span style={{ color: theme.text.primary }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )

      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Style & Expertise
            </h2>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Design Styles (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DESIGN_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleToggle(style.id)}
                      className="px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.styles.includes(style.id) ? theme.accent : theme.nestedBg,
                        color: formData.styles.includes(style.id) ? '#000' : theme.text.primary,
                        borderColor: formData.styles.includes(style.id) ? theme.accent : theme.border
                      }}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Project Types (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleProjectTypeToggle(type.id)}
                      className="px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.projectTypes.includes(type.id) ? theme.accent : theme.nestedBg,
                        color: formData.projectTypes.includes(type.id) ? '#000' : theme.text.primary,
                        borderColor: formData.projectTypes.includes(type.id) ? theme.accent : theme.border
                      }}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Industries (Select up to 5)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => handleIndustryToggle(industry)}
                      disabled={formData.industries.length >= 5 && !formData.industries.includes(industry)}
                      className="px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 disabled:opacity-50"
                      style={{
                        backgroundColor: formData.industries.includes(industry) ? theme.accent : theme.nestedBg,
                        color: formData.industries.includes(industry) ? '#000' : theme.text.primary,
                        borderColor: formData.industries.includes(industry) ? theme.accent : theme.border
                      }}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Tell us about yourself and your design approach..."
                />
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation 
        theme={theme} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
      />
      
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Join Our Designer Network
          </h1>
          <p className="text-lg" style={{ color: theme.text.secondary }}>
            Get matched with clients looking for your unique expertise
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full mx-1 transition-all duration-300 ${
                  i === 1 ? 'ml-0' : ''
                } ${i === 4 ? 'mr-0' : ''}`}
                style={{
                  backgroundColor: i <= step ? theme.accent : theme.border
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            {['Basic Info', 'Professional', 'Location', 'Expertise'].map((label, i) => (
              <div 
                key={label} 
                className="text-xs"
                style={{ 
                  color: i + 1 <= step ? theme.text.primary : theme.text.muted,
                  fontWeight: i + 1 === step ? 600 : 400
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-8 rounded-3xl border"
          style={{ 
            backgroundColor: theme.cardBg,
            borderColor: theme.border
          }}
        >
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor: theme.nestedBg,
                  color: theme.text.primary,
                  borderColor: theme.border
                }}
              >
                Back
              </button>
            )}
            <LoadingButton
              onClick={handleNext}
              loading={isLoading}
              className="ml-auto px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              {step === 4 ? 'Submit Application' : 'Continue'}
            </LoadingButton>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            Already applied?{' '}
            <Link
              href="/designer/login"
              className="font-medium hover:underline"
              style={{ color: theme.accent }}
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}