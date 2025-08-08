'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTheme } from '@/lib/design-system'
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const theme = getTheme(isDarkMode)

  const handleBriefSubmit = async (data: ClientBriefData) => {
    try {
      console.log('Submitting enhanced brief:', data)

      // Submit brief using the API endpoint
      const briefResponse = await fetch('/api/briefs', {
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
    <div 
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.svg" 
                alt="OneDesigner" 
                className="w-8 h-8"
              />
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Find Your Perfect Designer
              </h1>
            </div>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-2xl transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: theme.nestedBg,
                border: `2px solid ${theme.border}`,
                color: theme.text.primary
              }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme.text.secondary }}
          >
            Answer a few questions to get matched with the perfect designer for your project
          </p>
        </div>

        {/* Enhanced Brief Form */}
        <div className="max-w-4xl mx-auto">
          <EnhancedClientBrief
            isDarkMode={isDarkMode}
            onSubmit={handleBriefSubmit}
          />
        </div>
      </div>
    </div>
  )
}