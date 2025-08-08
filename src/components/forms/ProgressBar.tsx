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
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div 
          className="h-2 rounded-full"
          style={{ backgroundColor: theme.border }}
        >
          <div
            className="h-2 rounded-full transition-all duration-700 ease-out"
            style={{
              backgroundColor: theme.accent,
              width: `${progress}%`
            }}
          />
        </div>
        
        {/* Step Indicators */}
        {steps && (
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const isCompleted = index < current
              const isCurrent = index === current - 1
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCurrent ? 'animate-pulse' : ''
                    }`}
                    style={{
                      backgroundColor: isCompleted || isCurrent ? theme.accent : theme.border,
                      color: isCompleted || isCurrent ? '#000' : theme.text.secondary
                    }}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {showLabels && (
                    <span 
                      className="text-xs font-medium mt-2 text-center max-w-20"
                      style={{ 
                        color: isCompleted || isCurrent ? theme.accent : theme.text.secondary 
                      }}
                    >
                      {step}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Progress Text */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
          Step {current} of {total}
        </span>
        <span className="text-sm font-bold" style={{ color: theme.accent }}>
          {Math.round(progress)}% Complete
        </span>
      </div>
    </div>
  )
}