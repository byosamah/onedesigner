'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { DESIGN_STYLES, PROJECT_TYPES, INDUSTRIES } from '@/lib/constants'
import { getTheme } from '@/lib/design-system'

export default function DesignerApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

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
        alert(data.error || 'Failed to submit application')
        setIsLoading(false)
        return
      }

      // Store application data for verification
      sessionStorage.setItem('designerApplication', JSON.stringify(data.applicationData))
      sessionStorage.setItem('designerEmail', formData.email)
      
      // Redirect to verification page
      router.push('/designer/apply/verify')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email
      case 2:
        return formData.title && formData.yearsExperience
      case 3:
        return formData.city && formData.country && formData.timezone
      case 4:
        return formData.styles.length > 0 && formData.projectTypes.length > 0 && formData.bio
      default:
        return false
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <Navigation 
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="text-5xl mb-6">🚀</div>
          <h1 className="text-4xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Join 2,847 designers shipping great work
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Skip Upwork. Get matched with founders who pay well and respect your time.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-center gap-8">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Experience' },
              { num: 3, label: 'Location' },
              { num: 4, label: 'Expertise' }
            ].map((item) => (
              <div key={item.num} className="flex flex-col items-center gap-2">
                <div
                  className="h-2 w-16 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: item.num <= step ? theme.accent : theme.border
                  }}
                />
                <span 
                  className="text-xs"
                  style={{ color: item.num <= step ? theme.text.primary : theme.text.muted }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="rounded-3xl p-8 mb-8 transition-all duration-300 animate-slideUp"
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Let's start with the basics ✍️
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@designstudio.com"
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Tell us about your experience 💼
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Professional Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Product Designer"
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Years of Experience
                  </label>
                  <select
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Hourly Rate (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="150"
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Where are you based? 🌍
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="USA"
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                  required
                >
                  <option value="">Select timezone</option>
                  <option value="PST">Pacific Time (PST/PDT)</option>
                  <option value="MST">Mountain Time (MST/MDT)</option>
                  <option value="CST">Central Time (CST/CDT)</option>
                  <option value="EST">Eastern Time (EST/EDT)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                  <option value="CET">Central European Time (CET)</option>
                  <option value="IST">India Standard Time (IST)</option>
                  <option value="JST">Japan Standard Time (JST)</option>
                  <option value="AEST">Australian Eastern Time (AEST)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Current Availability
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                >
                  <option value="available">Available for new projects 🟢</option>
                  <option value="busy">Busy but open to great projects 🟡</option>
                  <option value="unavailable">Not taking new projects 🔴</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Show off your expertise 🎨
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  What's your design style? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DESIGN_STYLES.map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleStyleToggle(style.id)}
                      className="py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] text-left flex items-center justify-between"
                      style={{
                        backgroundColor: formData.styles.includes(style.id) ? theme.accent : theme.nestedBg,
                        border: `2px solid ${formData.styles.includes(style.id) ? theme.accent : theme.border}`,
                        color: formData.styles.includes(style.id) ? '#000' : theme.text.primary
                      }}
                    >
                      <span>{style.emoji} {style.label}</span>
                      {formData.styles.includes(style.id) && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  What type of projects do you work on? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleProjectTypeToggle(type.id)}
                      className="py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] text-left flex items-center justify-between"
                      style={{
                        backgroundColor: formData.projectTypes.includes(type.id) ? theme.accent : theme.nestedBg,
                        border: `2px solid ${formData.projectTypes.includes(type.id) ? theme.accent : theme.border}`,
                        color: formData.projectTypes.includes(type.id) ? '#000' : theme.text.primary
                      }}
                    >
                      <span>{type.emoji} {type.label}</span>
                      {formData.projectTypes.includes(type.id) && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Industry Experience (Select all that apply)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {INDUSTRIES.map(industry => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => handleIndustryToggle(industry)}
                      className="py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        backgroundColor: formData.industries.includes(industry) ? theme.accent : theme.nestedBg,
                        border: `2px solid ${formData.industries.includes(industry) ? theme.accent : theme.border}`,
                        color: formData.industries.includes(industry) ? '#000' : theme.text.primary
                      }}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Tell us about yourself (founders love personality!)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="I turn complex B2B workflows into delightful experiences. When I'm not pushing pixels, you'll find me..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                  required
                />
                <p className="text-sm mt-2 transition-colors duration-300" style={{ color: theme.text.muted }}>
                  Pro tip: Share what makes you unique. Founders love working with humans, not robots.
                </p>
              </div>

              {/* What happens next */}
              <div 
                className="rounded-2xl p-6"
                style={{ backgroundColor: theme.nestedBg }}
              >
                <h4 className="font-bold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  🎯 What happens next?
                </h4>
                <ul className="space-y-2 text-sm" style={{ color: theme.text.secondary }}>
                  <li>• We review your application in 24-48 hours</li>
                  <li>• If approved, you go live on our platform immediately</li>
                  <li>• Get matched with 5-10 founders per week</li>
                  <li>• Close deals directly, we take 0% commission</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-8" style={{ borderTop: `1px solid ${theme.border}` }}>
            {step > 1 && (
              <LoadingButton
                onClick={handleBack}
                variant="secondary"
                size="md"
                theme={theme}
              >
                ← Back
              </LoadingButton>
            )}
            
            <LoadingButton
              onClick={handleNext}
              disabled={!isStepValid()}
              loading={step === 4 && isLoading}
              loadingText="Submitting..."
              variant="primary"
              size="lg"
              theme={theme}
              className="ml-auto"
            >
              {step === 4 ? 'Submit Application →' : <>Continue <span className="ml-1">→</span></>}
            </LoadingButton>
          </div>
        </div>

        {/* Trust signals */}
        <div className="text-center">
          <p className="text-sm mb-6 transition-colors duration-300" style={{ color: theme.text.muted }}>
            Join designers from top companies
          </p>
          <div className="flex justify-center items-center gap-8 opacity-50">
            <span style={{ color: theme.text.muted }}>Apple</span>
            <span style={{ color: theme.text.muted }}>•</span>
            <span style={{ color: theme.text.muted }}>Google</span>
            <span style={{ color: theme.text.muted }}>•</span>
            <span style={{ color: theme.text.muted }}>Meta</span>
            <span style={{ color: theme.text.muted }}>•</span>
            <span style={{ color: theme.text.muted }}>Stripe</span>
          </div>
        </div>
      </div>
    </main>
  )
}