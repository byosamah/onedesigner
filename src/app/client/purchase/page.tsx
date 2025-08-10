'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { PRICING_PACKAGES } from '@/lib/constants'
import { useTheme, useAuth } from '@/lib/hooks'
import { paymentService } from '@/lib/api'
import { handleError } from '@/lib/errors'

export default function PurchasePage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  
  // Log authentication status
  useEffect(() => {
    console.log('🔐 Purchase page - isAuthenticated:', isAuthenticated)
  }, [isAuthenticated])

  const handlePurchase = async (packageId: string) => {
    console.log('🛒 Purchase clicked - Package:', packageId)
    console.log('🔐 Is Authenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      handleError('Please sign in to purchase matches')
      router.push('/client/login?redirect=/client/purchase')
      return
    }

    setSelectedPackage(packageId)
    setPurchasing(true)

    try {
      console.log('📡 Calling /api/checkout/create with:', { productKey: packageId, matchId: null })
      
      // Use direct fetch to match the EnhancedMatchCard approach
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productKey: packageId,
          matchId: null 
        }),
      })
      
      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📡 Response data:', data)
      
      if (!response.ok || !data.checkoutUrl) {
        console.error('❌ Error - No checkout URL:', data)
        throw new Error(data.error || 'No checkout URL received')
      }
      
      console.log('✅ Redirecting to:', data.checkoutUrl)
      // Redirect to Lemon Squeezy checkout
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('❌ Purchase error:', error)
      handleError(error)
      setPurchasing(false)
      setSelectedPackage(null)
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation 
        theme={theme} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        showDashboardLink={true}
        credits={0}
        showSignOut={false}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Get more designer matches
          </h1>
          <p className="text-lg sm:text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Simple pricing. No subscription. Use matches whenever you need.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          {PRICING_PACKAGES.map((pkg, index) => (
            <div 
              key={pkg.id}
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:scale-[1.02] relative animate-slideUp"
              style={{ 
                backgroundColor: pkg.popular ? (isDarkMode ? '#2A2A2A' : '#FFF9F0') : theme.cardBg,
                border: pkg.popular ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                boxShadow: pkg.popular ? (isDarkMode ? 'none' : '0 8px 24px rgba(240, 173, 78, 0.2)') : (isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'),
                animationDelay: `${index * 0.1}s`
              }}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold" 
                  style={{ backgroundColor: theme.accent, color: '#000' }}>
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {pkg.name}
                </h3>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2" style={{ color: theme.accent }}>
                  ${pkg.price}
                </div>
                <div className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
                  {pkg.credits} matches • ${pkg.pricePerMatch.toFixed(2)}/match
                </div>
                <p className="text-sm mt-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  {pkg.description}
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span style={{ color: theme.accent }}>✓</span>
                    <span className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing && selectedPackage === pkg.id}
                className="w-full font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: pkg.popular || purchasing && selectedPackage === pkg.id ? theme.accent : 'transparent',
                  border: pkg.popular || purchasing && selectedPackage === pkg.id ? 'none' : `2px solid ${theme.accent}`,
                  color: pkg.popular || purchasing && selectedPackage === pkg.id ? '#000' : theme.accent
                }}
              >
                {purchasing && selectedPackage === pkg.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚡</span>
                    Processing...
                  </span>
                ) : (
                  `Get ${pkg.name} →`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 mb-16" 
          style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
          {[
            { icon: '🔒', label: 'Secure checkout', sublabel: 'via Stripe' },
            { icon: '⚡', label: 'Instant access', sublabel: 'to matches' },
            { icon: '💸', label: 'No recurring fees', sublabel: 'one-time payment' },
            { icon: '🎯', label: '48hr guarantee', sublabel: 'or free match' }
          ].map((badge, index) => (
            <div key={index} className="text-center animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-semibold transition-colors duration-300" style={{ color: theme.text.primary }}>
                {badge.label}
              </div>
              <div className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
                {badge.sublabel}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Common questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'How do matches work?',
                a: 'One match = one designer contact. When you find a designer you like, use a match to unlock their full contact details including email, phone, and calendar link.'
              },
              {
                q: 'Do matches expire?',
                a: 'No! Matches never expire. Buy once, use whenever you need them. We\'re not in the business of screwing you over.'
              },
              {
                q: 'Can I get a refund?',
                a: 'Unused matches can be refunded within 14 days of purchase. Once you\'ve unlocked a designer, that match is used and non-refundable.'
              },
              {
                q: 'What if the designer doesn\'t respond?',
                a: 'Our 48-hour guarantee: if your matched designer doesn\'t respond within 48 hours, we\'ll give you another match free.'
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="rounded-2xl p-6 transition-all duration-300 animate-slideUp"
                style={{ 
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <h3 className="font-bold text-lg mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {faq.q}
                </h3>
                <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg mb-4 transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Not sure yet?
          </p>
          <Link 
            href="/how-it-works"
            className="font-medium transition-colors duration-300 hover:opacity-80"
            style={{ color: theme.accent }}
          >
            Learn how OneDesigner works →
          </Link>
        </div>
      </div>
    </main>
  )
}