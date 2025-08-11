'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { EnhancedClientBrief } from '@/components/forms/EnhancedClientBrief'
import { logger } from '@/lib/core/logging-service'

export default function BriefPage() {
  const router = useRouter()
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [clientEmail, setClientEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for client session
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        logger.info('🔍 Auth check response:', data)
        
        if (data.authenticated && data.user?.email) {
          setIsAuthenticated(true)
          setClientEmail(data.user.email)
          setIsLoading(false)
        } else {
          logger.info('❌ Not authenticated, redirecting to signup')
          // Small delay to avoid race conditions
          setTimeout(() => {
            router.push('/client/signup')
          }, 100)
        }
      } catch (error) {
        logger.error('Auth check error:', error)
        setTimeout(() => {
          router.push('/client/signup')
        }, 100)
      }
    }
    
    checkAuth()
  }, [router])

  const handleBriefSubmit = async (briefData: any) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Log the data being sent to help debug
      logger.info('Submitting brief data:', briefData)
      
      // Submit brief with authenticated client email
      const response = await fetch('/api/briefs/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...briefData,
          client_email: clientEmail
        }),
      })

      const result = await response.json()
      
      // Log the response for debugging
      logger.info('API Response:', { status: response.status, ok: response.ok, result })
      
      if (response.ok && result.briefId) {
        // Redirect to match finding page
        router.push(`/match/${result.briefId}`)
      } else {
        // More detailed error message
        const errorMsg = result.error || result.message || 'Failed to create brief'
        logger.error('Brief submission failed:', { status: response.status, error: errorMsg, result })
        throw new Error(errorMsg)
      }
    } catch (error) {
      logger.error('Brief submission error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit brief. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <main className="min-h-screen transition-colors duration-300 flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚡</div>
          <p style={{ color: theme.text.secondary }}>Loading...</p>
        </div>
      </main>
    )
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
          
          <div className="flex items-center gap-4">
            {/* User indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: theme.nestedBg }}>
              <span className="text-xs" style={{ color: theme.text.muted }}>Signed in as</span>
              <span className="text-sm font-medium" style={{ color: theme.text.primary }}>{clientEmail}</span>
            </div>
            
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
        </div>
      </nav>
      
      {/* Progress indicator */}
      <div className="max-w-6xl mx-auto px-8 py-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.accent }}></div>
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.accent }}></div>
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.border }}></div>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: theme.text.muted }}>
          Step 2 of 3: Tell us about your project
        </p>
      </div>
      
      {/* Brief Form */}
      <div className="flex-1 px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <EnhancedClientBrief 
            onSubmit={handleBriefSubmit}
            theme={theme}
            isDarkMode={isDarkMode}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </main>
  )
}