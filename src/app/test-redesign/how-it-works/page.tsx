'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTheme } from '../design-system'

const steps = [
  {
    number: '01',
    title: 'Drop your brief',
    description: 'Tell us what you need designed. Project type, style, timeline. Takes 2 minutes, not 2 hours.',
    details: [
      'Choose from 6 project types (or custom)',
      'Pick your design style and vibe',
      'Set your timeline (ASAP available)',
      'Add inspiration links (optional)'
    ],
    emoji: '📝',
    time: '2 min'
  },
  {
    number: '02',
    title: 'AI finds your match',
    description: 'Our AI analyzes 2,847 pre-vetted designers in 0.3 seconds. No browsing. No guessing.',
    details: [
      'AI scores each designer 0-100%',
      'Matches based on style, experience, availability',
      'Shows you why they\'re perfect',
      'Filters out the flakes automatically'
    ],
    emoji: '🤖',
    time: '0.3 sec'
  },
  {
    number: '03',
    title: 'Unlock & connect',
    description: 'Like the match? Use 1 credit to get their direct contact. Email, phone, calendar link.',
    details: [
      'See full portfolio and past work',
      'Get direct email and phone',
      'Book calls via their calendar',
      'No platform fees or middlemen'
    ],
    emoji: '🔓',
    time: 'Instant'
  },
  {
    number: '04',
    title: 'Start designing',
    description: '48-hour guarantee. Your designer starts within 2 days or we give you another match free.',
    details: [
      'Direct communication (no platform)',
      'Pay designers directly (we don\'t take a cut)',
      'Work however you want',
      'We\'re here if you need help'
    ],
    emoji: '🚀',
    time: '< 48hr'
  }
]

const comparisons = [
  {
    feature: 'Time to find designer',
    onedesigner: '10 minutes',
    others: '2-3 weeks',
    winner: 'onedesigner'
  },
  {
    feature: 'Designer quality',
    onedesigner: 'Pre-vetted (73% rejected)',
    others: 'Anyone can join',
    winner: 'onedesigner'
  },
  {
    feature: 'Matching process',
    onedesigner: 'AI-powered instant match',
    others: 'Manual browsing',
    winner: 'onedesigner'
  },
  {
    feature: 'Platform fees',
    onedesigner: '$0 (pay designer directly)',
    others: '20-30% of project',
    winner: 'onedesigner'
  },
  {
    feature: 'Start guarantee',
    onedesigner: '48 hours or free match',
    others: 'Good luck',
    winner: 'onedesigner'
  },
  {
    feature: 'Pricing',
    onedesigner: '$1.20-$1.67 per match',
    others: 'Free to browse (then 20% fees)',
    winner: 'depends'
  }
]

export default function TestHowItWorksPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeStep, setActiveStep] = useState(0)
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
              <Link href="/test-redesign/pricing" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Pricing
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

      {/* Header */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto text-center animate-fadeIn">
          <h1 className="text-5xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            From brief to designer in 10 minutes
          </h1>
          <p className="text-xl transition-colors duration-300" style={{ color: theme.text.secondary }}>
            No job posts. No proposals. No BS. Just perfect matches.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Step Navigation */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className="w-full text-left p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] animate-slideUp"
                  style={{
                    backgroundColor: activeStep === index ? theme.accent : theme.cardBg,
                    border: `2px solid ${activeStep === index ? theme.accent : theme.border}`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{step.emoji}</span>
                      <span className="text-2xl font-bold" style={{ color: activeStep === index ? '#000' : theme.text.muted }}>
                        {step.number}
                      </span>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" 
                      style={{ 
                        backgroundColor: activeStep === index ? 'rgba(0,0,0,0.1)' : theme.tagBg,
                        color: activeStep === index ? '#000' : theme.text.secondary
                      }}>
                      {step.time}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 transition-colors duration-300" 
                    style={{ color: activeStep === index ? '#000' : theme.text.primary }}>
                    {step.title}
                  </h3>
                  <p className="text-sm transition-colors duration-300" 
                    style={{ color: activeStep === index ? '#000' : theme.text.secondary }}>
                    {step.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Right: Step Details */}
            <div className="rounded-3xl p-8 transition-all duration-300" 
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
              <div className="text-5xl mb-6">{steps[activeStep].emoji}</div>
              <h3 className="text-2xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                {steps[activeStep].title}
              </h3>
              <p className="text-lg mb-8 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                {steps[activeStep].description}
              </p>
              
              <h4 className="font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
                What happens:
              </h4>
              <ul className="space-y-3">
                {steps[activeStep].details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span style={{ color: theme.accent }}>✓</span>
                    <span className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: theme.nestedBg }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Time to complete:
                  </span>
                  <span className="font-bold text-xl" style={{ color: theme.accent }}>
                    {steps[activeStep].time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-8 py-16" style={{ backgroundColor: theme.nestedBg }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 transition-colors duration-300" style={{ color: theme.text.primary }}>
            OneDesigner vs. The old way
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-6 font-semibold transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Feature
                  </th>
                  <th className="text-center py-4 px-6 font-semibold transition-colors duration-300" style={{ color: theme.text.primary }}>
                    OneDesigner
                  </th>
                  <th className="text-center py-4 px-6 font-semibold transition-colors duration-300" style={{ color: theme.text.primary }}>
                    Freelance Platforms
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: theme.border }}>
                    <td className="py-4 px-6 transition-colors duration-300" style={{ color: theme.text.secondary }}>
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                        row.winner === 'onedesigner' ? 'font-bold' : ''
                      }`} style={{ 
                        backgroundColor: row.winner === 'onedesigner' ? theme.accent : 'transparent',
                        color: row.winner === 'onedesigner' ? '#000' : theme.text.secondary
                      }}>
                        {row.onedesigner}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-sm transition-colors duration-300" style={{ 
                        color: row.winner === 'others' ? theme.accent : theme.text.muted 
                      }}>
                        {row.others}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-8 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Ready to skip the BS?
          </h2>
          <p className="text-xl mb-8 transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Your perfect designer is 10 minutes away. Not 10 days.
          </p>
          <Link
            href="/test-redesign/brief"
            className="inline-block font-bold py-5 px-12 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-lg"
            style={{ backgroundColor: theme.accent, color: '#000' }}
          >
            Find My Designer Now →
          </Link>
          <p className="text-sm mt-6 transition-colors duration-300" style={{ color: theme.text.muted }}>
            No credit card required to browse matches
          </p>
        </div>
      </section>
    </main>
  )
}