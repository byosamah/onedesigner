'use client'

import { getTheme } from '@/lib/design-system'
import { DESIGN_CATEGORIES } from '@/lib/constants'

interface CategorySelectorProps {
  selected?: string
  onChange: (categoryId: string) => void
  isDarkMode: boolean
  error?: string
  options?: Array<{
    value: string
    label: string
    description: string
    icon: string
  }>
}

export function CategorySelector({ selected, onChange, isDarkMode, error, options }: CategorySelectorProps) {
  const theme = getTheme(isDarkMode)
  const categories = options || Object.values(DESIGN_CATEGORIES).map(cat => ({
    value: cat.id,
    label: cat.name,
    description: cat.description,
    icon: cat.icon,
    subcategories: cat.subcategories
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(category => (
          <div
            key={category.value}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              selected === category.value ? 'animate-slideUp' : ''
            }`}
            style={{
              backgroundColor: selected === category.value ? theme.accent : theme.cardBg,
              borderColor: selected === category.value ? theme.accent : theme.border,
              color: selected === category.value ? '#000' : theme.text.primary
            }}
            onClick={() => onChange(category.value)}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="font-bold text-lg">{category.label}</h3>
            </div>
            <p style={{ color: selected === category.value ? '#000' : theme.text.secondary }} className="text-sm mb-3 opacity-80">
              {category.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {(category as any).subcategories && (category as any).subcategories.slice(0, 2).map((sub: string) => (
                <span 
                  key={sub}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: selected === category.value ? 'rgba(0,0,0,0.1)' : theme.nestedBg,
                    color: selected === category.value ? '#000' : theme.text.muted
                  }}
                >
                  {sub}
                </span>
              ))}
              {(category as any).subcategories && (category as any).subcategories.length > 2 && (
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: selected === category.value ? 'rgba(0,0,0,0.1)' : theme.nestedBg,
                    color: selected === category.value ? '#000' : theme.text.muted
                  }}
                >
                  +{(category as any).subcategories.length - 2}
                </span>
              )}
            </div>
            {selected === category.value && (
              <div className="mt-3 flex items-center gap-2 animate-fadeIn">
                <span style={{ color: '#000' }}>✓</span>
                <span className="text-sm font-medium" style={{ color: '#000' }}>
                  Selected
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {error && (
        <p className="text-sm animate-slideUp" style={{ color: theme.error }}>
          {error}
        </p>
      )}
    </div>
  )
}