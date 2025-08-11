'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'

export default function DesignerLoginVerifyPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [otp, setOtp] = useState('')
  const theme = getTheme(isDarkMode)
  
  const [email, setEmail] = useState('')
  
  // Load email from sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('designerLoginEmail')
    if (storedEmail) setEmail(storedEmail)
  }, [])

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return
    
    setIsVerifying(true)
    
    try {
      const email = sessionStorage.getItem('designerLoginEmail')
      if (!email) {
        throw new Error('Email not found')
      }

      // First verify the OTP (isSignup: false for login)
      const response = await fetch('/api/designer/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp, isSignup: false }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      // Then check if designer exists
      const designerResponse = await fetch('/api/designer/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      })

      const designerData = await designerResponse.json()

      if (designerResponse.ok && designerData.exists) {
        // Designer exists, redirect to dashboard
        sessionStorage.setItem('designerId', designerData.designer.id)
        router.push('/designer/dashboard')
      } else {
        // Designer doesn't exist, redirect to apply page
        sessionStorage.setItem('designerEmail', email)
        alert('No designer account found. Please complete your designer application first.')
        router.push('/designer/apply')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid code. Please try again.')
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      const email = sessionStorage.getItem('designerLoginEmail')
      if (!email) return

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setError('')
        setOtp('')
        alert('New code sent! Check your email.')
      }
    } catch (error) {
      console.error('Error resending code:', error)
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
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Welcome back, designer.
                </h2>
                <p className="text-lg" style={{ color: theme.text.secondary }}>
                  Check your inbox for the magic code
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                    Enter the 6-digit code from your email
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
                  <p className="text-sm mt-2" style={{ color: theme.text.muted }}>
                    Sent to {email}
                  </p>
                  {error && (
                    <p className="text-sm mt-2 animate-shake" style={{ color: theme.error }}>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otp.length !== 6 || isVerifying}
                  className="w-full font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚡</span>
                      Verifying your identity...
                    </span>
                  ) : (
                    'Access Dashboard 🚀'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full text-sm font-medium transition-colors duration-300 hover:opacity-80"
                  style={{ color: theme.text.muted }}
                >
                  Didn't receive it? Send new code
                </button>
              </form>
            </div>

            {/* Trust signals */}
            <div className="mt-12 text-center space-y-6">
              <div className="flex items-center justify-center gap-8 text-sm" style={{ color: theme.text.muted }}>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure login</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Designer dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>Manage your profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}