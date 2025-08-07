'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientBriefContactPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [budget, setBudget] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok || !data.user) {
        // Not authenticated, redirect to login
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get brief data from sessionStorage
      const briefDataStr = sessionStorage.getItem('briefData')
      if (!briefDataStr) {
        throw new Error('Brief data not found')
      }

      const briefData = JSON.parse(briefDataStr)
      
      // Add company name and budget to brief data
      const completeBriefData = {
        ...briefData,
        company_name: companyName,
        budget: budget
      }

      // Create the brief
      const briefResponse = await fetch('/api/briefs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeBriefData),
        credentials: 'include'
      })

      if (!briefResponse.ok) {
        throw new Error('Failed to create brief')
      }

      const { brief } = await briefResponse.json()
      
      // Store brief ID for match page
      sessionStorage.setItem('currentBriefId', brief.id)
      
      // Clear brief data
      sessionStorage.removeItem('briefData')
      
      // Redirect to match page
      router.push('/match')
    } catch (error) {
      console.error('Error submitting brief:', error)
      alert('Failed to create brief. Please try again.')
      setIsSubmitting(false)
    }
  }

  const budgetOptions = [
    { value: '1k-5k', label: '$1k - $5k' },
    { value: '5k-10k', label: '$5k - $10k' },
    { value: '10k-25k', label: '$10k - $25k' },
    { value: '25k-50k', label: '$25k - $50k' },
    { value: '50k+', label: '$50k+' },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-16 animate-in">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-8">💼</div>
          <h1 className="text-4xl font-bold">One last thing!</h1>
          <p className="text-muted-foreground">
            Tell us about your company and budget
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="input w-full"
              required
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Project Budget</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Select budget range</option>
              {budgetOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!companyName || !budget || isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Finding your match...' : 'Find my perfect designer'}
              <span className="ml-2">→</span>
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>This helps us match you with designers in your budget range</p>
        </div>
      </div>
    </main>
  )
}