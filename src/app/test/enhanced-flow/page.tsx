'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'

export default function EnhancedFlowTestPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const theme = getTheme(isDarkMode)

  const testFeatures = [
    {
      title: 'Enhanced Client Brief',
      description: 'Test the new 14-question client questionnaire with design categories',
      href: '/brief/enhanced',
      icon: '📝',
      status: 'Ready'
    },
    {
      title: 'Enhanced Designer Profile',
      description: 'Test the enhanced designer profile with portfolio upload',
      href: '/designer/profile/enhanced',
      icon: '👨‍🎨',
      status: 'Ready'
    },
    {
      title: 'Enhanced Match Results',
      description: 'Test the new AI matching with weighted scoring and detailed analysis',
      href: '/match/enhanced/test',
      icon: '🎯',
      status: 'Demo'
    },
    {
      title: 'Original Flow (Comparison)',
      description: 'Compare with the current production system',
      href: '/brief',
      icon: '🔄',
      status: 'Current'
    }
  ]

  const apiEndpoints = [
    {
      endpoint: 'POST /api/briefs/enhanced',
      description: 'Submit enhanced client brief with all new fields',
      status: '✅ Ready'
    },
    {
      endpoint: 'POST /api/match/enhanced',
      description: 'Find matches using enhanced AI algorithm',
      status: '✅ Ready'
    },
    {
      endpoint: 'PUT /api/designer/profile/enhanced',
      description: 'Update designer profile with enhanced fields',
      status: '✅ Ready'
    },
    {
      endpoint: 'POST /api/designer/portfolio/upload',
      description: 'Upload portfolio images with metadata',
      status: '✅ Ready'
    }
  ]

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.svg" 
              alt="OneDesigner" 
              className="w-8 h-8"
            />
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ color: theme.text.primary }}
              >
                Enhanced Flow Testing
              </h1>
              <p 
                className="text-lg"
                style={{ color: theme.text.secondary }}
              >
                Test the new AI-powered matching system with enhanced questionnaires
              </p>
            </div>
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

        {/* Test Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {testFeatures.map((feature) => (
            <Link 
              key={feature.title}
              href={feature.href}
              className="group block p-8 rounded-3xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: theme.cardBg,
                border: `2px solid ${theme.border}`
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 
                      className="text-xl font-bold"
                      style={{ color: theme.text.primary }}
                    >
                      {feature.title}
                    </h3>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: feature.status === 'Ready' ? theme.success + '20' : 
                                       feature.status === 'Demo' ? theme.accent + '20' : 
                                       theme.text.muted + '20',
                        color: feature.status === 'Ready' ? theme.success : 
                               feature.status === 'Demo' ? theme.accent : 
                               theme.text.muted
                      }}
                    >
                      {feature.status}
                    </span>
                  </div>
                  <p 
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    {feature.description}
                  </p>
                  <div 
                    className="mt-4 flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform duration-200"
                    style={{ color: theme.accent }}
                  >
                    Test Now →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* API Endpoints Status */}
        <div 
          className="p-8 rounded-3xl mb-12"
          style={{
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.border}`
          }}
        >
          <h2 
            className="text-2xl font-bold mb-6"
            style={{ color: theme.text.primary }}
          >
            API Endpoints Status
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {apiEndpoints.map((api) => (
              <div 
                key={api.endpoint}
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: theme.nestedBg,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <code 
                    className="text-sm font-mono"
                    style={{ color: theme.accent }}
                  >
                    {api.endpoint}
                  </code>
                  <span className="text-sm">{api.status}</span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: theme.text.secondary }}
                >
                  {api.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Improvements */}
        <div 
          className="p-8 rounded-3xl"
          style={{
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.border}`
          }}
        >
          <h2 
            className="text-2xl font-bold mb-6"
            style={{ color: theme.text.primary }}
          >
            Enhanced System Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 
                className="text-lg font-bold mb-3"
                style={{ color: theme.accent }}
              >
                📊 Weighted AI Matching
              </h3>
              <ul 
                className="space-y-2 text-sm"
                style={{ color: theme.text.secondary }}
              >
                <li>• Category Match (30%)</li>
                <li>• Style Alignment (25%)</li>
                <li>• Budget Compatibility (15%)</li>
                <li>• Timeline Compatibility (10%)</li>
                <li>• Experience Level (10%)</li>
                <li>• Industry Familiarity (10%)</li>
              </ul>
            </div>
            <div>
              <h3 
                className="text-lg font-bold mb-3"
                style={{ color: theme.accent }}
              >
                🎯 Enhanced Questionnaires
              </h3>
              <ul 
                className="space-y-2 text-sm"
                style={{ color: theme.text.secondary }}
              >
                <li>• 6 Design Categories</li>
                <li>• 14 Client Questions</li>
                <li>• 15 Designer Questions</li>
                <li>• Portfolio Upload System</li>
                <li>• Multi-step Progress</li>
              </ul>
            </div>
            <div>
              <h3 
                className="text-lg font-bold mb-3"
                style={{ color: theme.accent }}
              >
                🔍 Detailed Match Analysis
              </h3>
              <ul 
                className="space-y-2 text-sm"
                style={{ color: theme.text.secondary }}
              >
                <li>• Match Summary</li>
                <li>• Personalized Reasons</li>
                <li>• Unique Value Props</li>
                <li>• Potential Challenges</li>
                <li>• Risk Assessment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}