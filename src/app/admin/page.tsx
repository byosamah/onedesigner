'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton, FormInput } from '@/components/forms'
import { useTheme } from '@/lib/hooks'
import { adminAuthService } from '@/lib/api'
import { handleError } from '@/lib/errors'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { theme, isDarkMode, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await adminAuthService.sendOTP(email)

      if (!response.success) {
        throw new Error(response.error || 'Failed to send OTP')
      }

      // Store email for verification
      sessionStorage.setItem('adminEmail', email)
      
      // Redirect to OTP verification
      router.push('/admin/verify')
    } catch (error) {
      handleError(error)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation component */}
      <Navigation 
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Login Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🛡️</div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Admin Access Only
            </h1>
            <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Sign in to manage OneDesigner
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
            <div className="rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300" style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <FormInput
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="osamah96@gmail.com"
                required
                autoFocus
                theme={theme}
              />

              <LoadingButton
                type="submit"
                disabled={!email}
                loading={isSubmitting}
                loadingText="Sending code..."
                variant="primary"
                size="lg"
                theme={theme}
                className="w-full mt-6"
              >
                Send login code →
              </LoadingButton>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
              🔒 Admin access only • Bank-level security
            </p>
            <Link 
              href="/"
              className="text-sm font-medium transition-colors duration-300 hover:opacity-80"
              style={{ color: theme.accent }}
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}