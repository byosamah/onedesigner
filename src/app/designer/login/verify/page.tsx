'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { OTPInput, LoadingButton } from '@/components/forms'
import { getTheme } from '@/lib/design-system'

export default function DesignerLoginVerifyPage() {
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
      const email = sessionStorage.getItem('designerLoginEmail')
      if (!email) {
        throw new Error('Email not found')
      }

      // First verify the OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code }),
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
        // Designer doesn't exist, show error
        throw new Error('No designer account found with this email')
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
        alert('New code sent! Check your email.')
      }
    } catch (error) {
      console.error('Error resending code:', error)
    }
  }

  const email = typeof window !== 'undefined' ? sessionStorage.getItem('designerLoginEmail') : ''

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
            <div className="text-6xl mb-8">🎨</div>
            <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              Verify your identity ✨
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
                loadingText="Verifying..."
                theme={theme}
                disabled={isVerifying}
              >
                Access Dashboard 🚀
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