'use client'

import { getTheme } from '@/lib/design-system'

interface Option {
  value: string
  label: string
  description?: string
  icon?: string
}

interface RadioGroupProps {
  options: Option[]
  selected: string
  onChange: (value: string) => void
  isDarkMode: boolean
  layout?: 'grid' | 'stack'
  error?: string
}

export function RadioGroup({ 
  options, 
  selected, 
  onChange, 
  isDarkMode, 
  layout = 'grid',
  error 
}: RadioGroupProps) {
  const theme = getTheme(isDarkMode)

  return (
    <div className="space-y-4">
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'space-y-3'}>
        {options.map(option => {
          const isSelected = selected === option.value

          return (
            <div
              key={option.value}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                isSelected ? 'animate-fadeIn' : ''
              }`}
              style={{
                backgroundColor: isSelected ? theme.accent + '15' : theme.cardBg,
                borderColor: isSelected ? theme.accent : theme.border,
                color: theme.text.primary
              }}
              onClick={() => onChange(option.value)}
            >
              <div className="flex items-center gap-3">
                {option.icon && <span className="text-xl">{option.icon}</span>}
                <div className="flex-1">
                  <h4 className="font-medium text-base">{option.label}</h4>
                  {option.description && (
                    <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                      {option.description}
                    </p>
                  )}
                </div>
                <div 
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected ? 'scale-110' : ''
                  }`}
                  style={{
                    borderColor: isSelected ? theme.accent : theme.border,
                    backgroundColor: isSelected ? theme.accent : 'transparent'
                  }}
                >
                  {isSelected && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#000' }}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {error && (
        <p className="text-sm animate-slideUp" style={{ color: theme.error }}>
          {error}
        </p>
      )}
    </div>
  )
}