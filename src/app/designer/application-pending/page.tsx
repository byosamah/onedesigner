'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'
import { validateSession } from '@/lib/auth/session-handlers'

export default function ApplicationPendingPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [designerName, setDesignerName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  useEffect(() => {
    checkDesignerStatus()
  }, [])

  const checkDesignerStatus = async () => {
    try {
      // Check if designer is authenticated
      const response = await fetch('/api/designer/check', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        // Not authenticated, redirect to login
        router.push('/designer/login')
        return
      }

      const data = await response.json()
      
      if (data.designer) {
        setDesignerName(data.designer.first_name || data.designer.email)
        
        // If already approved, redirect to dashboard
        if (data.designer.is_approved) {
          router.push('/designer/dashboard')
          return
        }
        
        // If profile is incomplete, redirect to application
        if (!data.designer.first_name || !data.designer.portfolio_url) {
          router.push('/designer/apply')
          return
        }
      }
    } catch (error) {
      console.error('Error checking designer status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    // Clear designer session
    document.cookie = 'designer-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="animate-spin text-4xl">⚡</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300 animate-fadeIn" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4 border-b" style={{ borderColor: theme.border }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
          <div className="flex items-center gap-4">
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

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-300 hover:opacity-80"
              style={{ color: theme.text.secondary }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-8 py-20">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-8 animate-slideUp">
            {/* Status Icon */}
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full flex items-center justify-center animate-pulse" 
                   style={{ backgroundColor: theme.nestedBg }}>
                <span className="text-6xl">⏳</span>
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold" style={{ color: theme.text.primary }}>
                Application Under Review
              </h1>
              <p className="text-xl" style={{ color: theme.text.secondary }}>
                Thank you for applying, {designerName}!
              </p>
            </div>

            {/* Status Card */}
            <div className="rounded-2xl p-8 space-y-6" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }}></div>
                  <p className="text-lg font-medium" style={{ color: theme.text.primary }}>
                    Your application has been successfully submitted
                  </p>
                </div>
                
                <p style={{ color: theme.text.secondary }}>
                  Our team is carefully reviewing your portfolio and qualifications. 
                  We typically respond within <strong>24-48 hours</strong>.
                </p>
              </div>

              {/* What happens next */}
              <div className="space-y-3 text-left">
                <p className="font-semibold" style={{ color: theme.text.primary }}>
                  What happens next?
                </p>
                <ul className="space-y-2" style={{ color: theme.text.secondary }}>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>We'll review your portfolio and experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>You'll receive an email notification once approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Once approved, you'll get access to your designer dashboard</span>
                  </li>
                </ul>
              </div>

              {/* Email notification reminder */}
              <div className="rounded-xl p-4" style={{ backgroundColor: theme.nestedBg }}>
                <p className="text-sm" style={{ color: theme.text.muted }}>
                  📧 We'll send updates to the email address you used to apply. 
                  Please check your inbox (and spam folder) regularly.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/designer/profile"
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  backgroundColor: theme.nestedBg,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border}`
                }}
              >
                Edit Application
              </Link>
              
              <Link
                href="/"
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:opacity-80"
                style={{ color: theme.text.secondary }}
              >
                Return to Homepage
              </Link>
            </div>

            {/* Support */}
            <div className="pt-8 border-t" style={{ borderColor: theme.border }}>
              <p className="text-sm" style={{ color: theme.text.muted }}>
                Have questions? Contact us at{' '}
                <a href="mailto:hello@onedesigner.app" className="underline hover:opacity-80" style={{ color: theme.accent }}>
                  hello@onedesigner.app
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}