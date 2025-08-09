'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'

export default function ClientVerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    // Focus on the next empty field or the last field
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    const inputToFocus = document.getElementById(`otp-${focusIndex}`)
    inputToFocus?.focus()
    
    // Auto-submit if all fields are filled
    if (newOtp.every(digit => digit !== '')) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleSubmit = async (otpValue?: string) => {
    const code = otpValue || otp.join('')
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code }),
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
      console.error('Verification error:', error)
      setError(error instanceof Error ? error.message : 'Invalid or expired code')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
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

      // Clear OTP fields
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
      
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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/>
            <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
            <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
          </svg>
          OneDesigner
        </Link>
      </div>
      
      {/* Theme Toggle */}
      <div className="absolute top-8 right-8">
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
      
      <div className="w-full max-w-lg space-y-12 animate-fadeIn">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-8 animate-pulse">📧</div>
          
          <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            Check your email! 🚀
          </h1>
          
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            We sent a 6-digit code to<br />
            <span className="font-semibold" style={{ color: theme.text.primary }}>{email}</span>
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-8">
          <div className="animate-slideUp">
            <label className="block text-sm font-semibold mb-4 text-center transition-colors duration-300" style={{ color: theme.text.primary }}>
              Enter your verification code
            </label>
            
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-110"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${error ? theme.error : theme.border}`,
                    color: theme.text.primary,
                    '--tw-ring-color': theme.accent
                  } as any}
                  disabled={isSubmitting}
                />
              ))}
            </div>
            
            {error && (
              <p className="text-sm text-center mt-4 animate-slideUp" style={{ color: error.includes('sent') ? theme.success : theme.error }}>
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <button
              type="submit"
              disabled={isSubmitting || otp.some(digit => !digit)}
              className="font-bold py-4 px-12 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              {isSubmitting ? 'Verifying...' : 'Continue to Dashboard'}
            </button>
          </div>
        </form>

        <div className="text-center space-y-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Didn't receive the code?{' '}
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="font-medium transition-colors duration-300 hover:opacity-80 disabled:opacity-50"
              style={{ color: theme.accent }}
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          </p>
          
          <Link 
            href="/client/login" 
            className="text-sm transition-colors duration-300 hover:opacity-80"
            style={{ color: theme.text.muted }}
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}