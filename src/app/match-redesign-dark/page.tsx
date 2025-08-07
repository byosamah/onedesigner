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

export default function MatchRedesignDarkPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const credits = 3

  if (isLoading) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${styles.shipfastPage}`} style={{ backgroundColor: '#212121' }}>
        <div className="text-center">
          <div className="text-6xl mb-8">✨</div>
          <h2 className="text-2xl font-bold mb-6 text-[#cfcfcf]">Finding your perfect designer...</h2>
          <div className="text-gray-400">
            <AnimatedLoadingMessages />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen ${styles.shipfastPage}`} style={{ backgroundColor: '#212121' }}>
      {/* Top Navigation Bar */}
      <nav className="px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[#cfcfcf]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#f0ad4e" stroke="#f0ad4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/client/dashboard" className="text-gray-400 hover:text-[#cfcfcf] text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <div className="text-black px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: '#f0ad4e' }}>
              {credits} Credits
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-6">🎯</div>
          <h1 className="text-5xl font-extrabold mb-4 text-[#cfcfcf]">Perfect Match Found!</h1>
          <p className="text-xl text-gray-500">We found a designer who's perfect for your project</p>
        </div>

        {/* Main Match Card */}
        <div className="rounded-3xl border border-gray-800 p-8 mb-8" style={{ backgroundColor: '#323232' }}>
          {/* Designer Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-black ${!isUnlocked && 'blur-sm'}`} style={{ backgroundColor: '#f0ad4e' }}>
                {mockMatch.designer.firstName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1 text-[#cfcfcf]">
                  {mockMatch.designer.firstName} {!isUnlocked ? mockMatch.designer.lastInitial + '***' : mockMatch.designer.lastName}
                </h2>
                <p className="text-gray-400 mb-2">{mockMatch.designer.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📍 {mockMatch.designer.city}</span>
                  <span>⭐ {mockMatch.designer.rating}</span>
                  <span>💼 {mockMatch.designer.totalProjects} projects</span>
                </div>
              </div>
            </div>
            
            {/* Match Score */}
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: '#f0ad4e' }}>{mockMatch.score}%</div>
              <div className="text-base text-gray-500">Match Score</div>
            </div>
          </div>

          {/* Match Explanation */}
          <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: '#212121' }}>
            <p className="text-gray-300 leading-relaxed">{mockMatch.matchExplanation}</p>
          </div>

          {/* Key Strengths */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 text-[#cfcfcf]">Why {mockMatch.designer.firstName} is perfect for you</h3>
            <div className="space-y-3">
              {mockMatch.keyStrengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#f0ad4e' }}>
                    <span className="text-xs text-black">✓</span>
                  </div>
                  <p className="text-gray-300">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Industries */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="font-semibold mb-3 text-[#cfcfcf]">Design Styles</h4>
              <div className="flex flex-wrap gap-2">
                {mockMatch.designer.styles.map((style) => (
                  <span key={style} className="px-4 py-2 rounded-lg text-sm text-[#cfcfcf]" style={{ backgroundColor: '#1A1A1A' }}>
                    {style}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#cfcfcf]">Industries</h4>
              <div className="flex flex-wrap gap-2">
                {mockMatch.designer.industries.map((industry) => (
                  <span key={industry} className="px-4 py-2 rounded-lg text-sm text-[#cfcfcf]" style={{ backgroundColor: '#1A1A1A' }}>
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-[#cfcfcf]">Portfolio Preview</h4>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`aspect-video rounded-xl ${!isUnlocked && 'blur-md relative overflow-hidden'}`} style={{ backgroundColor: '#212121' }}>
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
            <div className="border-t border-gray-700 pt-8">
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl mb-2 text-[#cfcfcf]">Ready to connect with {mockMatch.designer.firstName}?</h3>
                <p className="text-gray-400">Unlock full profile and contact details</p>
              </div>

              {/* What you get */}
              <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#212121' }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#f0ad4e' }}>✓</span>
                    <span className="text-gray-300">Full name & contact info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#f0ad4e' }}>✓</span>
                    <span className="text-gray-300">Direct email & phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#f0ad4e' }}>✓</span>
                    <span className="text-gray-300">Complete portfolio access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#f0ad4e' }}>✓</span>
                    <span className="text-gray-300">Calendly booking link</span>
                  </div>
                </div>
              </div>

              {/* Unlock Options */}
              {credits > 0 ? (
                <button
                  onClick={() => setIsUnlocked(true)}
                  className="w-full text-black font-bold py-4 rounded-2xl transition-all mb-4 hover:scale-[1.02]" 
                  style={{ backgroundColor: '#f0ad4e' }}
                >
                  Use 1 Credit to Unlock
                </button>
              ) : null}
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">{credits > 0 ? 'Or buy more credits' : 'Choose a package'}</p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-4">
                <button className="p-6 border-2 border-gray-700 rounded-2xl hover:border-gray-600 transition-all text-center hover:scale-[1.02]">
                  <div className="text-2xl font-bold mb-1 text-[#cfcfcf]">$5</div>
                  <div className="font-medium mb-1 text-[#cfcfcf]">Starter</div>
                  <div className="text-sm text-gray-500">3 matches</div>
                </button>
                <button className="p-6 border-2 rounded-2xl transition-all text-center relative hover:scale-[1.02]" style={{ borderColor: '#f0ad4e', backgroundColor: '#2A2A2A' }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-black text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: '#f0ad4e' }}>
                    MOST POPULAR
                  </div>
                  <div className="text-2xl font-bold mb-1 text-[#cfcfcf]">$15</div>
                  <div className="font-medium mb-1 text-[#cfcfcf]">Growth</div>
                  <div className="text-sm text-gray-500">10 matches</div>
                </button>
                <button className="p-6 border-2 border-gray-700 rounded-2xl hover:border-gray-600 transition-all text-center hover:scale-[1.02]">
                  <div className="text-2xl font-bold mb-1 text-[#cfcfcf]">$30</div>
                  <div className="font-medium mb-1 text-[#cfcfcf]">Scale</div>
                  <div className="text-sm text-gray-500">25 matches</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-700 pt-8">
              <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#323232' }}>
                <h3 className="font-bold text-lg mb-4 text-[#cfcfcf]">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">📧</span>
                    <span className="text-gray-300">{mockMatch.designer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">📱</span>
                    <span className="text-gray-300">{mockMatch.designer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">🗓</span>
                    <a href="#" className="hover:underline" style={{ color: '#f0ad4e' }}>{mockMatch.designer.calendly_url}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">🌐</span>
                    <a href="#" className="hover:underline" style={{ color: '#f0ad4e' }}>{mockMatch.designer.website}</a>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-bold mb-3 text-[#cfcfcf]">Next Steps</h4>
                <ol className="text-left inline-block space-y-2 text-gray-400">
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
          <button className="text-gray-500 hover:text-[#cfcfcf] font-medium transition-colors">
            Not the right fit? Find another match →
          </button>
        </div>
      </div>
    </main>
  )
}