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

  const handleBriefSubmit = async (data: ClientBriefData) => {
    try {
      console.log('Submitting enhanced brief:', data)

      // Submit brief using the public API endpoint (no auth required)
      const briefResponse = await fetch('/api/briefs/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!briefResponse.ok) {
        const errorData = await briefResponse.json()
        throw new Error(errorData.message || 'Failed to submit brief')
      }

      const briefResult = await briefResponse.json()
      const briefId = briefResult.brief.id

      console.log('✅ Brief submitted successfully:', briefId)

      // Find matches using the matching endpoint
      const matchResponse = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefId }),
      })

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json()
        throw new Error(errorData.message || 'Failed to find matches')
      }

      const matchResult = await matchResponse.json()
      console.log('✅ Enhanced matches found:', matchResult.matches?.length)

      // Redirect to match results page  
      router.push(`/match/${briefId}`)

    } catch (error) {
      console.error('Enhanced brief submission error:', error)
      alert(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300 animate-fadeIn" style={{ backgroundColor: theme.bg }}>
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
      
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8 text-center animate-slideUp">
          <h1 className="text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Find Your Perfect Designer
          </h1>
          <p className="text-lg" style={{ color: theme.text.secondary }}>
            Answer a few questions to get matched with the perfect designer for your project
          </p>
        </div>

        {/* Enhanced Brief Form */}
        <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <EnhancedClientBrief
            isDarkMode={isDarkMode}
            onSubmit={handleBriefSubmit}
          />
        </div>
      </div>
    </main>
  )
}