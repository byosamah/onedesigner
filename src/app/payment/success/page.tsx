'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo, ThemeToggle } from '@/components/shared'
import { useTheme } from '@/lib/hooks/useTheme'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [lastBriefId, setLastBriefId] = useState<string | null>(null)
  const { theme, isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    // Get the last brief ID from sessionStorage
    const briefId = sessionStorage.getItem('currentBriefId')
    if (briefId) {
      setLastBriefId(briefId)
    }
    
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false)
    }, 2000)
  }, [])

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
        {isVerifying ? (
          <div className="space-y-6">
            <div className="text-8xl animate-pulse">🔄</div>
            <h1 className="text-3xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              Processing your payment...
            </h1>
            <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Hang tight while we confirm everything
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-8xl mb-6">💰</div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                Boom! Payment successful! 🎉
              </h1>
              <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Your credits are locked and loaded
              </p>
            </div>

            <div className="rounded-3xl p-8 space-y-6 transition-colors duration-300" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
              <h2 className="font-bold text-lg transition-colors duration-300" style={{ color: theme.text.primary }}>
                You're all set! Here's what happens now:
              </h2>
              <div className="text-left space-y-4">
                {[
                  { emoji: '✨', text: 'Credits added to your account instantly' },
                  { emoji: '📧', text: 'Receipt sent to your email' },
                  { emoji: '🎯', text: 'Ready to unlock your perfect matches' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 animate-slideUp" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.accent }}>
                      <span className="text-lg">{item.emoji}</span>
                    </div>
                    <p className="flex-1 pt-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={lastBriefId ? `/match/${lastBriefId}` : "/client/dashboard"} 
                className="font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                View Your Match ✨
              </Link>
              <Link 
                href="/client/dashboard" 
                className="font-medium py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  backgroundColor: 'transparent',
                  border: `2px solid ${theme.border}`,
                  color: theme.text.primary
                }}
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}