'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { OTPInput, LoadingButton } from '@/components/forms'
import { useTheme } from '@/lib/hooks'
import { adminAuthService } from '@/lib/api'
import { handleError } from '@/lib/errors'

export default function AdminVerifyPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const { theme, isDarkMode, toggleTheme } = useTheme()

  const handleVerify = async (code: string) => {
    setError('')
    setIsVerifying(true)
    
    try {
      const email = sessionStorage.getItem('adminEmail')
      if (!email) {
        throw new Error('Email not found. Please go back and enter your email again.')
      }

      const response = await adminAuthService.verifyOTP({ email, token: code })

      if (!response.success) {
        throw new Error(response.error || 'Invalid code')
      }
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } catch (error) {
      const appError = handleError(error, false) // Don't show toast, we'll show inline error
      setError(appError.message)
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      const email = sessionStorage.getItem('adminEmail')
      if (!email) return

      const response = await fetch('/api/admin/auth/send-otp', {
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

  const email = typeof window !== 'undefined' ? sessionStorage.getItem('adminEmail') : ''

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
            <div className="text-6xl mb-8">🔐</div>
            <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              Admin Access ⚡
            </h1>
            <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Check your email for the 6-digit code sent to <span className="font-medium" style={{ color: theme.accent }}>{email}</span>
            </p>
          </div>

          <div className="space-y-10">
            <OTPInput 
              theme={theme}
              error={error}
              onComplete={handleVerify}
            />

            <div className="flex justify-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <button
                disabled={isVerifying}
                className="font-bold py-4 px-12 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                {isVerifying ? 'Accessing admin panel...' : 'Verify & Enter'} 🔓
              </button>
            </div>

            <div className="text-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={handleResend}
                className="text-sm transition-colors duration-300 hover:opacity-80 font-medium"
                style={{ color: theme.text.secondary }}
              >
                Didn&apos;t receive it? Resend code
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}