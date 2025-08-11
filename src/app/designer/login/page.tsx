'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton, FormInput } from '@/components/forms'
import { useTheme } from '@/lib/hooks'
import { authService } from '@/lib/api'
import { handleError } from '@/lib/errors'

export default function DesignerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { theme, isDarkMode, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Send OTP with isLogin flag to check if designer exists
      const response = await fetch('/api/designer/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isLogin: true })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      // Store email for verification
      sessionStorage.setItem('designerLoginEmail', email)
      
      // Redirect to OTP verification
      router.push('/designer/login/verify')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setError(errorMessage)
      handleError(error)
      setIsSubmitting(false)
    }
  }

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
        <div className="w-full max-w-md space-y-12 animate-slideUp">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-8">🎨</div>
          <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            Welcome back, designer! 😎
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Ready to see who wants to hire you?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="animate-slideUp">
            <label className="block text-sm font-semibold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Your email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="designer@example.com"
              className="w-full px-6 py-4 text-center text-lg rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.nestedBg,
                border: `2px solid ${error ? theme.error : theme.border}`,
                color: theme.text.primary,
                focusRingColor: theme.accent
              }}
              required
              autoFocus
            />
            {error && (
              <div className="mt-3 p-4 rounded-lg animate-slideUp" style={{ 
                backgroundColor: `${theme.error}15`,
                border: `1px solid ${theme.error}40`
              }}>
                <p className="text-sm font-medium" style={{ color: theme.error }}>
                  {error}
                </p>
                {error.includes('No designer account found') && (
                  <Link 
                    href="/designer/signup" 
                    className="inline-block mt-2 text-sm font-semibold underline hover:opacity-80 transition-opacity"
                    style={{ color: theme.accent }}
                  >
                    Sign up as a designer →
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Sending magic link..."
              disabled={!email}
              theme={theme}
            >
              Send Login Code ✨
            </LoadingButton>
          </div>
        </form>

        <div className="text-center space-y-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Don't have an account?{' '}
            <Link 
              href="/designer/apply" 
              className="font-medium transition-colors duration-300 hover:opacity-80"
              style={{ color: theme.accent }}
            >
              Apply as a designer
            </Link>
          </p>
        </div>
        </div>
      </div>
    </main>
  )
}