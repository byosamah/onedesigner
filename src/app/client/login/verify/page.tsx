'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'
import { logger } from '@/lib/core/logging-service'

export default function ClientVerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('clientLoginEmail')
    if (!storedEmail) {
      router.push('/client/login')
      return
    }
    setEmail(storedEmail)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code')
      }

      if (data.success) {
        // Clear storage
        sessionStorage.removeItem('clientLoginEmail')
        
        // Redirect to client dashboard
        router.push('/client/dashboard')
      }
    } catch (error) {
      logger.error('Verification error:', error)
      setError(error instanceof Error ? error.message : 'Invalid or expired code')
      setOtp('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      // Clear OTP field
      setOtp('')
      
      // Show success message
      setError('New code sent! Check your email.')
      setTimeout(() => setError(''), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend code')
    } finally {
      setIsResending(false)
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
                <div className="text-6xl mb-4">📧</div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Check your email! 🚀
                </h2>
                <p className="text-lg" style={{ color: theme.text.secondary }}>
                  We sent a 6-digit code to
                </p>
                <p className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                  {email}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                    Enter your verification code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 text-2xl font-mono text-center tracking-widest"
                    style={{
                      backgroundColor: theme.nestedBg,
                      border: `2px solid ${error ? theme.error : theme.border}`,
                      color: theme.text.primary,
                    }}
                    autoFocus
                    required
                    maxLength={6}
                  />
                  {error && (
                    <p className="text-sm mt-2 animate-shake" style={{ color: error.includes('sent') ? theme.success : theme.error }}>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otp.length !== 6 || isSubmitting}
                  className="w-full font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚡</span>
                      Verifying...
                    </span>
                  ) : (
                    'Continue to Dashboard'
                  )}
                </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-sm font-medium transition-colors duration-300 hover:opacity-80 disabled:opacity-50"
                    style={{ color: theme.accent }}
                  >
                    {isResending ? 'Sending...' : "Didn't receive the code? Resend code"}
                  </button>
                  
                  <div>
                    <Link 
                      href="/client/login" 
                      className="text-sm transition-colors duration-300 hover:opacity-80"
                      style={{ color: theme.text.muted }}
                    >
                      ← Back to login
                    </Link>
                  </div>
                </div>
              </form>
            </div>

            {/* Trust signals */}
            <div className="mt-12 text-center space-y-6">
              <div className="flex items-center justify-center gap-8 text-sm" style={{ color: theme.text.muted }}>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Premium matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>AI-powered platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}