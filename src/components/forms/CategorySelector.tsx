'use client'

import { getTheme } from '@/lib/design-system'
import { DESIGN_CATEGORIES } from '@/lib/constants'

interface CategorySelectorProps {
  selected?: string
  onSelect: (categoryId: string) => void
  isDarkMode: boolean
  error?: string
}

export function CategorySelector({ selected, onSelect, isDarkMode, error }: CategorySelectorProps) {
  const theme = getTheme(isDarkMode)
  const categories = Object.values(DESIGN_CATEGORIES)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(category => (
          <div
            key={category.id}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              selected === category.id ? 'animate-slideUp' : ''
            }`}
            style={{
              backgroundColor: selected === category.id ? theme.accent + '20' : theme.cardBg,
              borderColor: selected === category.id ? theme.accent : theme.border,
              color: theme.text.primary
            }}
            onClick={() => onSelect(category.id)}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="font-bold text-lg">{category.name}</h3>
            </div>
            <p style={{ color: theme.text.secondary }} className="text-sm mb-3">
              {category.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {category.subcategories.slice(0, 2).map(sub => (
                <span 
                  key={sub}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: theme.nestedBg,
                    color: theme.text.muted
                  }}
                >
                  {sub}
                </span>
              ))}
              {category.subcategories.length > 2 && (
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: theme.nestedBg,
                    color: theme.text.muted
                  }}
                >
                  +{category.subcategories.length - 2}
                </span>
              )}
            </div>
            {selected === category.id && (
              <div className="mt-3 flex items-center gap-2 animate-fadeIn">
                <span style={{ color: theme.accent }}>✓</span>
                <span className="text-sm font-medium" style={{ color: theme.accent }}>
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