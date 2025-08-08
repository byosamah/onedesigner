'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/shared'

// Define theme type
interface Theme {
  bg: string
  cardBg: string
  nestedBg: string
  border: string
  accent: string
  success: string
  error: string
  text: {
    primary: string
    secondary: string
    muted: string
  }
  tagBg: string
}

// Default theme values
const defaultTheme: Theme = {
  bg: '#1a1a1a',
  cardBg: '#212121',
  nestedBg: '#2a2a2a',
  border: '#333333',
  accent: '#f0ad4e',
  success: '#22c55e',
  error: '#ef4444',
  text: {
    primary: '#cfcfcf',
    secondary: '#9CA3AF',
    muted: '#6B7280'
  },
  tagBg: '#333333'
}

interface FormData {
  // Basic info
  firstName: string
  lastName: string
  email: string
  country: string
  timezone: string
  
  // Professional details
  experience: string
  portfolioUrl: string
  linkedinUrl?: string
  behanceUrl?: string
  dribbbleUrl?: string
  otherUrl?: string
  
  // Enhanced fields
  designPhilosophy: string
  tools: string[]
  categories: string[]
  budgetRange: {
    min: number
    max: number
  }
  responseTime: string
  collaborationStyle: string
  preferredTimeline: string
  preferredIndustries: string[]
  uniqueApproach: string
  projectShowcase: {
    title: string
    description: string
    outcome: string
  }[]
}

const steps = [
  { id: 1, name: 'Personal Info', description: 'Tell us about yourself' },
  { id: 2, name: 'Experience', description: 'Share your expertise' },
  { id: 3, name: 'Design Style', description: 'Define your approach' },
  { id: 4, name: 'Work Preferences', description: 'How you work best' },
  { id: 5, name: 'Portfolio', description: 'Showcase your work' },
  { id: 6, name: 'Review', description: 'Confirm your details' }
]

const experienceLevels = [
  '1-2 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
]

const categories = [
  'Brand Identity',
  'Web Design',
  'Mobile App Design',
  'Product Design',
  'Marketing Design',
  'Social Media',
  'Print Design',
  'Packaging',
  'Illustration',
  'Motion Graphics'
]

const tools = [
  'Figma',
  'Adobe Creative Suite',
  'Sketch',
  'Webflow',
  'Framer',
  'After Effects',
  'Cinema 4D',
  'Procreate',
  'InVision',
  'Principle'
]

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Entertainment',
  'Non-profit',
  'Real Estate',
  'Food & Beverage',
  'Fashion'
]

