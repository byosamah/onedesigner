'use client'

import { useState, useEffect } from 'react'
import { getTheme } from '@/lib/design-system'
import { EnhancedClientBrief } from '@/components/forms/EnhancedClientBrief'
import { logger } from '@/lib/core/logging-service'

export default function TestBriefPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme === 'dark')
  }, [])
  
  const theme = getTheme(isDarkMode)

  const handleSubmit = async (data: any) => {
    logger.info('Form submitted with data:', data)
    setResult(data)
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ color: theme.text.primary }}>
          Test Brief Form
        </h1>
        
        <EnhancedClientBrief 
          isDarkMode={isDarkMode}
          onSubmit={handleSubmit}
        />

        {result && (
          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>Form Result:</h2>
            <pre style={{ color: theme.text.secondary }}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  )
}