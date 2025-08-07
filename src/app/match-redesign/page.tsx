'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatedLoadingMessages } from '@/components/AnimatedLoadingMessages'
import styles from './styles.module.css'

// Mock data for testing
const mockMatch = {
  id: '123',
  score: 94,
  confidence: 'high' as const,
  designer: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    lastInitial: 'J',
    title: 'Senior Product Designer',
    city: 'San Francisco',
    country: 'USA',
    yearsExperience: 8,
    rating: 4.9,
    totalProjects: 47,
    styles: ['Minimalist', 'Modern', 'Clean'],
    industries: ['SaaS', 'Fintech', 'E-commerce'],
    email: 'sarah@design.studio',
    phone: '+1 (555) 123-4567',
    calendly_url: 'calendly.com/sarahj',
    website: 'sarahdesigns.com'
  },
  matchExplanation: "Our AI analyzed 2,847 pre-vetted designers in 0.3 seconds. Sarah? She's designed 47 SaaS products, speaks fluent fintech, and her last client went from wireframe to $2M ARR. Your timeline says urgent. She starts tomorrow.",
  keyStrengths: [
    'Pre-vetted (we rejected 73% of applicants, kept the pixel-perfect ones)',
    'Designs SaaS that converts (her average: 4.2% trial-to-paid)',
    'Starts designing within 48 hours (our guarantee, not BS)',
    'Direct contact, no middleman fees eating your budget'
  ]
}

