'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { getTheme } from '@/lib/design-system'

export const dynamic = 'force-dynamic'

const DESIGN_CATEGORIES = [
  { id: 'branding', name: 'Branding & Identity', icon: '🎨' },
  { id: 'web-design', name: 'Web Design', icon: '🌐' },
  { id: 'marketing', name: 'Marketing & Advertising', icon: '📢' },
  { id: 'product', name: 'Product & UI/UX', icon: '📱' },
  { id: 'illustration', name: 'Illustration & Graphics', icon: '✏️' },
  { id: 'specialized', name: 'Specialized Design', icon: '💎' }
]

const STYLE_KEYWORDS = [
  'Minimalist', 'Bold', 'Colorful', 'Corporate', 'Playful', 'Elegant',
  'Modern', 'Vintage', 'Organic', 'Tech-focused', 'Luxury', 'Accessible'
]

const INDUSTRIES = [
  'Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education',
  'Entertainment', 'Food & Beverage', 'Fashion', 'Non-profit', 'Real Estate'
]

const TOOLS = [
  'Figma', 'Adobe Creative Suite', 'Sketch', 'Webflow', 'Framer',
  'Blender', 'After Effects', 'Procreate', 'InVision', 'Principle'
]

const PROJECT_SIZES = [
  'Small ($1-5k)', 'Medium ($5-20k)', 'Large ($20-50k)', 'Enterprise ($50k+)'
]

const CLIENT_TYPES = [
  'Startups', 'Small Businesses', 'Enterprises', 'Agencies', 'Non-profits'
]

const COLLABORATION_STYLES = [
  { value: 'independent', label: 'Independent - I work best with minimal supervision' },
  { value: 'collaborative', label: 'Collaborative - I enjoy regular check-ins and feedback' },
  { value: 'flexible', label: 'Flexible - I adapt to client preferences' }
]

