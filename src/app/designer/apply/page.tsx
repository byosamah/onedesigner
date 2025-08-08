'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingButton } from '@/components/forms'
import { LoadingSpinner } from '@/components/shared'
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

    // Step 5: Enhanced Portfolio & Skills
    portfolioUrl: '',
    dribbbleUrl: '',
    behanceUrl: '',
    linkedinUrl: '',
    specializations: [] as string[],
    softwareSkills: [] as string[],
    
    // Step 6: Experience & Preferences
    previousClients: '',
    projectPreferences: '',
    workingStyle: '',
    communicationStyle: 'direct',
    remoteExperience: '',
    teamCollaboration: ''
  })

  const handleNext = () => {
    if (step < 6) {
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

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }))
  }

  const handleSoftwareToggle = (software: string) => {
    setFormData(prev => ({
      ...prev,
      softwareSkills: prev.softwareSkills.includes(software)
        ? prev.softwareSkills.filter(s => s !== software)
        : [...prev.softwareSkills, software]
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

      case 5:
        const specializations = [
          'UI/UX Design', 'Web Design', 'Mobile App Design', 'Brand Identity', 
          'Logo Design', 'Illustration', 'Print Design', 'Packaging Design',
          'Motion Graphics', 'Product Design', 'Service Design', 'Design Systems'
        ]
        
        const softwareOptions = [
          'Figma', 'Adobe XD', 'Sketch', 'Adobe Photoshop', 'Adobe Illustrator',
          'Adobe InDesign', 'Adobe After Effects', 'Framer', 'Principle', 'InVision',
          'Zeplin', 'Abstract', 'Miro', 'FigJam'
        ]

        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Portfolio & Skills
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Additional Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://portfolio2.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Dribbble URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.dribbbleUrl}
                    onChange={(e) => setFormData({ ...formData, dribbbleUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://dribbble.com/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Behance URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.behanceUrl}
                    onChange={(e) => setFormData({ ...formData, behanceUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://behance.net/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    LinkedIn URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Specializations (Select all that apply)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {specializations.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => handleSpecializationToggle(spec)}
                      className="px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.specializations.includes(spec) ? theme.accent : theme.nestedBg,
                        color: formData.specializations.includes(spec) ? '#000' : theme.text.primary,
                        borderColor: formData.specializations.includes(spec) ? theme.accent : theme.border
                      }}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Software Skills (Select all that apply)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {softwareOptions.map((software) => (
                    <button
                      key={software}
                      onClick={() => handleSoftwareToggle(software)}
                      className="px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.softwareSkills.includes(software) ? theme.accent : theme.nestedBg,
                        color: formData.softwareSkills.includes(software) ? '#000' : theme.text.primary,
                        borderColor: formData.softwareSkills.includes(software) ? theme.accent : theme.border
                      }}
                    >
                      {software}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )

      case 6:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Experience & Preferences
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Previous Notable Clients or Projects
                </label>
                <textarea
                  value={formData.previousClients}
                  onChange={(e) => setFormData({ ...formData, previousClients: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Briefly describe notable clients or projects you've worked on..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Project Preferences
                </label>
                <textarea
                  value={formData.projectPreferences}
                  onChange={(e) => setFormData({ ...formData, projectPreferences: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="What types of projects do you enjoy most? What are your ideal project characteristics?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Working Style & Process
                </label>
                <textarea
                  value={formData.workingStyle}
                  onChange={(e) => setFormData({ ...formData, workingStyle: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Describe your design process, how you approach projects, and your working style..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Communication Style
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'direct', label: 'Direct and straightforward' },
                    { value: 'collaborative', label: 'Collaborative and consultative' },
                    { value: 'detailed', label: 'Detailed with regular updates' },
                    { value: 'flexible', label: 'Flexible based on client needs' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="communicationStyle"
                        value={option.value}
                        checked={formData.communicationStyle === option.value}
                        onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })}
                        className="w-5 h-5 accent-current"
                        style={{ accentColor: theme.accent }}
                      />
                      <span style={{ color: theme.text.primary }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Remote Work Experience
                </label>
                <textarea
                  value={formData.remoteExperience}
                  onChange={(e) => setFormData({ ...formData, remoteExperience: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Describe your experience working remotely with clients..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Team Collaboration Experience
                </label>
                <textarea
                  value={formData.teamCollaboration}
                  onChange={(e) => setFormData({ ...formData, teamCollaboration: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="How do you work with developers, product managers, and other stakeholders?"
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
    <main className="min-h-screen transition-colors duration-300 animate-fadeIn" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4">
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
        <div className="mb-12 animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full mx-1 transition-all duration-300 ${
                  i === 1 ? 'ml-0' : ''
                } ${i === 6 ? 'mr-0' : ''}`}
                style={{
                  backgroundColor: i <= step ? theme.accent : theme.border
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Basic', 'Professional', 'Location', 'Expertise', 'Portfolio', 'Experience'].map((label, i) => (
              <div 
                key={label} 
                className="text-xs flex-1 text-center"
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
              theme={theme}
              className="ml-auto px-6 py-3 text-sm font-medium"
              size="sm"
              variant="primary"
            >
              {step === 6 ? 'Submit Application' : 'Continue'}
            </LoadingButton>
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