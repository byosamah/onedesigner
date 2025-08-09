'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { EnhancedClientBrief } from '@/components/forms/EnhancedClientBrief'

interface ClientBriefData {
  // Project Basics
  design_category: string
  project_description: string
  timeline_type: string
  budget_range: string
  
  // Project Details
  deliverables: string[]
  target_audience: string
  project_goal: string
  design_style_keywords: string[]
  design_examples: string[]
  avoid_colors_styles: string
  
  // Working Preferences
  involvement_level: string
  communication_preference: string
  previous_designer_experience: string
  has_brand_guidelines: boolean
}

export default function BriefPage() {
  const router = useRouter()
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const [showAuth, setShowAuth] = useState(false)
  const [briefData, setBriefData] = useState<ClientBriefData | null>(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const handleBriefSubmit = async (data: ClientBriefData) => {
    // Store brief data and show authentication
    setBriefData(data)
    setShowAuth(true)
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send OTP')
      }

      setOtpSent(true)
    } catch (error) {
      console.error('Error sending OTP:', error)
      alert('Failed to send verification code. Please try again.')
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !briefData) return
    
    setIsVerifying(true)
    
    try {
      // First verify OTP
      const authResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      })

      if (!authResponse.ok) {
        const data = await authResponse.json()
        throw new Error(data.error || 'Invalid code')
      }

      // Then submit brief with email
      console.log('📝 Submitting brief data:', briefData)
      const briefResponse = await fetch('/api/briefs/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...briefData,
          client_email: email
        }),
      })

      console.log('📝 Brief response status:', briefResponse.status)
      
      if (!briefResponse.ok) {
        const errorData = await briefResponse.json()
        console.error('❌ Brief submission error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to submit brief')
      }

      const briefResult = await briefResponse.json()
      console.log('✅ Brief created successfully:', briefResult)
      const briefId = briefResult.briefId || briefResult.brief?.id

      if (!briefId) {
        console.error('❌ No briefId in response:', briefResult)
        throw new Error('Brief created but no ID returned')
      }

      console.log('🎯 Redirecting to match page with briefId:', briefId)
      // Redirect to AI matching page
      router.push(`/match/${briefId}`)

    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Something went wrong')
      setIsVerifying(false)
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
          {/* Show authentication after brief completion */}
          {showAuth ? (
            <div className="animate-slideUp">
              <div className="max-w-xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Last step. Promise.
                </h2>
                <p className="text-lg" style={{ color: theme.text.secondary }}>
                  {!otpSent 
                    ? "Just need your email to show your match"
                    : "Check your inbox for the magic code"
                  }
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Your email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@startup.com"
                      className="w-full px-6 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 text-lg"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                      }}
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!email}
                    className="w-full font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    style={{
                      backgroundColor: theme.accent,
                      color: '#000'
                    }}
                  >
                    Send me the code →
                  </button>

                  <p className="text-center text-sm" style={{ color: theme.text.muted }}>
                    No spam. No BS. Just your perfect designer match.
                  </p>
                </form>
              ) : (
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
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                      }}
                      autoFocus
                      required
                      maxLength={6}
                    />
                    <p className="text-sm mt-2" style={{ color: theme.text.muted }}>
                      Sent to {email}
                    </p>
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
                        Finding your perfect designer...
                      </span>
                    ) : (
                      'Show me my match →'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp('') }}
                    className="w-full text-sm font-medium transition-colors duration-300"
                    style={{ color: theme.text.muted }}
                  >
                    Wrong email? Go back
                  </button>
                </form>
              )}
            </div>

            {/* Trust signals */}
            <div className="mt-12 text-center space-y-6">
              <div className="flex items-center justify-center gap-8 text-sm" style={{ color: theme.text.muted }}>
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
            </div>
          </div>
        ) : (
          /* Enhanced Brief Form */
          <>
            <div className="mb-8 text-center animate-slideUp">
              <h1 className="text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
                Find Your Perfect Designer
              </h1>
              <p className="text-lg" style={{ color: theme.text.secondary }}>
                Answer a few questions to get matched with the perfect designer for your project
              </p>
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <EnhancedClientBrief
                isDarkMode={isDarkMode}
                onSubmit={handleBriefSubmit}
              />
            </div>
          </>
        )}
        </div>
      </div>
    </main>
  )
}