export default function DesignerApplyForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme] = useState(defaultTheme)
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    timezone: '',
    experience: '',
    portfolioUrl: '',
    linkedinUrl: '',
    behanceUrl: '',
    dribbbleUrl: '',
    otherUrl: '',
    designPhilosophy: '',
    tools: [],
    categories: [],
    budgetRange: { min: 500, max: 10000 },
    responseTime: '24 hours',
    collaborationStyle: '',
    preferredTimeline: '',
    preferredIndustries: [],
    uniqueApproach: '',
    projectShowcase: []
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/designer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          enhancedProfile: {
            designPhilosophy: formData.designPhilosophy,
            categories: formData.categories,
            tools: formData.tools,
            budgetRange: formData.budgetRange,
            responseTime: formData.responseTime,
            collaborationStyle: formData.collaborationStyle,
            preferredTimeline: formData.preferredTimeline,
            preferredIndustries: formData.preferredIndustries,
            uniqueApproach: formData.uniqueApproach,
            projectShowcase: formData.projectShowcase
          }
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }
      
      sessionStorage.setItem('designerEmail', formData.email)
      router.push('/designer/apply/verify')
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
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
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
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
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
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
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: theme.nestedBg, 
                  color: theme.text.primary,
                  borderColor: theme.border,
                  borderWidth: '1px'
                }}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  placeholder="United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  placeholder="EST"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Years of Experience
              </label>
              <div className="grid grid-cols-2 gap-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, experience: level })}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: formData.experience === level ? theme.accent : theme.nestedBg,
                      color: formData.experience === level ? '#000' : theme.text.primary,
                      borderColor: theme.border,
                      borderWidth: '1px'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Portfolio URL
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: theme.nestedBg, 
                  color: theme.text.primary,
                  borderColor: theme.border,
                  borderWidth: '1px'
                }}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Other Links (Optional)
              </label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  placeholder="LinkedIn URL"
                />
                <input
                  type="url"
                  value={formData.behanceUrl}
                  onChange={(e) => setFormData({ ...formData, behanceUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  placeholder="Behance URL"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Design Philosophy
              </label>
              <textarea
                value={formData.designPhilosophy}
                onChange={(e) => setFormData({ ...formData, designPhilosophy: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: theme.nestedBg, 
                  color: theme.text.primary,
                  borderColor: theme.border,
                  borderWidth: '1px'
                }}
                rows={4}
                placeholder="Describe your design philosophy and approach..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Design Categories (Select up to 5)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      if (formData.categories.includes(category)) {
                        setFormData({ 
                          ...formData, 
                          categories: formData.categories.filter(c => c !== category) 
                        })
                      } else if (formData.categories.length < 5) {
                        setFormData({ 
                          ...formData, 
                          categories: [...formData.categories, category] 
                        })
                      }
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: formData.categories.includes(category) ? theme.accent : theme.nestedBg,
                      color: formData.categories.includes(category) ? '#000' : theme.text.primary,
                      borderColor: theme.border,
                      borderWidth: '1px'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Design Tools (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <button
                    key={tool}
                    onClick={() => {
                      if (formData.tools.includes(tool)) {
                        setFormData({ 
                          ...formData, 
                          tools: formData.tools.filter(t => t !== tool) 
                        })
                      } else {
                        setFormData({ 
                          ...formData, 
                          tools: [...formData.tools, tool] 
                        })
                      }
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: formData.tools.includes(tool) ? theme.accent : theme.nestedBg,
                      color: formData.tools.includes(tool) ? '#000' : theme.text.primary,
                      borderColor: theme.border,
                      borderWidth: '1px'
                    }}
                  >
                    {tool}
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
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Budget Range (USD)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={formData.budgetRange.min}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    budgetRange: { ...formData.budgetRange, min: parseInt(e.target.value) || 0 } 
                  })}
                  className="flex-1 px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  placeholder="Min"
                />
                <span style={{ color: theme.text.secondary }}>to</span>
                <input
                  type="number"
                  value={formData.budgetRange.max}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    budgetRange: { ...formData.budgetRange, max: parseInt(e.target.value) || 0 } 
                  })}
                  className="flex-1 px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Response Time
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['12 hours', '24 hours', '48 hours'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setFormData({ ...formData, responseTime: time })}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: formData.responseTime === time ? theme.accent : theme.nestedBg,
                      color: formData.responseTime === time ? '#000' : theme.text.primary,
                      borderColor: theme.border,
                      borderWidth: '1px'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Collaboration Style
              </label>
              <textarea
                value={formData.collaborationStyle}
                onChange={(e) => setFormData({ ...formData, collaborationStyle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: theme.nestedBg, 
                  color: theme.text.primary,
                  borderColor: theme.border,
                  borderWidth: '1px'
                }}
                rows={3}
                placeholder="How do you prefer to work with clients?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Preferred Industries
              </label>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => {
                      if (formData.preferredIndustries.includes(industry)) {
                        setFormData({ 
                          ...formData, 
                          preferredIndustries: formData.preferredIndustries.filter(i => i !== industry) 
                        })
                      } else {
                        setFormData({ 
                          ...formData, 
                          preferredIndustries: [...formData.preferredIndustries, industry] 
                        })
                      }
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: formData.preferredIndustries.includes(industry) ? theme.accent : theme.nestedBg,
                      color: formData.preferredIndustries.includes(industry) ? '#000' : theme.text.primary,
                      borderColor: theme.border,
                      borderWidth: '1px'
                    }}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                What Makes You Unique?
              </label>
              <textarea
                value={formData.uniqueApproach}
                onChange={(e) => setFormData({ ...formData, uniqueApproach: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: theme.nestedBg, 
                  color: theme.text.primary,
                  borderColor: theme.border,
                  borderWidth: '1px'
                }}
                rows={4}
                placeholder="What sets you apart from other designers?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                Showcase a Project (Optional)
              </label>
              <div className="space-y-3 p-4 rounded-xl" style={{ backgroundColor: theme.nestedBg }}>
                <input
                  type="text"
                  value={formData.projectShowcase[0]?.title || ''}
                  onChange={(e) => {
                    const showcase = [...formData.projectShowcase]
                    showcase[0] = { ...showcase[0], title: e.target.value }
                    setFormData({ ...formData, projectShowcase: showcase })
                  }}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.bg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  placeholder="Project Title"
                />
                <textarea
                  value={formData.projectShowcase[0]?.description || ''}
                  onChange={(e) => {
                    const showcase = [...formData.projectShowcase]
                    showcase[0] = { ...showcase[0], description: e.target.value }
                    setFormData({ ...formData, projectShowcase: showcase })
                  }}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.bg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  rows={3}
                  placeholder="Project Description"
                />
                <textarea
                  value={formData.projectShowcase[0]?.outcome || ''}
                  onChange={(e) => {
                    const showcase = [...formData.projectShowcase]
                    showcase[0] = { ...showcase[0], outcome: e.target.value }
                    setFormData({ ...formData, projectShowcase: showcase })
                  }}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.bg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    borderWidth: '1px'
                  }}
                  rows={2}
                  placeholder="Project Outcome"
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: theme.nestedBg }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                Review Your Application
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>Name</p>
                  <p className="font-medium" style={{ color: theme.text.primary }}>
                    {formData.firstName} {formData.lastName}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>Email</p>
                  <p className="font-medium" style={{ color: theme.text.primary }}>{formData.email}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>Experience</p>
                  <p className="font-medium" style={{ color: theme.text.primary }}>{formData.experience}</p>
                </div>
                
                <div>
                  <p className="text-sm mb-2" style={{ color: theme.text.secondary }}>Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((cat) => (
                      <span 
                        key={cat}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: theme.tagBg, color: theme.text.primary }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-2" style={{ color: theme.text.secondary }}>Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tools.map((tool) => (
                      <span 
                        key={tool}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: theme.tagBg, color: theme.text.primary }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>Budget Range</p>
                  <p className="font-medium" style={{ color: theme.text.primary }}>
                    ${formData.budgetRange.min} - ${formData.budgetRange.max}
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: theme.error }}>
                <p className="text-white text-sm">{error}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-1 rounded-full" style={{ backgroundColor: theme.border }} />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  currentStep >= step.id ? 'scale-110' : ''
                }`}
                style={{
                  backgroundColor: currentStep >= step.id ? theme.accent : theme.nestedBg,
                  color: currentStep >= step.id ? '#000' : theme.text.secondary,
                  borderColor: theme.border,
                  borderWidth: currentStep >= step.id ? '0' : '1px'
                }}
              >
                {step.id}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium" style={{ color: theme.text.primary }}>
                  {step.name}
                </p>
                <p className="text-xs" style={{ color: theme.text.muted }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div
          className="absolute top-5 left-0 h-1 rounded-full transition-all duration-500"
          style={{
            backgroundColor: theme.accent,
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
          }}
        />
      </div>

      {/* Form Content */}
      <div className="animate-fadeIn">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: theme.nestedBg,
              color: theme.text.primary,
              borderColor: theme.border,
              borderWidth: '1px'
            }}
          >
            Back
          </button>
        )}
        
        {currentStep < steps.length ? (
          <button
            onClick={handleNext}
            className="ml-auto px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="ml-auto px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
            style={{
              backgroundColor: theme.accent,
              color: '#000',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        )}
      </div>
    </div>
  )
}