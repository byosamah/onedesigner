'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo, ThemeToggle } from '@/components/shared'
import { getTheme } from '@/lib/design-system'

export default function DesignerSuccessPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <div className="absolute top-8 left-8">
        <Logo theme={theme} />
      </div>
      
      {/* Theme Toggle */}
      <div className="absolute top-8 right-8">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
      
      <div className="w-full max-w-lg space-y-12 animate-fadeIn text-center">
        <div className="space-y-6">
          <div className="text-8xl mb-8">🚀</div>
          
          <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            You're in! Welcome aboard 🎉
          </h1>
          
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Your application rocks. We're pumped to have you!
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl p-8 text-left space-y-6 transition-colors duration-300" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
            <h2 className="font-bold text-lg transition-colors duration-300" style={{ color: theme.text.primary }}>What happens next?</h2>
            
            <div className="space-y-6">
              {[
                {
                  emoji: '🔍',
                  title: 'Portfolio Review (24 hours)',
                  desc: 'Our team checks your work to make sure it\'s awesome'
                },
                {
                  emoji: '📧',
                  title: 'Email Confirmation',
                  desc: 'You\'ll get the good news straight to your inbox'
                },
                {
                  emoji: '💰', 
                  title: 'Start Earning',
                  desc: 'Clients will find you, no hunting for work needed'
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-4 animate-slideUp" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl" style={{ backgroundColor: theme.accent }}>
                    {step.emoji}
                  </div>
                  <div>
                    <p className="font-semibold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>{step.title}</p>
                    <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/designer/login" 
              className="font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Check Your Dashboard ✨
            </Link>
            <Link 
              href="/" 
              className="font-medium py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                backgroundColor: 'transparent',
                border: `2px solid ${theme.border}`,
                color: theme.text.primary
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
          <p>Questions? We're here to help → hello@onedesigner.io</p>
        </div>
      </div>
    </main>
  )
}