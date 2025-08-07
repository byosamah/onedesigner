'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/shared'
import { LoadingButton } from '@/components/forms'
import { DESIGN_STYLES, PROJECT_TYPES, INDUSTRIES } from '@/lib/constants'
import { getTheme } from '@/lib/design-system'

interface DesignerProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  title: string
  years_experience: number
  website_url?: string
  hourly_rate?: number
  city: string
  country: string
  timezone: string
  bio?: string
  styles: string[]
  project_types: string[]
  industries: string[]
  is_available: boolean
  portfolio_items?: any[]
  calendly_url?: string
  linkedin_url?: string
}

export default function DesignerProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<DesignerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    checkAuthAndFetchProfile()
  }, [])

  const checkAuthAndFetchProfile = async () => {
    try {
      const response = await fetch('/api/designer/auth/session', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/designer/login')
        return
      }

      const data = await response.json()
      setProfile(data.designer)
    } catch (error) {
      console.error('Error fetching profile:', error)
      router.push('/designer/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStyleToggle = (styleId: string) => {
    if (!profile) return
    
    setProfile(prev => ({
      ...prev!,
      styles: prev!.styles.includes(styleId)
        ? prev!.styles.filter(s => s !== styleId)
        : [...prev!.styles, styleId]
    }))
  }

  const handleProjectTypeToggle = (typeId: string) => {
    if (!profile) return
    
    setProfile(prev => ({
      ...prev!,
      project_types: prev!.project_types.includes(typeId)
        ? prev!.project_types.filter(t => t !== typeId)
        : [...prev!.project_types, typeId]
    }))
  }

  const handleSave = async () => {
    if (!profile) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/designer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Profile not found</p>
          <Link href="/designer/dashboard" className="btn-primary mt-4">
            Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Edit Profile</h1>
          <Link href="/designer/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {['basic', 'professional', 'expertise', 'availability'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab} Info
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Professional Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <select
                    value={profile.years_experience}
                    onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) })}
                    className="input w-full"
                  >
                    <option value="0">0-2 years</option>
                    <option value="3">3-5 years</option>
                    <option value="6">6-10 years</option>
                    <option value="10">10+ years</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Portfolio Website</label>
                  <input
                    type="url"
                    value={profile.website_url || ''}
                    onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Calendly URL</label>
                  <input
                    type="url"
                    value={profile.calendly_url || ''}
                    onChange={(e) => setProfile({ ...profile, calendly_url: e.target.value })}
                    placeholder="https://calendly.com/yourname"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profile.linkedin_url || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourname"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Hourly Rate (USD)</label>
                  <input
                    type="number"
                    value={profile.hourly_rate || ''}
                    onChange={(e) => setProfile({ ...profile, hourly_rate: parseInt(e.target.value) })}
                    placeholder="150"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself and your work..."
                    className="input w-full h-32 resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'expertise' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Expertise & Style</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-4">
                    Design Styles (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {designStyles.map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handleStyleToggle(style.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-sm ${
                          profile.styles?.includes(style.id)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-4">
                    Project Types (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {projectTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleProjectTypeToggle(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-sm ${
                          profile.project_types?.includes(type.id)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Availability Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="input w-full"
                  >
                    <option value="PST">Pacific Time (PST/PDT)</option>
                    <option value="MST">Mountain Time (MST/MDT)</option>
                    <option value="CST">Central Time (CST/CDT)</option>
                    <option value="EST">Eastern Time (EST/EDT)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="CET">Central European Time (CET)</option>
                    <option value="IST">India Standard Time (IST)</option>
                    <option value="JST">Japan Standard Time (JST)</option>
                    <option value="AEST">Australian Eastern Time (AEST)</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.is_available}
                      onChange={(e) => setProfile({ ...profile, is_available: e.target.checked })}
                      className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium">Available for new projects</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-7">
                    When unchecked, you won't receive new match requests
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}