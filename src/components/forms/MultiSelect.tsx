'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'

interface Option {
  value: string
  label: string
  description?: string
  icon?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  maxSelections?: number
  minSelections?: number
  isDarkMode: boolean
  placeholder?: string
  error?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  maxSelections,
  minSelections = 0,
  isDarkMode,
  placeholder = "Select options...",
  error
}: MultiSelectProps) {
  const theme = getTheme(isDarkMode)
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(s => s !== value))
    } else if (!maxSelections || selected.length < maxSelections) {
      onChange([...selected, value])
    }
  }

  const selectedOptions = options.filter(opt => selected.includes(opt.value))
  const canSelectMore = !maxSelections || selected.length < maxSelections

  return (
    <div className="space-y-2">
      {/* Selected Items Display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map(option => (
            <div
              key={option.value}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                backgroundColor: theme.accent + '20',
                color: theme.accent,
                border: `1px solid ${theme.accent}`
              }}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
              <button
                onClick={() => handleToggle(option.value)}
                className="ml-1 hover:scale-110 transition-transform duration-200"
                style={{ color: theme.accent }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selection Counter */}
      <div className="text-sm" style={{ color: theme.text.secondary }}>
        {selected.length} selected
        {maxSelections && ` (max ${maxSelections})`}
        {minSelections > 0 && ` (min ${minSelections})`}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map(option => {
          const isSelected = selected.includes(option.value)
          const isDisabled = !isSelected && !canSelectMore

          return (
            <div
              key={option.value}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'
              } ${isSelected ? 'animate-fadeIn' : ''}`}
              style={{
                backgroundColor: isSelected ? theme.accent + '15' : theme.cardBg,
                borderColor: isSelected ? theme.accent : theme.border,
                color: theme.text.primary
              }}
              onClick={() => !isDisabled && handleToggle(option.value)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {option.icon && <span className="text-lg">{option.icon}</span>}
                  <div>
                    <h4 className="font-medium">{option.label}</h4>
                    {option.description && (
                      <p className="text-sm" style={{ color: theme.text.secondary }}>
                        {option.description}
                      </p>
                    )}
                  </div>
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
                    <span style={{ color: '#000', fontSize: '12px' }}>✓</span>
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