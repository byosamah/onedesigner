'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/shared/Navigation'
import { LoadingSpinner } from '@/components/shared'
import { useTheme } from '@/lib/hooks/useTheme'

// Dynamically import the form component
const DesignerApplyForm = dynamic(
  () => import('@/components/designer/DesignerApplyForm').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
)

function DesignerApplyContent() {
  const { theme, isDarkMode, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation 
        theme={theme} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
      />
      
      <div className="max-w-4xl mx-auto px-8 py-12 animate-fadeIn">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Join Our Designer Network
          </h1>
          <p className="text-lg" style={{ color: theme.text.secondary }}>
            Get matched with clients looking for your unique creative expertise
          </p>
        </div>

        <div 
          className="p-8 rounded-3xl border transition-all duration-300"
          style={{ 
            backgroundColor: theme.cardBg,
            borderColor: theme.border
          }}
        >
          <DesignerApplyForm />
        </div>
      </div>
    </div>
  )
}

export default function DesignerApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <DesignerApplyContent />
    </Suspense>
  )
}