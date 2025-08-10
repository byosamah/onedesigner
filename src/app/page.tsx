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
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-8 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-10">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>

      <div className="text-center space-y-8 animate-fadeIn pt-16 sm:pt-0 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Logo theme={theme} size="large" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight transition-colors duration-300" style={{ color: theme.text.primary }}>
            <span className="block">Stop browsing portfolios.</span>
            Get your{' '}
            <span 
              className="px-2 sm:px-3 py-1 rounded-lg text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
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
          <p className="text-base sm:text-lg md:text-xl mt-6 transition-colors duration-300 leading-relaxed" style={{ color: theme.text.secondary }}>
            One brief. 2,847 designers. 0.3 seconds.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-8 px-4">
          <Link
            href="/client/signup"
            className="w-full sm:w-auto group font-bold py-6 sm:py-8 px-8 sm:px-12 lg:px-16 rounded-3xl transition-all duration-300 hover:scale-[1.02] text-lg sm:text-xl shadow-lg hover:shadow-xl text-center"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            <span className="whitespace-nowrap">
              I need a designer
              <span className="inline-block transition-transform group-hover:translate-x-2 ml-2 text-xl sm:text-2xl">→</span>
            </span>
          </Link>
          
          <Link
            href="/designer/signup"
            className="w-full sm:w-auto group font-semibold py-6 sm:py-8 px-8 sm:px-12 lg:px-16 rounded-3xl transition-all duration-300 hover:scale-[1.02] relative text-lg sm:text-xl shadow-lg hover:shadow-xl text-center"
            style={{ 
              backgroundColor: 'transparent',
              border: '3px solid ' + theme.border,
              color: theme.text.primary
            }}
          >
            <span className="whitespace-nowrap">
              I'm a designer
              <span className="inline-block transition-transform group-hover:translate-x-2 ml-2 text-xl sm:text-2xl">→</span>
            </span>
            <span 
              className="absolute -top-3 -right-3 text-xs font-bold px-2 sm:px-3 py-1 sm:py-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: isDarkMode ? 'rgba(240, 173, 78, 0.15)' : 'rgba(240, 173, 78, 0.2)',
                color: theme.accent,
                fontSize: '10px',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.accent}`
              }}
            >
              Apply for free
            </span>
          </Link>
        </div>
        
        {/* Steps */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto px-4">
          <div className="text-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              1. Sign up
            </h3>
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Quick email verification
            </p>
          </div>
          
          <div className="text-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              2. Share your project
            </h3>
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Tell us what you need in 2 minutes
            </p>
          </div>
          
          <div className="text-center animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              3. Meet your designer
            </h3>
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
              AI matches you instantly
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-4 mt-auto pt-16">
        <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
          ✨ 2,847 perfect matches made
        </p>
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/designer/login"
            className="text-sm transition-colors duration-300 hover:opacity-80"
            style={{ color: theme.text.muted }}
          >
            Designer? Sign in here →
          </Link>
          <Link
            href="/client/login"
            className="text-sm transition-colors duration-300 hover:opacity-80"
            style={{ color: theme.text.muted }}
          >
            Client? Sign in here →
          </Link>
        </div>
      </div>
    </main>
  )
}