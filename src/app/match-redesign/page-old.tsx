'use client'

import { useState } from 'react'
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
  matchExplanation: "Sarah's expertise in SaaS design perfectly aligns with your fintech project. Her minimalist approach and proven track record with 47 successful projects make her an ideal match.",
  keyStrengths: [
    'Specialized in fintech UI/UX with 5+ years experience',
    'Masters clean, conversion-focused design principles',
    'Available immediately for your urgent timeline',
    'Excellent communication skills and US timezone alignment'
  ]
}

export default function MatchRedesignPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const credits = 3

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="text-6xl mb-8">✨</div>
          <h2 className="text-2xl font-bold mb-6">Finding your perfect designer...</h2>
          <AnimatedLoadingMessages />
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen ${styles.shipfastPage}`} style={{ backgroundColor: '#FAFAFA' }}>
      {/* Top Navigation Bar */}
      <nav className="border-b border-gray-100 px-8 py-4 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            OneDesigner
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/client/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Dashboard
            </Link>
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold">
              {credits} Credits
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Perfect Match Found!</h1>
          <p className="text-xl text-gray-600">We found a designer who's perfect for your project</p>
        </div>

        {/* Main Match Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-8">
          {/* Designer Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold ${!isUnlocked && 'blur-sm'}`}>
                {mockMatch.designer.firstName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {mockMatch.designer.firstName} {!isUnlocked ? mockMatch.designer.lastInitial + '***' : mockMatch.designer.lastName}
                </h2>
                <p className="text-gray-600 mb-2">{mockMatch.designer.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📍 {mockMatch.designer.city}</span>
                  <span>⭐ {mockMatch.designer.rating}</span>
                  <span>💼 {mockMatch.designer.totalProjects} projects</span>
                </div>
              </div>
            </div>
            
            {/* Match Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{mockMatch.score}%</div>
              <div className="text-sm text-gray-500">Match Score</div>
            </div>
          </div>

          {/* Match Explanation */}
          <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: '#F5F5F5' }}>
            <p className="text-gray-700 leading-relaxed">{mockMatch.matchExplanation}</p>
          </div>

          {/* Key Strengths */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4">Why {mockMatch.designer.firstName} is perfect for you</h3>
            <div className="space-y-3">
              {mockMatch.keyStrengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-gray-700">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Industries */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="font-semibold mb-3">Design Styles</h4>
              <div className="flex flex-wrap gap-2">
                {mockMatch.designer.styles.map((style) => (
                  <span key={style} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {style}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Industries</h4>
              <div className="flex flex-wrap gap-2">
                {mockMatch.designer.industries.map((industry) => (
                  <span key={industry} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4">Portfolio Preview</h4>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`aspect-video bg-gray-100 rounded-xl ${!isUnlocked && 'blur-md relative overflow-hidden'}`}>
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          {!isUnlocked ? (
            <div className="border-t border-gray-100 pt-8">
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl mb-2">Ready to connect with {mockMatch.designer.firstName}?</h3>
                <p className="text-gray-600">Unlock full profile and contact details</p>
              </div>

              {/* What you get */}
              <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#F5F5F5' }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#FFBE18' }}>✓</span>
                    <span>Full name & contact info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#FFBE18' }}>✓</span>
                    <span>Direct email & phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#FFBE18' }}>✓</span>
                    <span>Complete portfolio access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#FFBE18' }}>✓</span>
                    <span>Calendly booking link</span>
                  </div>
                </div>
              </div>

              {/* Unlock Options */}
              {credits > 0 ? (
                <button
                  onClick={() => setIsUnlocked(true)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-2xl transition-colors mb-4"
                >
                  Use 1 Credit to Unlock
                </button>
              ) : null}
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">{credits > 0 ? 'Or buy more credits' : 'Choose a package'}</p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-4">
                <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-colors text-center">
                  <div className="text-2xl font-bold mb-1">$5</div>
                  <div className="font-medium mb-1">Starter</div>
                  <div className="text-sm text-gray-500">3 matches</div>
                </button>
                <button className="p-6 border-2 rounded-2xl transition-colors text-center relative" style={{ borderColor: '#FFBE18', backgroundColor: '#FFFBF0' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF9E6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFBF0'}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-black text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: '#FFBE18' }}>
                    POPULAR
                  </div>
                  <div className="text-2xl font-bold mb-1">$15</div>
                  <div className="font-medium mb-1">Growth</div>
                  <div className="text-sm text-gray-500">10 matches</div>
                </button>
                <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-colors text-center">
                  <div className="text-2xl font-bold mb-1">$30</div>
                  <div className="font-medium mb-1">Scale</div>
                  <div className="text-sm text-gray-500">25 matches</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-8">
              <div className="bg-yellow-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">📧</span>
                    <span>{mockMatch.designer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">📱</span>
                    <span>{mockMatch.designer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">🗓</span>
                    <a href="#" className="text-blue-600 hover:underline">{mockMatch.designer.calendly_url}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">🌐</span>
                    <a href="#" className="text-blue-600 hover:underline">{mockMatch.designer.website}</a>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-bold mb-3">Next Steps</h4>
                <ol className="text-left inline-block space-y-2 text-gray-600">
                  <li>1. Send {mockMatch.designer.firstName} an introductory email</li>
                  <li>2. Share your detailed project brief</li>
                  <li>3. Schedule a discovery call via Calendly</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Find New Match Button */}
        <div className="text-center">
          <button className="text-gray-600 hover:text-gray-900 font-medium">
            Not the right fit? Find another match →
          </button>
        </div>
      </div>
    </main>
  )
}