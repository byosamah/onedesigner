'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '../../design-system'

const industries = [
  'Technology/SaaS',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Real Estate',
  'Food & Beverage',
  'Fashion',
  'Entertainment',
  'Non-profit',
  'Other',
]

const timelines = [
  { value: 'asap', label: 'ASAP (48 hours)', hot: true },
  { value: '1-week', label: '1 week' },
  { value: '2-weeks', label: '2 weeks' },
  { value: '1-month', label: '1 month' },
  { value: 'flexible', label: 'I\'m flexible' },
]

const styles = [
  { id: 'minimal', label: 'Minimal & Clean', emoji: '⚪' },
  { id: 'modern', label: 'Modern & Bold', emoji: '🔥' },
  { id: 'playful', label: 'Playful & Fun', emoji: '🎨' },
  { id: 'corporate', label: 'Corporate & Professional', emoji: '💼' },
  { id: 'elegant', label: 'Elegant & Sophisticated', emoji: '✨' },
  { id: 'technical', label: 'Technical & Data-driven', emoji: '📊' },
]

export default function TestBriefDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestBriefDetailsContent />
    </Suspense>
  )
}

function TestBriefDetailsContent() {
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
    
    router.push('/test-redesign/brief/contact')
  }

  const isValid = formData.industry && formData.timeline && formData.styles.length > 0

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
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
            <div className="text-sm px-4 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: theme.tagBg, color: theme.text.primary }}>
              Step 2 of 3
            </div>
            
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
              {industries.map(industry => (
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
              {styles.map(style => (
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
            <textarea
              value={formData.inspiration}
              onChange={(e) => setFormData(prev => ({ ...prev, inspiration: e.target.value }))}
              placeholder="dribbble.com/shots/example&#10;behance.net/gallery/example&#10;yourcompetitor.com"
              rows={3}
              className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.border}`,
                color: theme.text.primary,
                focusRingColor: theme.accent
              }}
            />
            <p className="text-sm mt-2 transition-colors duration-300" style={{ color: theme.text.muted }}>
              Websites, Dribbble shots, whatever inspires you
            </p>
          </div>

          {/* Special Requirements */}
          <div className="animate-slideUp stagger-4">
            <label className="block text-lg font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Any special requirements? (optional) 📝
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Must work with our React codebase&#10;Need Figma files&#10;Accessibility is crucial&#10;Mobile-first approach"
              rows={4}
              className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.border}`,
                color: theme.text.primary,
                focusRingColor: theme.accent
              }}
            />
            <p className="text-sm mt-2 transition-colors duration-300" style={{ color: theme.text.muted }}>
              Technical requirements, must-haves, deal-breakers
            </p>
          </div>

          {/* Submit */}
          <div className="pt-8 space-y-4">
            <button
              type="submit"
              disabled={!isValid}
              className="w-full font-bold py-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              Almost there! Contact details next →
            </button>
            
            <p className="text-center text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
              {isValid ? 'Looking good! One more step.' : 'Fill in the required fields above'}
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}