'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '../../design-system'

export default function TestDesignerApply() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    title: '',
    yearsExperience: '',
    city: '',
    country: '',
    portfolioUrl: '',
    bio: '',
    hourlyRate: '',
    projectTypes: [] as string[],
    styles: [] as string[],
    industries: [] as string[]
  })

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCheckboxChange = (category: 'projectTypes' | 'styles' | 'industries', value: string) => {
    setFormData({
      ...formData,
      [category]: formData[category].includes(value)
        ? formData[category].filter(item => item !== value)
        : [...formData[category], value]
    })
  }

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate submission for demo
    setTimeout(() => {
      router.push('/test-redesign/designer/application-success')
    }, 2000)
  }

  const projectTypeOptions = ['SaaS Dashboard', 'Mobile App', 'E-commerce', 'Landing Page', 'Web App', 'Design System']
  const styleOptions = ['Minimalist', 'Modern', 'Clean', 'Bold', 'Playful', 'Corporate']
  const industryOptions = ['SaaS', 'Fintech', 'E-commerce', 'Healthcare', 'Education', 'Crypto']

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Simple Navigation */}
      <nav className="px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/test-redesign" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
          <div className="flex items-center gap-8">
            <Link 
              href="/test-redesign/designer/login"
              className="text-sm font-medium transition-colors duration-300"
              style={{ color: theme.text.secondary }}
            >
              Already a designer? Sign in
            </Link>
            
            {/* Theme Toggle */}
            <div className="border-l pl-8" style={{ borderColor: theme.border }}>
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
          </div>
        </div>
      </nav>

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
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((num) => (
              <div 
                key={num}
                className="flex items-center"
                style={{ flex: num < 3 ? 1 : 0 }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300"
                  style={{
                    backgroundColor: step >= num ? theme.accent : theme.nestedBg,
                    color: step >= num ? '#000' : theme.text.muted
                  }}
                >
                  {step > num ? '✓' : num}
                </div>
                {num < 3 && (
                  <div 
                    className="flex-1 h-1 mx-2 transition-all duration-300"
                    style={{
                      backgroundColor: step > num ? theme.accent : theme.border
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: step >= 1 ? theme.text.primary : theme.text.muted }}>Basic Info</span>
            <span style={{ color: step >= 2 ? theme.text.primary : theme.text.muted }}>Experience</span>
            <span style={{ color: step >= 3 ? theme.text.primary : theme.text.muted }}>Expertise</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="animate-slideUp">
          <div 
            className="rounded-3xl p-8 mb-8 transition-all duration-300"
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        focusRingColor: theme.accent
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
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
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@designstudio.com"
                    required
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Make it strong (like your coffee ☕)"
                    required
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="San Francisco"
                      required
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        focusRingColor: theme.accent
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="USA"
                      required
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
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Professional Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Senior Product Designer"
                    required
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                      Years of Experience
                    </label>
                    <select
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        focusRingColor: theme.accent
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="1-2">1-2 years</option>
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
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="150"
                      required
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
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                    required
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${theme.border}`,
                      color: theme.text.primary,
                      focusRingColor: theme.accent
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Tell us about yourself (founders love personality!)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="I turn complex B2B workflows into delightful experiences. When I'm not pushing pixels, you'll find me..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
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

            {/* Step 3: Expertise */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Project Types (select all that apply)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {projectTypeOptions.map((type) => (
                      <label 
                        key={type}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300"
                        style={{
                          backgroundColor: formData.projectTypes.includes(type) ? theme.accent : theme.nestedBg,
                          color: formData.projectTypes.includes(type) ? '#000' : theme.text.primary
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.projectTypes.includes(type)}
                          onChange={() => handleCheckboxChange('projectTypes', type)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Design Styles
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {styleOptions.map((style) => (
                      <label 
                        key={style}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300"
                        style={{
                          backgroundColor: formData.styles.includes(style) ? theme.accent : theme.nestedBg,
                          color: formData.styles.includes(style) ? '#000' : theme.text.primary
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.styles.includes(style)}
                          onChange={() => handleCheckboxChange('styles', style)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Industry Experience
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {industryOptions.map((industry) => (
                      <label 
                        key={industry}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300"
                        style={{
                          backgroundColor: formData.industries.includes(industry) ? theme.accent : theme.nestedBg,
                          color: formData.industries.includes(industry) ? '#000' : theme.text.primary
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.industries.includes(industry)}
                          onChange={() => handleCheckboxChange('industries', industry)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Why join section */}
                <div 
                  className="rounded-2xl p-6 mt-6"
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
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  backgroundColor: 'transparent',
                  border: `2px solid ${theme.border}`,
                  color: theme.text.secondary
                }}
              >
                ← Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] ml-auto"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application →'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Trust signals */}
        <div className="mt-16 text-center">
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