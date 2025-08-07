'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '../design-system'

const projectTypes = [
  { id: 'brand-identity', label: 'Brand Identity', icon: '🎨', description: 'Logo, colors, the whole vibe' },
  { id: 'web-design', label: 'Web Design', icon: '🌐', description: 'Landing pages that convert' },
  { id: 'app-design', label: 'App Design', icon: '📱', description: 'Mobile apps users love' },
  { id: 'dashboard', label: 'Dashboard/SaaS', icon: '📊', description: 'Complex UIs made simple' },
  { id: 'marketing', label: 'Marketing Design', icon: '📢', description: 'Ads, social, emails' },
  { id: 'other', label: 'Something else', icon: '✨', description: 'Tell us what you need' },
]

export default function TestBriefPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('')
  const [customType, setCustomType] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const handleContinue = () => {
    if (selectedType || customType) {
      const projectType = selectedType === 'other' ? customType : selectedType
      router.push(`/test-redesign/brief/details?type=${encodeURIComponent(projectType)}`)
    }
  }

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
              Step 1 of 3
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

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Let's find your perfect designer
          </h1>
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            First things first. What needs designing?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {projectTypes.map((type, index) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id)
                setCustomType('')
              }}
              className={`p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-left group animate-slideUp`}
              style={{
                backgroundColor: selectedType === type.id ? theme.accent : theme.cardBg,
                border: `2px solid ${selectedType === type.id ? theme.accent : theme.border}`,
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{type.icon}</div>
                {selectedType === type.id && (
                  <div className="text-xl" style={{ color: '#000' }}>✓</div>
                )}
              </div>
              <div className="font-bold text-lg mb-1 transition-colors duration-300" 
                style={{ color: selectedType === type.id ? '#000' : theme.text.primary }}>
                {type.label}
              </div>
              <div className="text-sm transition-colors duration-300" 
                style={{ color: selectedType === type.id ? '#000' : theme.text.muted }}>
                {type.description}
              </div>
            </button>
          ))}
        </div>

        {selectedType === 'other' && (
          <div className="mb-8 animate-slideUp">
            <input
              type="text"
              placeholder="Tell us what you need designed..."
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.border}`,
                color: theme.text.primary,
                focusRingColor: theme.accent
              }}
              autoFocus
            />
            <p className="text-sm mt-2 transition-colors duration-300" style={{ color: theme.text.muted }}>
              Be specific. "Fintech dashboard" beats "website design"
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mt-12">
          <button
            onClick={handleContinue}
            disabled={!selectedType && !customType}
            className="font-bold py-4 px-12 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Next: Tell us more →
          </button>
          
          <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
            2 minutes to your perfect match
          </p>
        </div>

        {/* Trust Signals */}
        <div className="mt-20 pt-12" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: theme.accent }}>2,847</div>
              <div className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Pre-vetted designers
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: theme.accent }}>0.3s</div>
              <div className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                AI matching speed
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: theme.accent }}>48hr</div>
              <div className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Start guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}