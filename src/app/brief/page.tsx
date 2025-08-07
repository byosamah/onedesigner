'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { PROJECT_TYPES } from '@/lib/constants'
import { getTheme } from '@/lib/design-system'

// Add the 'other' option to project types
const projectTypesWithOther = [
  ...PROJECT_TYPES.map(type => ({ ...type, description: type.emoji + ' ' + type.label })),
  { id: 'other', label: 'Something else', emoji: '✨', description: 'Tell us what you need' },
]

export default function BriefPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('')
  const [customType, setCustomType] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleContinue = () => {
    if (selectedType || customType) {
      const projectType = selectedType === 'other' ? customType : selectedType
      router.push(`/brief/details?type=${encodeURIComponent(projectType)}`)
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation with title */}
      <Navigation 
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        title="Step 1 of 3"
      />

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
          {projectTypesWithOther.map((type, index) => (
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
                <div className="text-3xl">{type.emoji}</div>
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
          <LoadingButton
            onClick={handleContinue}
            disabled={!selectedType && !customType}
            variant="primary"
            size="lg"
            theme={theme}
          >
            Next: Tell us more →
          </LoadingButton>
          
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