export default function MatchRedesignPageNew() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const credits = 3

  // Smooth theme transition
  useEffect(() => {
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease'
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Theme-based styles
  const theme = {
    bg: isDarkMode ? '#212121' : '#FAFAFA',
    cardBg: isDarkMode ? '#323232' : '#FFFFFF',
    nestedBg: isDarkMode ? '#212121' : '#F5F5F5',
    tagBg: isDarkMode ? '#1A1A1A' : '#F3F4F6',
    text: {
      primary: isDarkMode ? '#cfcfcf' : '#111827',
      secondary: isDarkMode ? '#9CA3AF' : '#6B7280',
      muted: isDarkMode ? '#6B7280' : '#9CA3AF'
    },
    border: isDarkMode ? '#374151' : '#E5E7EB',
    accent: '#f0ad4e'
  }

  if (isLoading) {
    return (
      <main className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${styles.shipfastPage}`} style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-5xl mb-6">✨</div>
          <h2 className="text-2xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>AI analyzing 2,847 pre-vetted designers... 🔍</h2>
          <div style={{ color: theme.text.secondary }}>
            <AnimatedLoadingMessages />
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <main className={`min-h-screen transition-colors duration-300 ${styles.shipfastPage}`} style={{ backgroundColor: theme.bg }}>
      {/* Top Navigation Bar */}
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
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link href="/client/dashboard" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Previous Matches
              </Link>
              
              <div className="text-sm px-4 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: theme.accent, color: '#000' }}>
                <span className="font-normal">You have</span> <span className="font-bold">{credits} matches</span>
              </div>
            </div>
            
            {/* Theme Toggle - Separated */}
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

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-6">🎯</div>
          <h1 className="text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>Holy Pixels! AI Found Your Perfect Designer</h1>
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>One brief. Zero browsing. Design starts in 48 hours.</p>
        </div>

        {/* Main Match Card */}
        <div className="rounded-3xl p-8 mb-8 transition-all duration-300" style={{ 
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Designer Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-colors duration-300 ${!isUnlocked && 'blur-sm'}`} 
                style={{ backgroundColor: theme.accent, color: '#000' }}>
                {mockMatch.designer.firstName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  {mockMatch.designer.firstName} {!isUnlocked ? mockMatch.designer.lastInitial + '***' : mockMatch.designer.lastName}
                </h2>
                <p className="mb-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>{mockMatch.designer.title}</p>
                <div className="flex items-center gap-4 text-sm" style={{ color: theme.text.muted }}>
                  <span>📍 {mockMatch.designer.city}</span>
                  <span>⭐ {mockMatch.designer.rating}</span>
                  <span>💼 {mockMatch.designer.totalProjects} projects</span>
                </div>
              </div>
            </div>
            
            {/* Match Score */}
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: theme.accent }}>{mockMatch.score}%</div>
              <div className="text-base" style={{ color: theme.text.muted }}>Match Score</div>
            </div>
          </div>

          {/* Match Explanation */}
          <div className="rounded-2xl p-6 mb-8 transition-colors duration-300" style={{ backgroundColor: theme.nestedBg }}>
            <p className="leading-relaxed transition-colors duration-300" style={{ color: theme.text.secondary }}>{mockMatch.matchExplanation}</p>
          </div>

          {/* Key Strengths */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Why our AI picked {mockMatch.designer.firstName} (94% match) 🔥
            </h3>
            <div className="space-y-3">
              {mockMatch.keyStrengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300" 
                    style={{ backgroundColor: theme.accent }}>
                    <span className="text-xs" style={{ color: '#000' }}>✓</span>
                  </div>
                  <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Industries */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="font-semibold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>Design Styles</h4>
              <div className="flex flex-wrap gap-2">
                {mockMatch.designer.styles.map((style) => (
                  <span key={style} className="px-4 py-2 rounded-lg text-sm transition-colors duration-300" 
                    style={{ backgroundColor: theme.tagBg, color: theme.text.primary }}>
                    {style}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>Industries</h4>
              <div className="flex flex-wrap gap-2">
                {mockMatch.designer.industries.map((industry) => (
                  <span key={industry} className="px-4 py-2 rounded-lg text-sm transition-colors duration-300" 
                    style={{ backgroundColor: theme.tagBg, color: theme.text.primary }}>
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>Recent work (47 launched designs) 🎨</h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop'
              ].map((imgUrl, i) => (
                <div 
                  key={i} 
                  className="aspect-video rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105" 
                  onClick={() => setSelectedImage(imgUrl)}
                  style={{ backgroundColor: theme.nestedBg }}
                >
                  <img 
                    src={imgUrl} 
                    alt={`Portfolio project ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          {!isUnlocked ? (
            <div className="pt-8" style={{ borderTop: `1px solid ${theme.border}` }}>
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                  Stop wasting weeks on Upwork 🛒
                </h3>
                <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>1 credit = {mockMatch.designer.firstName}'s direct line. No bidding wars. No BS.</p>
              </div>

              {/* What you get */}
              <div className="rounded-2xl p-6 mb-6 transition-colors duration-300" style={{ backgroundColor: theme.nestedBg }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {['Full designer profile (bye bye Sarah J***)', 'Direct email + phone (no platform fees)', 'Complete portfolio (all 47 shipped projects)', 'Calendly link (book today, start tomorrow)'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span style={{ color: theme.accent }}>✓</span>
                      <span className="transition-colors duration-300" style={{ color: theme.text.secondary }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlock Options */}
              {credits > 0 && (
                <button
                  onClick={() => setIsUnlocked(true)}
                  className="w-full font-bold py-4 rounded-2xl transition-all duration-300 mb-4 hover:scale-[1.02]" 
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  Skip the BS. Get Designing → 1 Credit
                </button>
              )}
              
              <div className="text-center mb-4">
                <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>
                  {credits > 0 ? 'Running low? Stock up 👇' : 'No credits? No problem 👇'}
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { price: '$5', name: 'Starter Pack', matches: '3 designer unlocks' },
                  { price: '$15', name: 'Growth Pack', matches: '10 designer unlocks', popular: true },
                  { price: '$30', name: 'Scale Pack', matches: '25 designer unlocks' }
                ].map((plan, i) => (
                  <button key={i} className="p-6 rounded-2xl transition-all duration-300 text-center hover:scale-[1.02] relative" style={{ 
                    border: plan.popular ? `2px solid ${theme.accent}` : `2px solid ${theme.border}`,
                    backgroundColor: plan.popular ? (isDarkMode ? '#2A2A2A' : '#FFF9F0') : theme.cardBg
                  }}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold" 
                        style={{ backgroundColor: theme.accent, color: '#000' }}>
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-2xl font-bold mb-1 transition-colors duration-300" style={{ color: theme.text.primary }}>{plan.price}</div>
                    <div className="font-medium mb-1 transition-colors duration-300" style={{ color: theme.text.secondary }}>{plan.name}</div>
                    <div className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>{plan.matches}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-8" style={{ borderTop: `1px solid ${theme.border}` }}>
              <div className="rounded-2xl p-6 mb-6 transition-colors duration-300" style={{ backgroundColor: isDarkMode ? '#2A2A2A' : '#FEF3C7' }}>
                <h3 className="font-bold text-lg mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>Your direct line to {mockMatch.designer.firstName} 🎁</h3>
                <div className="space-y-3">
                  {[
                    { icon: '📧', value: mockMatch.designer.email },
                    { icon: '📱', value: mockMatch.designer.phone },
                    { icon: '🗓', value: mockMatch.designer.calendly_url, isLink: true },
                    { icon: '🌐', value: mockMatch.designer.website, isLink: true }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      {item.isLink ? (
                        <a href="#" className="hover:underline transition-colors duration-300" style={{ color: theme.accent }}>{item.value}</a>
                      ) : (
                        <span className="transition-colors duration-300" style={{ color: theme.text.secondary }}>{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-bold mb-3 transition-colors duration-300" style={{ color: theme.text.primary }}>Your game plan 🏦</h4>
                <ol className="text-left inline-block space-y-2 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  <li>1. Email {mockMatch.designer.firstName} directly (template included)</li>
                  <li>2. Share your brief (she already knows your project type)</li>
                  <li>3. Start within 48 hours (our guarantee, remember?)</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Find New Match Button */}
        <div className="text-center">
          <button className="font-medium transition-colors duration-300" style={{ color: theme.text.muted }}>
            Not feeling it? AI finds another in 0.3 seconds →
          </button>
        </div>
      </div>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Portfolio preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
    </>
  )
}