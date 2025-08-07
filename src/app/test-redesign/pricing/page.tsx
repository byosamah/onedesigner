'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTheme } from '../design-system'

const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: '$5',
    credits: 3,
    perCredit: '$1.67',
    features: [
      '3 designer matches',
      'AI-powered matching',
      'Direct contact info',
      '48-hour guarantee',
      'No platform fees'
    ],
    cta: 'Perfect for trying out',
    popular: false
  },
  {
    id: 'growth',
    name: 'Growth Pack',
    price: '$15',
    credits: 10,
    perCredit: '$1.50',
    features: [
      '10 designer matches',
      'Everything in Starter',
      'Priority matching',
      'Bulk project briefs',
      'Save 10% per match'
    ],
    cta: 'Most founders choose this',
    popular: true
  },
  {
    id: 'scale',
    name: 'Scale Pack',
    price: '$30',
    credits: 25,
    perCredit: '$1.20',
    features: [
      '25 designer matches',
      'Everything in Growth',
      'Dedicated support',
      'Team access (3 seats)',
      'Save 28% per match'
    ],
    cta: 'Best value for agencies',
    popular: false
  }
]

const faqs = [
  {
    question: "What's a designer match?",
    answer: "One credit = one designer's full contact details. No bidding, no back-and-forth. Just direct access to pre-vetted designers who match your project."
  },
  {
    question: "Do credits expire?",
    answer: "Nope. Buy once, use whenever. We're not in the business of screwing you over with expiry dates."
  },
  {
    question: "What if I'm not happy with my match?",
    answer: "48-hour guarantee. If your matched designer doesn't respond within 48 hours, we'll give you another match free. Simple as that."
  },
  {
    question: "Can I get a refund?",
    answer: "Unused credits? Yes, within 14 days. Used credits? No, because you already got the designer's contact. Fair's fair."
  },
  {
    question: "Why not just use Upwork?",
    answer: "Go ahead, spend 3 weeks sorting through 200 proposals from 'expert designers' who've never shipped anything. We'll be here when you're ready for quality."
  }
]

export default function TestPricingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'once' | 'monthly'>('once')
  const theme = getTheme(isDarkMode)

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
            <div className="flex items-center gap-6">
              <Link href="/test-redesign" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Home
              </Link>
              <Link href="/test-redesign/how-it-works" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                How it works
              </Link>
              <Link href="/test-redesign/brief" className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: theme.accent, color: '#000' }}>
                Get Started →
              </Link>
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

      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Simple pricing. No BS.
          </h1>
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Buy credits. Unlock designers. Start designing. That's it.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {pricingPlans.map((plan, index) => (
            <div 
              key={plan.id}
              className="rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] relative animate-slideUp"
              style={{ 
                backgroundColor: plan.popular ? (isDarkMode ? '#2A2A2A' : '#FFF9F0') : theme.cardBg,
                border: plan.popular ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                boxShadow: plan.popular ? (isDarkMode ? 'none' : '0 8px 24px rgba(240, 173, 78, 0.2)') : (isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'),
                animationDelay: `${index * 0.1}s`
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: theme.accent, color: '#000' }}>
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {plan.name}
                </h3>
                <div className="text-5xl font-bold mb-2" style={{ color: theme.accent }}>
                  {plan.price}
                </div>
                <div className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
                  {plan.credits} credits • {plan.perCredit}/match
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span style={{ color: theme.accent }}>✓</span>
                    <span className="text-sm transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button 
                className="w-full font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] mb-3"
                style={{
                  backgroundColor: plan.popular ? theme.accent : 'transparent',
                  border: plan.popular ? 'none' : `2px solid ${theme.accent}`,
                  color: plan.popular ? '#000' : theme.accent
                }}
              >
                Buy {plan.name} →
              </button>
              
              <p className="text-center text-xs transition-colors duration-300" style={{ color: theme.text.muted }}>
                {plan.cta}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 mb-20" style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
          {[
            { icon: '🔒', label: 'Secure checkout', sublabel: 'via Stripe' },
            { icon: '⚡', label: 'Instant access', sublabel: 'to designers' },
            { icon: '🎯', label: '94% match rate', sublabel: 'AI-powered' },
            { icon: '💸', label: 'No hidden fees', sublabel: 'ever' }
          ].map((badge, index) => (
            <div key={index} className="text-center animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-semibold transition-colors duration-300" style={{ color: theme.text.primary }}>{badge.label}</div>
              <div className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>{badge.sublabel}</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Questions? We got you.
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
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
                  {faq.question}
                </h3>
                <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 rounded-3xl p-12" style={{ backgroundColor: theme.nestedBg }}>
          <h2 className="text-3xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Ready to find your perfect designer?
          </h2>
          <p className="text-lg mb-8 transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Join 2,847 founders who stopped browsing and started building
          </p>
          <Link 
            href="/test-redesign/brief"
            className="inline-block font-bold py-5 px-12 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-lg"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            Get My Designer Match →
          </Link>
        </div>
      </div>
    </main>
  )
}