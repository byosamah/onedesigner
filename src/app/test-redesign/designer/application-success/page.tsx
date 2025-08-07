'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTheme } from '../../design-system'

export default function TestDesignerApplicationSuccess() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <main className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
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

      {/* Success Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="animate-fadeIn">
            <div className="text-6xl mb-8 animate-bounce">🎉</div>
            <h1 className="text-5xl font-extrabold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Application submitted!
            </h1>
            <p className="text-xl mb-12 transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Now the fun part: we review your awesomeness
            </p>
          </div>

          <div 
            className="rounded-3xl p-8 mb-12 text-left animate-slideUp"
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
              What happens next? 🚀
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Our team reviews your portfolio (24-48 hours)
                  </h3>
                  <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                    We look for quality work, clear communication, and designers who ship
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    You'll get an email (accepted or feedback)
                  </h3>
                  <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                    We accept 27% of applicants. If not this time, we'll tell you why
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Start getting matched immediately
                  </h3>
                  <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                    Once approved, expect 5-10 quality matches per week
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div 
            className="grid grid-cols-3 gap-6 mb-12 animate-slideUp"
            style={{ animationDelay: '0.2s' }}
          >
            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ backgroundColor: theme.nestedBg }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>73%</div>
              <div className="text-sm" style={{ color: theme.text.muted }}>Rejection rate</div>
              <div className="text-xs mt-1" style={{ color: theme.text.secondary }}>We're picky</div>
            </div>
            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ backgroundColor: theme.nestedBg }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>$180</div>
              <div className="text-sm" style={{ color: theme.text.muted }}>Avg hourly rate</div>
              <div className="text-xs mt-1" style={{ color: theme.text.secondary }}>Get paid well</div>
            </div>
            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ backgroundColor: theme.nestedBg }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: theme.accent }}>0%</div>
              <div className="text-sm" style={{ color: theme.text.muted }}>Platform fees</div>
              <div className="text-xs mt-1" style={{ color: theme.text.secondary }}>Keep it all</div>
            </div>
          </div>

          {/* Pro tip */}
          <div 
            className="rounded-2xl p-6 mb-8 text-left animate-slideUp"
            style={{ 
              backgroundColor: isDarkMode ? '#2A2A2A' : '#FEF3C7',
              animationDelay: '0.3s'
            }}
          >
            <h4 className="font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              💡 Pro tip while you wait
            </h4>
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Polish your portfolio! Add 2-3 recent case studies with clear problem → solution → results. 
              Designers with detailed case studies get 3x more matches.
            </p>
          </div>

          {/* CTA */}
          <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/test-redesign"
              className="inline-block font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] mb-4"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Back to Homepage →
            </Link>
            
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
              We'll email you at the address you provided
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}