'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { logger } from '@/lib/core/logging-service'

export default function DesignerSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { theme, isDarkMode, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Store email for verification page
      sessionStorage.setItem('designerSignupEmail', email)
      
      // Send OTP to designer-specific endpoint
      const response = await fetch('/api/designer/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isLogin: false }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      // Redirect to verification page
      router.push('/designer/signup/verify')
    } catch (error) {
      logger.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300 animate-fadeIn flex flex-col" style={{ backgroundColor: theme.bg }}>
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
      
      <div className="flex-1 flex items-center justify-center px-8 pb-32">
        <div className="w-full max-w-4xl">
          <div className="animate-slideUp">
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Stop competing. Start earning.
                </h2>
                <p className="text-lg" style={{ color: theme.text.secondary }}>
                  Get matched with clients who already want <span style={{ color: theme.accent }}>you</span>. No pitching required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                    Your work email (we check this)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@studio.design"
                    className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 text-lg"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${error ? theme.error : theme.border}`,
                      color: theme.text.primary,
                    }}
                    autoFocus
                    required
                  />
                  {error && (
                    <p className="text-sm mt-2 animate-shake" style={{ color: theme.error }}>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚡</span>
                      Sending verification code...
                    </span>
                  ) : (
                    'Get Started →'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    Already crushing it with us?{' '}
                    <Link 
                      href="/designer/login" 
                      className="font-medium transition-colors duration-300 hover:opacity-80"
                      style={{ color: theme.accent }}
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Benefits - Marc Lou style */}
            <div className="mt-16 space-y-8">
              <div className="text-center">
                <p className="text-sm font-medium mb-4" style={{ color: theme.text.muted }}>
                  THIS WEEK, 147 DESIGNERS GOT MATCHED
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4 rounded-lg transition-all duration-300 hover:scale-105" style={{ backgroundColor: theme.nestedBg }}>
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-bold mb-1" style={{ color: theme.text.primary }}>$150-500/hr</div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>Average rates</div>
                </div>
                <div className="text-center p-4 rounded-lg transition-all duration-300 hover:scale-105" style={{ backgroundColor: theme.nestedBg }}>
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-bold mb-1" style={{ color: theme.text.primary }}>0% effort</div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>Clients come to you</div>
                </div>
                <div className="text-center p-4 rounded-lg transition-all duration-300 hover:scale-105" style={{ backgroundColor: theme.nestedBg }}>
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold mb-1" style={{ color: theme.text.primary }}>48hr response</div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>Quick decisions</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs" style={{ color: theme.text.muted }}>
                  <strong>Real talk:</strong> We reject 73% of applications. We only want designers who ship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}