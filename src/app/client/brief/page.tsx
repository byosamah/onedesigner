'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { PROJECT_TYPES } from '@/lib/constants'
import { getTheme } from '@/lib/design-system'

// Add the 'other' option to project types
const projectTypesWithOther = [
  ...PROJECT_TYPES.map(type => ({ ...type, icon: type.emoji })),
  { id: 'other', label: 'Other', icon: '✨' },
]

export default function ClientBriefPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('')
  const [customType, setCustomType] = useState('')

  const handleContinue = () => {
    if (selectedType || customType) {
      const projectType = selectedType === 'other' ? customType : selectedType
      router.push(`/client/brief/details?type=${encodeURIComponent(projectType)}`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-16 animate-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">What do you need designed?</h1>
          <p className="text-muted-foreground">Select the type of project you need help with</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {projectTypesWithOther.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id)
                setCustomType('')
              }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedType === type.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-medium">{type.label}</div>
            </button>
          ))}
        </div>

        {selectedType === 'other' && (
          <div className="animate-in">
            <input
              type="text"
              placeholder="Describe your project type..."
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="input w-full"
              autoFocus
            />
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType && !customType}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </main>
  )
}