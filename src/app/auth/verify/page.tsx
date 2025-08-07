'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { OTPInput, LoadingButton } from '@/components/forms'
import { getTheme } from '@/lib/design-system'

export default function VerifyPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleVerify = async (code: string) => {
    setError('')
    setIsVerifying(true)
    
    try {
      const email = sessionStorage.getItem('userEmail')
      if (!email) {
        throw new Error('Email not found')
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code')
      }
      
      // Store user data
      sessionStorage.setItem('userId', data.user.id)
      sessionStorage.setItem('clientId', data.client?.id)
      
      // Redirect to match page (brief will be created there)
      router.push('/match')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid code. Please try again.')
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      const email = sessionStorage.getItem('userEmail')
      if (!email) return

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setError('')
        alert('New code sent! Check your email.')
      }
    } catch (error) {
      console.error('Error resending code:', error)
    }
  }

  const email = typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : ''

  return (
    <main className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <div className="absolute top-0 left-0 right-0">
        <Navigation 
          theme={theme}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-12 animate-fadeIn">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-8">📬</div>
            <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              Check your email ✨
            </h1>
            <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
              We sent a 6-digit code to <span className="font-medium" style={{ color: theme.accent }}>{email}</span>
            </p>
          </div>

          <div className="space-y-10">
            <OTPInput 
              theme={theme}
              error={error}
              onComplete={handleVerify}
            />

            <div className="flex justify-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <LoadingButton
                loading={isVerifying}
                loadingText="Finding your match..."
                theme={theme}
              >
                Verify & See Match <span className="ml-2">✨</span>
              </LoadingButton>
            </div>

            <div className="text-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={handleResend}
                className="text-sm transition-colors duration-300 hover:opacity-80 font-medium"
                style={{ color: theme.text.secondary }}
              >
                Didn't receive it? Resend code
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}