'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/shared'

// Dynamically import the form component to avoid SSR issues
const DesignerApplyForm = dynamic(
  () => import('@/components/designer/DesignerApplyForm'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
        <LoadingSpinner />
      </div>
    )
  }
)

// Navigation component inline to avoid theme issues
const Navigation = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <nav className="px-8 py-4">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-4">
        <a href="/" className="flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" fill="#f0ad4e"/>
            <circle cx="5" cy="12" r="2" fill="#f0ad4e"/>
            <circle cx="19" cy="12" r="2" fill="#f0ad4e"/>
            <circle cx="12" cy="19" r="2" fill="#f0ad4e"/>
            <path d="M12 7V17M7 12H17" stroke="#f0ad4e" strokeWidth="1.5"/>
          </svg>
          <span className="text-xl font-bold" style={{ color: '#cfcfcf' }}>
            OneDesigner
          </span>
        </a>
      </div>
      
      <div className="flex items-center gap-8">
        <button
          onClick={() => {
            localStorage.setItem('theme', isDarkMode ? 'light' : 'dark')
            window.location.reload()
          }}
          className="p-2 rounded-lg transition-colors duration-300"
          style={{ backgroundColor: '#2a2a2a' }}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#cfcfcf">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#cfcfcf">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  </nav>
)

export default function DesignerApplyPage() {
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme !== 'light')
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <Navigation isDarkMode={isDarkMode} />
      
      <div className="max-w-4xl mx-auto px-8 py-12 animate-fadeIn">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#cfcfcf' }}>
            Join Our Designer Network
          </h1>
          <p className="text-lg" style={{ color: '#9CA3AF' }}>
            Get matched with clients looking for your unique creative expertise
          </p>
        </div>

        <div className="p-8 rounded-3xl" style={{ backgroundColor: '#212121', borderColor: '#333333', borderWidth: '1px' }}>
          <DesignerApplyForm />
        </div>
      </div>
    </div>
  )
}