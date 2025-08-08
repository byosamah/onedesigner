'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { LoadingButton, FormTextarea } from '@/components/forms'
import { INDUSTRIES, DESIGN_STYLES } from '@/lib/constants'
import { getTheme } from '@/lib/design-system'

const timelines = [
  { value: 'asap', label: 'ASAP (48 hours)', hot: true },
  { value: '1-week', label: '1 week' },
  { value: '2-weeks', label: '2 weeks' },
  { value: '1-month', label: '1 month' },
  { value: 'flexible', label: 'I\'m flexible' },
]

export default function BriefDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BriefDetailsContent />
    </Suspense>
  )
}

function BriefDetailsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectType = searchParams.get('type') || ''
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const [formData, setFormData] = useState({
    industry: '',
    timeline: '',
    styles: [] as string[],
    inspiration: '',
    requirements: '',
  })

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleStyleToggle = (styleId: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(styleId)
        ? prev.styles.filter(s => s !== styleId)
        : [...prev.styles, styleId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Store brief data in sessionStorage for now
    const briefData = {
      projectType,
      ...formData,
    }
    sessionStorage.setItem('briefData', JSON.stringify(briefData))
    
    router.push('/brief/contact')
  }

  const isValid = formData.industry && formData.timeline && formData.styles.length > 0

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <Navigation 
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        title="Step 2 of 3"
      />

      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="mb-12 animate-fadeIn">
          <h1 className="text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Now for the juicy details
          </h1>
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            30 seconds to nail your {projectType} brief. Let's go.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Industry */}
          <div className="animate-slideUp">
            <label className="block text-lg font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              What industry are you in? 🏢
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 appearance-none cursor-pointer"
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.border}`,
                color: theme.text.primary,
                focusRingColor: theme.accent
              }}
            >
              <option value="">Pick your industry...</option>
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div className="animate-slideUp stagger-1">
            <label className="block text-lg font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              When do you need this done? ⏱️
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timelines.map(timeline => (
                <button
                  key={timeline.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, timeline: timeline.value }))}
                  className="py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    backgroundColor: formData.timeline === timeline.value ? theme.accent : theme.cardBg,
                    border: `2px solid ${formData.timeline === timeline.value ? theme.accent : theme.border}`,
                    color: formData.timeline === timeline.value ? '#000' : theme.text.primary
                  }}
                >
                  {timeline.label}
                  {timeline.hot && <span className="ml-1">🔥</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Style Preferences */}
          <div className="animate-slideUp stagger-2">
            <label className="block text-lg font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              What's your design vibe? Pick all that apply 🎨
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DESIGN_STYLES.map(style => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleStyleToggle(style.id)}
                  className="py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] text-left flex items-center justify-between"
                  style={{
                    backgroundColor: formData.styles.includes(style.id) ? theme.accent : theme.cardBg,
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

          {/* Inspiration URLs */}
          <div className="animate-slideUp stagger-3">
            <label className="block text-lg font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Got inspiration? Drop some links (optional) 🔗
            </label>
            <FormTextarea
              value={formData.inspiration}
              onChange={(e) => setFormData(prev => ({ ...prev, inspiration: e.target.value }))}
              placeholder="dribbble.com/shots/example&#10;behance.net/gallery/example&#10;yourcompetitor.com"
              rows={3}
              theme={theme}
              hint="Websites, Dribbble shots, whatever inspires you"
            />
          </div>

          {/* Special Requirements */}
          <div className="animate-slideUp stagger-4">
            <label className="block text-lg font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Any special requirements? (optional) 📝
            </label>
            <FormTextarea
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Must work with our React codebase&#10;Need Figma files&#10;Accessibility is crucial&#10;Mobile-first approach"
              rows={4}
              theme={theme}
              hint="Technical requirements, must-haves, deal-breakers"
            />
          </div>

          {/* Submit */}
          <div className="pt-8 space-y-4">
            <LoadingButton
              type="submit"
              disabled={!isValid}
              variant="primary"
              size="lg"
              theme={theme}
              className="w-full text-lg"
            >
              Almost there! Contact details next →
            </LoadingButton>
            
            <p className="text-center text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
              {isValid ? 'Looking good! One more step.' : 'Fill in the required fields above'}
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}