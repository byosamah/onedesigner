'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo, ThemeToggle } from '@/components/shared'
import { getTheme } from '@/lib/design-system'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-8 right-8">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>

      <div className="text-center space-y-8 animate-fadeIn">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Logo theme={theme} size="large" />
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight transition-colors duration-300" style={{ color: theme.text.primary }}>
            Stop browsing portfolios.
            <br />
            Get your{' '}
            <span 
              className="px-3 py-1 rounded-lg"
              style={{ 
                backgroundColor: theme.accent,
                color: '#000',
                display: 'inline-block',
                transform: 'rotate(-1deg)'
              }}
            >
              perfect match
            </span>
            {' '}instantly.
          </h2>
          <p className="text-xl mt-6 transition-colors duration-300" style={{ color: theme.text.secondary }}>
            One brief. 2,847 designers. 0.3 seconds.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-8">
          <Link
            href="/brief"
            className="min-w-[300px] group font-bold py-6 px-12 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-lg"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            I need a designer
            <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
          </Link>
          
          <Link
            href="/designer/apply"
            className="min-w-[300px] group font-semibold py-6 px-12 rounded-2xl transition-all duration-300 hover:scale-[1.02] relative text-lg"
            style={{ 
              backgroundColor: 'transparent',
              border: '2px solid ' + theme.border,
              color: theme.text.primary
            }}
          >
            I'm a designer
            <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
            <span 
              className="absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full animate-pulse"
              style={{ 
                backgroundColor: isDarkMode ? 'rgba(240, 173, 78, 0.1)' : 'rgba(240, 173, 78, 0.15)',
                color: theme.accent,
                fontSize: '10px',
                backdropFilter: 'blur(10px)'
              }}
            >
              Apply for free
            </span>
          </Link>
        </div>
        
        {/* Steps */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              1. Submit brief
            </h3>
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Tell us what you need in 2 minutes
            </p>
          </div>
          
          <div className="text-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              2. AI matches you
            </h3>
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Perfect designer found in 0.3 seconds
            </p>
          </div>
          
          <div className="text-center animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              3. Start designing
            </h3>
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Direct contact, no platform fees
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-center space-y-4">
        <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
          ✨ 2,847 perfect matches made
        </p>
        <Link
          href="/designer/login"
          className="text-sm transition-colors duration-300 hover:opacity-80"
          style={{ color: theme.text.muted }}
        >
          Designer? Sign in here →
        </Link>
      </div>
    </main>
  )
}