'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const industries = [
  'Technology/SaaS',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Real Estate',
  'Food & Beverage',
  'Fashion',
  'Entertainment',
  'Non-profit',
  'Other',
]

const timelines = [
  { value: '1-week', label: '1 week' },
  { value: '2-weeks', label: '2 weeks' },
  { value: '1-month', label: '1 month' },
  { value: '2-months', label: '2 months' },
  { value: 'flexible', label: 'Flexible' },
]

const styles = [
  { id: 'minimal', label: 'Minimal & Clean' },
  { id: 'modern', label: 'Modern & Bold' },
  { id: 'playful', label: 'Playful & Fun' },
  { id: 'corporate', label: 'Corporate & Professional' },
  { id: 'elegant', label: 'Elegant & Sophisticated' },
  { id: 'technical', label: 'Technical & Data-driven' },
]

export default function ClientBriefDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientBriefDetailsContent />
    </Suspense>
  )
}

function ClientBriefDetailsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectType = searchParams.get('type') || ''

  const [formData, setFormData] = useState({
    industry: '',
    timeline: '',
    styles: [] as string[],
    inspiration: '',
    requirements: '',
  })

  const handleStyleToggle = (styleId: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(styleId)
        ? prev.styles.filter(s => s !== styleId)
        : [...prev.styles, styleId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Store brief data in sessionStorage for now
    const briefData = {
      projectType,
      ...formData,
    }
    sessionStorage.setItem('briefData', JSON.stringify(briefData))
    
    router.push('/client/brief/contact')
  }

  const isValid = formData.industry && formData.timeline && formData.styles.length > 0

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="w-full max-w-2xl mx-auto space-y-16 animate-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Tell us about your project</h1>
          <p className="text-muted-foreground">
            Help us find the perfect designer for your {projectType}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-4">
            <label className="block text-lg font-medium">
              What industry are you in?
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select an industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-medium">
              What's your timeline?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timelines.map(timeline => (
                <button
                  key={timeline.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeline: timeline.value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.timeline === timeline.value
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {timeline.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-medium">
              What style are you looking for? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {styles.map(style => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleStyleToggle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.styles.includes(style.id)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-medium">
              Any inspiration or references? (Optional)
            </label>
            <textarea
              value={formData.inspiration}
              onChange={(e) => setFormData({ ...formData, inspiration: e.target.value })}
              placeholder="e.g., 'I love the clean design of Linear.app' or 'Something like Stripe but warmer'"
              className="input w-full h-24 resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-medium">
              Special requirements? (Optional)
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="e.g., 'Must have dark mode' or 'Need Figma files'"
              className="input w-full h-24 resize-none"
            />
          </div>

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={!isValid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <span className="ml-2">→</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}