export default function DesignerApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme ? getTheme(isDarkMode) : null
  const defaultTheme = {
    bg: '#212121',
    cardBg: '#323232',
    nestedBg: '#212121',
    border: '#374151',
    accent: 'rgb(245, 193, 71)',
    success: '#10B981',
    error: '#EF4444',
    text: {
      primary: '#cfcfcf',
      secondary: '#9CA3AF',
      muted: '#6B7280'
    },
    tagBg: '#1A1A1A'
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Step 2: Professional Identity
    title: '',
    yearsExperience: '',
    city: '',
    country: '',
    timezone: '',
    portfolioLink: '',
    
    // Step 3: Design Philosophy & Expertise
    designPhilosophy: '',
    primaryCategories: [] as string[],
    secondaryCategories: [] as string[],
    styleKeywords: [] as string[],
    
    // Step 4: Work Preferences
    preferredIndustries: [] as string[],
    preferredProjectSizes: [] as string[],
    turnaroundTimes: {
      logo: 7,
      website: 21,
      branding: 30
    },
    revisionRoundsIncluded: 3,
    
    // Step 5: Tools & Skills
    expertTools: [] as string[],
    specialSkills: '',
    
    // Step 6: Collaboration & Availability
    collaborationStyle: 'collaborative',
    currentAvailability: 'available',
    idealClientTypes: [] as string[],
    dreamProjectDescription: ''
  })

  const totalSteps = 6

  const handleNext = () => {
    if (step < totalSteps) {
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
      router.push('/designer/verify')
      
    } catch (error) {
      console.error('Application error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit application')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: safeTheme.text.primary }}>
                Let's start with the basics
              </h2>
              <p style={{ color: safeTheme.text.secondary }}>
                Tell us about yourself
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: safeTheme.nestedBg,
                    border: `2px solid ${safeTheme.border}`,
                    color: safeTheme.text.primary,
                    focusRingColor: safeTheme.accent
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: safeTheme.nestedBg,
                    border: `2px solid ${safeTheme.border}`,
                    color: safeTheme.text.primary,
                    focusRingColor: safeTheme.accent
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: safeTheme.text.primary }}>
                Your professional identity
              </h2>
              <p style={{ color: safeTheme.text.secondary }}>
                Help us understand your experience and location
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Professional Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Senior UI/UX Designer"
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Years of Experience
              </label>
              <select
                value={formData.yearsExperience}
                onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
                required
              >
                <option value="">Select experience</option>
                <option value="1">1-2 years</option>
                <option value="3">3-5 years</option>
                <option value="6">6-10 years</option>
                <option value="11">10+ years</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: safeTheme.nestedBg,
                    border: `2px solid ${safeTheme.border}`,
                    color: safeTheme.text.primary,
                    focusRingColor: safeTheme.accent
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: safeTheme.nestedBg,
                    border: `2px solid ${safeTheme.border}`,
                    color: safeTheme.text.primary,
                    focusRingColor: safeTheme.accent
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Portfolio Link
              </label>
              <input
                type="url"
                value={formData.portfolioLink}
                onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                placeholder="https://yourportfolio.com"
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
                required
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: safeTheme.text.primary }}>
                Your design philosophy
              </h2>
              <p style={{ color: safeTheme.text.secondary }}>
                What makes you unique as a designer?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Design Philosophy (2-3 sentences)
              </label>
              <textarea
                value={formData.designPhilosophy}
                onChange={(e) => setFormData({...formData, designPhilosophy: e.target.value})}
                placeholder="Describe your approach to design and what drives your creative decisions..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Primary Design Categories (choose up to 3)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DESIGN_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (formData.primaryCategories.includes(category.id)) {
                        setFormData({
                          ...formData,
                          primaryCategories: formData.primaryCategories.filter(c => c !== category.id)
                        })
                      } else if (formData.primaryCategories.length < 3) {
                        setFormData({
                          ...formData,
                          primaryCategories: [...formData.primaryCategories, category.id]
                        })
                      }
                    }}
                    className="p-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      backgroundColor: formData.primaryCategories.includes(category.id) 
                        ? safeTheme.accent : safeTheme.nestedBg,
                      border: `2px solid ${formData.primaryCategories.includes(category.id) 
                        ? safeTheme.accent : safeTheme.border}`,
                      color: formData.primaryCategories.includes(category.id) 
                        ? '#000' : safeTheme.text.primary
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Design Style Keywords (choose 3-5)
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_KEYWORDS.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      if (formData.styleKeywords.includes(style)) {
                        setFormData({
                          ...formData,
                          styleKeywords: formData.styleKeywords.filter(s => s !== style)
                        })
                      } else if (formData.styleKeywords.length < 5) {
                        setFormData({
                          ...formData,
                          styleKeywords: [...formData.styleKeywords, style]
                        })
                      }
                    }}
                    className="px-4 py-2 rounded-full text-sm transition-all duration-200"
                    style={{
                      backgroundColor: formData.styleKeywords.includes(style) 
                        ? safeTheme.accent : safeTheme.tagBg,
                      color: formData.styleKeywords.includes(style) 
                        ? '#000' : safeTheme.text.secondary,
                      border: `1px solid ${formData.styleKeywords.includes(style) 
                        ? safeTheme.accent : safeTheme.border}`
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: safeTheme.text.primary }}>
                Work preferences
              </h2>
              <p style={{ color: safeTheme.text.secondary }}>
                Help us match you with the right projects
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Preferred Industries (choose up to 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => {
                      if (formData.preferredIndustries.includes(industry)) {
                        setFormData({
                          ...formData,
                          preferredIndustries: formData.preferredIndustries.filter(i => i !== industry)
                        })
                      } else if (formData.preferredIndustries.length < 5) {
                        setFormData({
                          ...formData,
                          preferredIndustries: [...formData.preferredIndustries, industry]
                        })
                      }
                    }}
                    className="px-4 py-2 rounded-full text-sm transition-all duration-200"
                    style={{
                      backgroundColor: formData.preferredIndustries.includes(industry) 
                        ? safeTheme.accent : safeTheme.tagBg,
                      color: formData.preferredIndustries.includes(industry) 
                        ? '#000' : safeTheme.text.secondary,
                      border: `1px solid ${formData.preferredIndustries.includes(industry) 
                        ? safeTheme.accent : safeTheme.border}`
                    }}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Preferred Project Sizes
              </label>
              <div className="space-y-2">
                {PROJECT_SIZES.map((size) => (
                  <label key={size} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.preferredProjectSizes.includes(size)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            preferredProjectSizes: [...formData.preferredProjectSizes, size]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            preferredProjectSizes: formData.preferredProjectSizes.filter(s => s !== size)
                          })
                        }
                      }}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: safeTheme.accent }}
                    />
                    <span style={{ color: safeTheme.text.primary }}>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Typical Turnaround Times (in days)
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <span className="w-24 text-sm" style={{ color: safeTheme.text.secondary }}>Logo Design:</span>
                  <input
                    type="number"
                    value={formData.turnaroundTimes.logo}
                    onChange={(e) => setFormData({
                      ...formData,
                      turnaroundTimes: { ...formData.turnaroundTimes, logo: parseInt(e.target.value) || 7 }
                    })}
                    min="1"
                    max="60"
                    className="w-20 px-3 py-2 rounded-lg text-center"
                    style={{
                      backgroundColor: safeTheme.nestedBg,
                      border: `1px solid ${safeTheme.border}`,
                      color: safeTheme.text.primary
                    }}
                  />
                  <span className="text-sm" style={{ color: safeTheme.text.secondary }}>days</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="w-24 text-sm" style={{ color: safeTheme.text.secondary }}>Website:</span>
                  <input
                    type="number"
                    value={formData.turnaroundTimes.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      turnaroundTimes: { ...formData.turnaroundTimes, website: parseInt(e.target.value) || 21 }
                    })}
                    min="1"
                    max="90"
                    className="w-20 px-3 py-2 rounded-lg text-center"
                    style={{
                      backgroundColor: safeTheme.nestedBg,
                      border: `1px solid ${safeTheme.border}`,
                      color: safeTheme.text.primary
                    }}
                  />
                  <span className="text-sm" style={{ color: safeTheme.text.secondary }}>days</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="w-24 text-sm" style={{ color: safeTheme.text.secondary }}>Full Branding:</span>
                  <input
                    type="number"
                    value={formData.turnaroundTimes.branding}
                    onChange={(e) => setFormData({
                      ...formData,
                      turnaroundTimes: { ...formData.turnaroundTimes, branding: parseInt(e.target.value) || 30 }
                    })}
                    min="1"
                    max="120"
                    className="w-20 px-3 py-2 rounded-lg text-center"
                    style={{
                      backgroundColor: safeTheme.nestedBg,
                      border: `1px solid ${safeTheme.border}`,
                      color: safeTheme.text.primary
                    }}
                  />
                  <span className="text-sm" style={{ color: safeTheme.text.secondary }}>days</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Revision Rounds Included
              </label>
              <select
                value={formData.revisionRoundsIncluded}
                onChange={(e) => setFormData({...formData, revisionRoundsIncluded: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
              >
                <option value={1}>1 round</option>
                <option value={2}>2 rounds</option>
                <option value={3}>3 rounds</option>
                <option value={4}>4 rounds</option>
                <option value={5}>5+ rounds</option>
              </select>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: safeTheme.text.primary }}>
                Tools & skills
              </h2>
              <p style={{ color: safeTheme.text.secondary }}>
                What are you an expert at?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Expert Tools (choose all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TOOLS.map((tool) => (
                  <label key={tool} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.expertTools.includes(tool)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            expertTools: [...formData.expertTools, tool]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            expertTools: formData.expertTools.filter(t => t !== tool)
                          })
                        }
                      }}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: safeTheme.accent }}
                    />
                    <span style={{ color: safeTheme.text.primary }}>{tool}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Special Skills or Certifications
              </label>
              <textarea
                value={formData.specialSkills}
                onChange={(e) => setFormData({...formData, specialSkills: e.target.value})}
                placeholder="e.g., Certified UX Designer, Animation Expert, 3D Modeling, etc."
                rows={3}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: safeTheme.text.primary }}>
                Collaboration & availability
              </h2>
              <p style={{ color: safeTheme.text.secondary }}>
                How do you like to work with clients?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Collaboration Style
              </label>
              <div className="space-y-3">
                {COLLABORATION_STYLES.map((style) => (
                  <label key={style.value} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="collaborationStyle"
                      value={style.value}
                      checked={formData.collaborationStyle === style.value}
                      onChange={(e) => setFormData({...formData, collaborationStyle: e.target.value})}
                      className="mt-1"
                      style={{ accentColor: safeTheme.accent }}
                    />
                    <span style={{ color: safeTheme.text.primary }}>{style.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Current Availability
              </label>
              <select
                value={formData.currentAvailability}
                onChange={(e) => setFormData({...formData, currentAvailability: e.target.value})}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
              >
                <option value="available">Available immediately</option>
                <option value="1week">Available in 1 week</option>
                <option value="2weeks">Available in 2 weeks</option>
                <option value="1month">Available in 1 month</option>
                <option value="unavailable">Not currently available</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: safeTheme.text.primary }}>
                Ideal Client Types
              </label>
              <div className="space-y-2">
                {CLIENT_TYPES.map((type) => (
                  <label key={type} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.idealClientTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            idealClientTypes: [...formData.idealClientTypes, type]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            idealClientTypes: formData.idealClientTypes.filter(t => t !== type)
                          })
                        }
                      }}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: safeTheme.accent }}
                    />
                    <span style={{ color: safeTheme.text.primary }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.text.primary }}>
                Dream Project Description
              </label>
              <textarea
                value={formData.dreamProjectDescription}
                onChange={(e) => setFormData({...formData, dreamProjectDescription: e.target.value})}
                placeholder="Describe your ideal project - what would make you jump out of bed excited to work?"
                rows={4}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: safeTheme.nestedBg,
                  border: `2px solid ${safeTheme.border}`,
                  color: theme.text.primary,
                  focusRingColor: safeTheme.accent
                }}
                required
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email
      case 2:
        return formData.title && formData.yearsExperience && formData.city && 
               formData.country && formData.portfolioLink
      case 3:
        return formData.designPhilosophy && formData.primaryCategories.length > 0 && 
               formData.styleKeywords.length >= 3
      case 4:
        return formData.preferredIndustries.length > 0 && formData.preferredProjectSizes.length > 0
      case 5:
        return formData.expertTools.length > 0
      case 6:
        return formData.dreamProjectDescription
      default:
        return true
    }
  }

  // Ensure theme is always defined
  const safeTheme = theme || defaultTheme

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: safeTheme.bg }}>
      <Navigation 
        theme={safeTheme} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        title="Apply as Designer"
      />

      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🎨</span>
              <h1 className="text-2xl font-bold" style={{ color: safeTheme.text.primary }}>
                Designer Application
              </h1>
            </div>
            <p className="text-sm" style={{ color: safeTheme.text.secondary }}>
              Step {step} of {totalSteps}
            </p>
          </div>
          
          <div className="relative">
            <div 
              className="h-2 rounded-full"
              style={{ backgroundColor: safeTheme.nestedBg }}
            />
            <div 
              className="absolute top-0 left-0 h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: safeTheme.accent,
                width: `${(step / totalSteps) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="animate-fadeIn">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                backgroundColor: 'transparent',
                border: `2px solid ${safeTheme.border}`,
                color: safeTheme.text.primary
              }}
            >
              Back
            </button>
          ) : (
            <Link
              href="/"
              className="font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                backgroundColor: 'transparent',
                border: `2px solid ${safeTheme.border}`,
                color: safeTheme.text.primary
              }}
            >
              Cancel
            </Link>
          )}

          <LoadingButton
            onClick={handleNext}
            isLoading={isLoading}
            disabled={!isStepValid()}
            className="font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: safeTheme.accent,
              color: '#000'
            }}
          >
            {step === totalSteps ? 'Submit Application' : 'Next'}
          </LoadingButton>
        </div>
      </div>
    </main>
  )
}