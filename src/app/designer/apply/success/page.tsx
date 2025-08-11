'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'

export default function ApplicationSuccessPage() {
  const router = useRouter()
  const theme = getTheme(true) // You can add dark mode state management if needed

  useEffect(() => {
    // Redirect to pending page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/designer/application-pending')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center animate-fadeIn" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-2xl w-full px-8">
        <div className="text-center space-y-8 animate-slideUp">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center animate-bounce" 
                 style={{ backgroundColor: theme.success }}>
              <span className="text-6xl">✓</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold" style={{ color: theme.text.primary }}>
              Application Submitted!
            </h1>
            <p className="text-xl" style={{ color: theme.text.secondary }}>
              Thank you for applying to become a OneDesigner partner
            </p>
          </div>

          {/* What's Next */}
          <div className="rounded-2xl p-8 space-y-4" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
            <h2 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>
              What happens next?
            </h2>
            <ul className="space-y-3 text-left max-w-md mx-auto" style={{ color: theme.text.secondary }}>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">1.</span>
                <span>Our team will review your portfolio and experience within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">2.</span>
                <span>You'll receive an email notification once your application is approved</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">3.</span>
                <span>Start receiving matched projects from clients looking for your expertise</span>
              </li>
            </ul>
          </div>

          {/* Redirect Notice */}
          <p className="text-sm animate-pulse" style={{ color: theme.text.muted }}>
            Redirecting to your application status page in 3 seconds...
          </p>

          {/* Manual Link */}
          <Link
            href="/designer/application-pending"
            className="inline-block px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            View Application Status
          </Link>
        </div>
      </div>
    </main>
  )
}