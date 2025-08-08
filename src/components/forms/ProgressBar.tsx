'use client'

import { getTheme } from '@/lib/design-system'

interface ProgressBarProps {
  current: number
  total: number
  steps?: string[]
  isDarkMode: boolean
  showLabels?: boolean
}

export function ProgressBar({ 
  current, 
  total, 
  steps, 
  isDarkMode, 
  showLabels = true 
}: ProgressBarProps) {
  const theme = getTheme(isDarkMode)
  const progress = (current / total) * 100

  return (
    <div className="mb-12 animate-slideUp">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full mx-1 transition-all duration-300 ${
              i === 0 ? 'ml-0' : ''
            } ${i === total - 1 ? 'mr-0' : ''}`}
            style={{
              backgroundColor: i + 1 <= current ? theme.accent : theme.border
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps?.map((label, i) => (
          <div 
            key={label} 
            className="text-xs flex-1 text-center"
            style={{ 
              color: i + 1 <= current ? theme.text.primary : theme.text.muted,
              fontWeight: i + 1 === current ? 600 : 400
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}