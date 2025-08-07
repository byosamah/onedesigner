'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { OTPInput, LoadingButton } from '@/components/forms'
import { getTheme } from '@/lib/design-system'

export default function DesignerVerifyPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [otpCode, setOtpCode] = useState('')
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsVerifying(true)
    
    try {
      const email = sessionStorage.getItem('designerEmail')
      const applicationData = sessionStorage.getItem('designerApplication')
      
      if (!email || !applicationData) {
        throw new Error('Application data not found')
      }

      const response = await fetch('/api/designer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          token: otpCode,
          applicationData: JSON.parse(applicationData)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code')
      }
      
      // Clear application data
      sessionStorage.removeItem('designerApplication')
      sessionStorage.removeItem('designerEmail')
      
      // Store designer session
      sessionStorage.setItem('designerId', data.designer.id)
      sessionStorage.setItem('designerName', data.designer.firstName)
      
      // Redirect to success page
      router.push('/designer/apply/success')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid code. Please try again.')
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      const email = sessionStorage.getItem('designerEmail')
      if (!email) return

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setError('')
        setOtpCode('')
        alert('New code sent! Check your email.')
      }
    } catch (error) {
      console.error('Error resending code:', error)
    }
  }

  const email = typeof window !== 'undefined' ? sessionStorage.getItem('designerEmail') : ''

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <Navigation 
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <div className="flex flex-col items-center justify-center px-8 py-16 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-6">✉️</div>
            <h1 className="text-4xl font-extrabold transition-colors duration-300" style={{ color: theme.text.primary }}>
              Check your email! 📬
            </h1>
            <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
              We sent a 6-digit code to
            </p>
            <p className="font-semibold transition-colors duration-300" style={{ color: theme.text.primary }}>
              {email}
            </p>
          </div>

          {/* OTP Input */}
          <div 
            className="rounded-3xl p-8 space-y-6 transition-all duration-300 animate-slideUp"
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <OTPInput
              length={6}
              onComplete={setOtpCode}
              error={error}
              theme={theme}
            />

            {error && (
              <p className="text-center text-sm animate-shake" style={{ color: theme.error }}>
                {error}
              </p>
            )}

            <LoadingButton
              onClick={handleVerify}
              disabled={otpCode.length !== 6}
              loading={isVerifying}
              loadingText="Verifying..."
              variant="primary"
              size="lg"
              theme={theme}
              className="w-full"
            >
              Verify & Join OneDesigner →
            </LoadingButton>

            <button
              onClick={handleResend}
              className="w-full text-sm font-medium transition-colors duration-300 hover:opacity-80"
              style={{ color: theme.text.secondary }}
            >
              Didn't receive it? Send new code
            </button>
          </div>

          {/* Info */}
          <div 
            className="rounded-2xl p-6 text-center space-y-3"
            style={{ backgroundColor: theme.nestedBg }}
          >
            <p className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.primary }}>
              🔒 Why verify your email?
            </p>
            <ul className="text-sm space-y-2" style={{ color: theme.text.secondary }}>
              <li>• Ensures you receive client matches</li>
              <li>• Protects your account from fraud</li>
              <li>• Enables instant notifications</li>
            </ul>
          </div>

          {/* Footer */}
          <p className="text-center text-xs transition-colors duration-300" style={{ color: theme.text.muted }}>
            By verifying, you agree to our terms and privacy policy
          </p>
        </div>
      </div>
    </main>
  )
}