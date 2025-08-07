'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '../../design-system'

export default function TestBriefContactPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)
  
  const [formData, setFormData] = useState({
    email: '',
    emailSent: false,
    otp: '',
    isVerifying: false,
  })

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) return
    
    // Simulate OTP send
    setFormData(prev => ({ ...prev, emailSent: true }))
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.otp) return
    
    setFormData(prev => ({ ...prev, isVerifying: true }))
    
    // Simulate verification
    setTimeout(() => {
      router.push('/test-redesign/match')
    }, 1500)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/test-redesign" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="text-sm px-4 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: theme.tagBg, color: theme.text.primary }}>
              Step 3 of 3
            </div>
            
            {/* Theme Toggle */}
            <div className="border-l pl-8" style={{ borderColor: theme.border }}>
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
          </div>
        </div>
      </nav>

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