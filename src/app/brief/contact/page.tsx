'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { OTPInput, LoadingButton, FormInput } from '@/components/forms'
import { useTheme } from '@/lib/hooks/useTheme'

export default function BriefContactPage() {
  const router = useRouter()
  const { theme, isDarkMode, toggleTheme } = useTheme()
  
  const [formData, setFormData] = useState({
    email: '',
    emailSent: false,
    otp: '',
    isVerifying: false,
  })

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) return
    
    try {
      // Send OTP to email
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send OTP')
      }

      // Store email and brief data in sessionStorage for OTP verification
      sessionStorage.setItem('userEmail', formData.email)
      sessionStorage.setItem('briefComplete', 'true')
      
      setFormData(prev => ({ ...prev, emailSent: true }))
    } catch (error) {
      console.error('Error sending OTP:', error)
      alert('Failed to send verification code. Please try again.')
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.otp) return
    
    setFormData(prev => ({ ...prev, isVerifying: true }))
    
    try {
      const email = formData.email
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: formData.otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      // Get brief data from sessionStorage
      const briefData = sessionStorage.getItem('briefData')
      if (!briefData) {
        throw new Error('Brief data not found. Please start again.')
      }

      // Submit the brief to create a record
      const briefResponse = await fetch('/api/briefs/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...JSON.parse(briefData),
          client_email: email
        }),
      })

      if (!briefResponse.ok) {
        throw new Error('Failed to submit brief')
      }

      const briefResult = await briefResponse.json()
      
      // Clear sessionStorage
      sessionStorage.removeItem('briefData')
      sessionStorage.removeItem('userEmail')
      sessionStorage.removeItem('briefComplete')

      // Redirect to match page with brief ID
      router.push(`/match/${briefResult.briefId}`)
    } catch (error) {
      console.error('Error verifying OTP:', error)
      alert(error instanceof Error ? error.message : 'Invalid code. Please try again.')
      setFormData(prev => ({ ...prev, isVerifying: false }))
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <Navigation 
        theme={theme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        title="Step 3 of 3"
      />

      <div className="max-w-xl mx-auto px-8 py-16">
        <div className="text-center mb-12 animate-fadeIn">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Last step. Promise.
          </h1>
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            {!formData.emailSent 
              ? "Just need your email to show your match"
              : "Check your inbox for the magic code"
            }
          </p>
        </div>

        <div className="rounded-3xl p-8 transition-all duration-300 animate-slideUp" style={{ 
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {!formData.emailSent ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  Your email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="founder@startup.com"
                  className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 text-lg"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!formData.email}
                className="w-full font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000'
                }}
              >
                Send me the code →
              </button>

              <p className="text-center text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
                No spam. No BS. Just your perfect designer match.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  Enter the 6-digit code from your email
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="123456"
                  className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 text-2xl font-mono text-center tracking-widest"
                  style={{
                    backgroundColor: theme.nestedBg,
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                  autoFocus
                  required
                  maxLength={6}
                />
                <p className="text-sm mt-2 transition-colors duration-300" style={{ color: theme.text.muted }}>
                  Sent to {formData.email}
                </p>
              </div>

              <button
                type="submit"
                disabled={formData.otp.length !== 6 || formData.isVerifying}
                className="w-full font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000'
                }}
              >
                {formData.isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚡</span>
                    Finding your perfect designer...
                  </span>
                ) : (
                  'Show me my match →'
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, emailSent: false, otp: '' }))}
                className="w-full text-sm font-medium transition-colors duration-300"
                style={{ color: theme.text.muted }}
              >
                Wrong email? Go back
              </button>
            </form>
          )}
        </div>

        {/* Trust signals */}
        <div className="mt-16 text-center space-y-6">
          <div className="flex items-center justify-center gap-8 text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Instant matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>94% match accuracy</span>
            </div>
          </div>
          
          <p className="text-xs transition-colors duration-300" style={{ color: theme.text.muted }}>
            By continuing, you agree to our terms and privacy policy
          </p>
        </div>
      </div>
    </main>
  )
}