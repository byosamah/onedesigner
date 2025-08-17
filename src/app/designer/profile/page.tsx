'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { DESIGN_STYLES, PROJECT_TYPES, INDUSTRIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

// Country and city data - same as application form
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'India', 'Brazil', 'Mexico', 'Japan', 'Singapore', 'Spain',
  'Italy', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Belgium', 'Austria',
  'Ireland', 'New Zealand', 'South Korea', 'Israel', 'UAE', 'Portugal',
  'Poland', 'Czech Republic', 'Finland', 'Greece', 'Argentina', 'Chile',
  'Colombia', 'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Turkey',
  'Russia', 'Ukraine', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam',
  'Philippines', 'Pakistan', 'Bangladesh', 'Other'
]

const COUNTRY_CITIES: Record<string, string[]> = {
  'United States': [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'San Francisco', 'Columbus', 'Indianapolis', 'Fort Worth', 'Charlotte',
    'Seattle', 'Denver', 'Boston', 'Miami', 'Portland', 'Other'
  ],
  'United Kingdom': [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds',
    'Sheffield', 'Edinburgh', 'Bristol', 'Leicester', 'Coventry', 'Bradford',
    'Cardiff', 'Belfast', 'Nottingham', 'Newcastle', 'Other'
  ],
  'Canada': [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa',
    'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'Halifax', 'Victoria',
    'Regina', 'Saskatoon', 'Other'
  ],
  'Australia': [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast',
    'Canberra', 'Newcastle', 'Wollongong', 'Hobart', 'Darwin', 'Other'
  ],
  'Germany': [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart',
    'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden',
    'Hanover', 'Nuremberg', 'Other'
  ],
  'France': [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
    'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Other'
  ],
  'Netherlands': [
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen',
    'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Other'
  ],
  'India': [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Visakhapatnam', 'Bhopal', 'Other'
  ],
  'Brazil': [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Other'
  ],
  'Mexico': [
    'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León',
    'Juárez', 'Zapopan', 'Mérida', 'Querétaro', 'Other'
  ],
  'Japan': [
    'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Kobe',
    'Fukuoka', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Other'
  ]
}

// Default cities for countries not in the list
const DEFAULT_CITIES = ['Capital City', 'Major City', 'Other']

// Specializations and software skills
const SPECIALIZATIONS = [
  'UI/UX Design', 'Brand Identity', 'Illustration', 'Motion Graphics',
  'Product Design', 'Packaging Design', 'Environmental Design', 'Editorial Design',
  'Typography', 'Icon Design', 'Data Visualization', '3D Design',
  'Game Design', 'Character Design', 'Social Media Design', 'Email Design'
]

const SOFTWARE_SKILLS = [
  'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Sketch', 'Adobe XD',
  'InDesign', 'After Effects', 'Premiere Pro', 'Blender', 'Cinema 4D',
  'Principle', 'Framer', 'Webflow', 'InVision', 'Zeplin', 'Marvel',
  'Canva', 'Procreate', 'CorelDRAW', 'Affinity Designer'
]

interface DesignerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title: string
  bio: string
  city: string
  country: string
  timezone: string
  yearsExperience: string
  availability: string
  websiteUrl?: string
  portfolioUrl?: string
  dribbbleUrl?: string
  behanceUrl?: string
  linkedinUrl?: string
  portfolioImages?: string[]
  profilePicture?: string
  projectPriceFrom: number
  projectPriceTo: number
  styles?: string[]
  projectTypes?: string[]
  industries?: string[]
  specializations?: string[]
  softwareSkills?: string[]
  previousClients?: string
  projectPreferences?: string
  workingStyle?: string
  communicationStyle?: string
  remoteExperience?: string
  teamCollaboration?: string
  isApproved: boolean
  isVerified: boolean
  status?: 'pending' | 'approved' | 'rejected' | 'resubmitted'
  rejectionReason?: string
}

export default function DesignerProfilePage() {
  const router = useRouter()
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const [profile, setProfile] = useState<DesignerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<DesignerProfile | null>(null)

  useEffect(() => {
    fetchDesignerProfile()
  }, [])

  const fetchDesignerProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/designer/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/designer/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      console.log('Full API response:', data)
      console.log('Designer data:', data.designer)
      logger.info('Profile data received:', data.designer)
      
      // Log specific fields to debug
      console.log('Important fields:', {
        firstName: data.designer?.firstName,
        lastName: data.designer?.lastName,
        title: data.designer?.title,
        bio: data.designer?.bio,
        projectPreferences: data.designer?.projectPreferences,
        workingStyle: data.designer?.workingStyle,
        communicationStyle: data.designer?.communicationStyle,
        remoteExperience: data.designer?.remoteExperience,
        availability: data.designer?.availability,
        country: data.designer?.country,
        city: data.designer?.city,
        yearsExperience: data.designer?.yearsExperience,
        styles: data.designer?.styles,
        projectTypes: data.designer?.projectTypes,
        industries: data.designer?.industries,
        specializations: data.designer?.specializations,
        softwareSkills: data.designer?.softwareSkills
      })
      logger.info('Field values:', {
        bio: data.designer?.bio,
        projectPreferences: data.designer?.projectPreferences,
        workingStyle: data.designer?.workingStyle,
        communicationStyle: data.designer?.communicationStyle,
        remoteExperience: data.designer?.remoteExperience,
        availability: data.designer?.availability,
        country: data.designer?.country,
        city: data.designer?.city
      })
      
      // Ensure all fields have proper defaults
      const profileWithDefaults = {
        ...data.designer,
        // Ensure arrays are always arrays
        styles: data.designer.styles || [],
        projectTypes: data.designer.projectTypes || [],
        industries: data.designer.industries || [],
        specializations: data.designer.specializations || [],
        softwareSkills: data.designer.softwareSkills || [],
        // Ensure strings have empty string defaults instead of null
        country: data.designer.country || '',
        city: data.designer.city || '',
        availability: data.designer.availability || '',
        timezone: data.designer.timezone || '',
        communicationStyle: data.designer.communicationStyle || '',
        phone: data.designer.phone || '',
        bio: data.designer.bio || '',
        previousClients: data.designer.previousClients || '',
        projectPreferences: data.designer.projectPreferences || '',
        workingStyle: data.designer.workingStyle || '',
        remoteExperience: data.designer.remoteExperience || '',
        teamCollaboration: data.designer.teamCollaboration || '',
        websiteUrl: data.designer.websiteUrl || '',
        portfolioUrl: data.designer.portfolioUrl || '',
        dribbbleUrl: data.designer.dribbbleUrl || '',
        behanceUrl: data.designer.behanceUrl || '',
        linkedinUrl: data.designer.linkedinUrl || ''
      }
      
      setProfile(profileWithDefaults)
      setFormData(profileWithDefaults)

    } catch (error) {
      logger.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayInputChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, [field]: items }))
  }

  const handlePortfolioImageUpload = async (index: number, file: File | null) => {
    if (!file) return

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Image must be less than 5MB')
      return
    }

    // Convert to base64 for preview (in production, you'd upload to a service)
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => {
        const newImages = [...(prev.portfolioImages || [])]
        newImages[index] = base64String
        return { ...prev, portfolioImages: newImages }
      })
    }
    reader.readAsDataURL(file)
  }

  const removePortfolioImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.portfolioImages || [])]
      newImages.splice(index, 1)
      return { ...prev, portfolioImages: newImages }
    })
  }

  const handleProfilePictureUpload = async (file: File | null) => {
    if (!file) return

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Image must be less than 5MB')
      return
    }

    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => ({ ...prev, profilePicture: base64String }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/designer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setProfile(data.designer)
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)

      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (error) {
      logger.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/designer/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/designer/login')
    } catch (error) {
      logger.error('Signout error:', error)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="text-5xl mb-6 animate-pulse">⚡</div>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Loading your profile...
          </h2>
        </div>
      </main>
    )
  }

  if (error && !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Profile Error
          </h2>
          <p className="mb-6" style={{ color: theme.text.secondary }}>
            {error}
          </p>
          <button
            onClick={() => fetchDesignerProfile()}
            className="px-6 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
              </svg>
              OneDesigner
            </Link>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: theme.tagBg, color: theme.text.secondary }}>
              Designer Profile
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none hover:shadow-md"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
              aria-label="Toggle theme"
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs"
                style={{
                  left: isDarkMode ? '2px' : '32px',
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  transform: isDarkMode ? 'rotate(0deg)' : 'rotate(360deg)'
                }}
              >
                {isDarkMode ? '🌙' : '☀️'}
              </div>
            </button>
            
            <Link
              href="/designer/dashboard"
              className="font-medium py-2 px-4 rounded-xl transition-all duration-300 hover:opacity-80"
              style={{ color: theme.text.secondary }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
            My Profile
          </h1>
          <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
            Manage your designer profile and portfolio
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl animate-slideUp" style={{
            backgroundColor: theme.success + '20',
            border: `1px solid ${theme.success}`,
            color: theme.success
          }}>
            <div className="flex items-center gap-3">
              <span>✅</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl animate-slideUp" style={{
            backgroundColor: theme.error + '20',
            border: `1px solid ${theme.error}`,
            color: theme.error
          }}>
            <div className="flex items-center gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Rejection Feedback Banner */}
        {profile?.status === 'rejected' && profile.rejectionReason && (
          <div className="mb-6 p-6 rounded-2xl animate-slideUp" style={{
            backgroundColor: theme.warning + '10',
            border: `2px solid ${theme.warning}`,
            borderLeft: `6px solid ${theme.warning}`
          }}>
            <div className="flex items-start gap-4">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2" style={{ color: theme.text.primary }}>
                  Application Update Required
                </h3>
                <p className="mb-3" style={{ color: theme.text.primary }}>
                  <strong>Feedback from our review team:</strong>
                </p>
                <p className="p-3 rounded-xl" style={{ 
                  backgroundColor: theme.nestedBg,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border}`
                }}>
                  {profile.rejectionReason}
                </p>
                <p className="mt-3 text-sm" style={{ color: theme.text.secondary }}>
                  Please update your profile based on this feedback and click "Resubmit for Review" when done.
                </p>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <>
            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 rounded-xl text-xs font-mono" style={{ backgroundColor: theme.nestedBg, color: theme.text.muted }}>
                <details>
                  <summary>Debug: Profile Data</summary>
                  <pre>{JSON.stringify({
                    hasData: !!formData,
                    bio: formData.bio || 'EMPTY',
                    projectPreferences: formData.projectPreferences || 'EMPTY',
                    workingStyle: formData.workingStyle || 'EMPTY',
                    communicationStyle: formData.communicationStyle || 'EMPTY',
                    remoteExperience: formData.remoteExperience || 'EMPTY',
                    availability: formData.availability || 'EMPTY',
                    country: formData.country || 'EMPTY',
                    city: formData.city || 'EMPTY',
                    styles: formData.styles,
                    projectTypes: formData.projectTypes,
                    industries: formData.industries
                  }, null, 2)}</pre>
                </details>
              </div>
            )}
            
            {/* Profile Status */}
            <div className="rounded-2xl p-6 mb-8 transition-all duration-300" style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: theme.accent, color: '#000' }}>
                    {profile.firstName?.[0] || 'D'}{profile.lastName?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-sm" style={{ color: theme.text.secondary }}>
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {profile.isApproved ? (
                    <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: theme.success + '20', color: theme.success }}>
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                      ⏳ Under Review
                    </span>
                  )}
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        backgroundColor: theme.accent,
                        color: '#000'
                      }}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                        style={{
                          backgroundColor: theme.success,
                          color: '#FFF'
                        }}
                      >
                        {isSaving ? 'Saving...' : profile?.status === 'rejected' ? 'Resubmit for Review' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setFormData(profile)
                        }}
                        className="font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          backgroundColor: 'transparent',
                          border: `2px solid ${theme.border}`,
                          color: theme.text.secondary
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Warning when editing approved profile */}
              {isEditing && profile.isApproved && (
                <div 
                  className="mt-4 p-4 rounded-xl flex items-start gap-3"
                  style={{
                    backgroundColor: theme.accent + '10',
                    border: `1px solid ${theme.accent}40`
                  }}
                >
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                      Profile Review Required
                    </p>
                    <p className="text-sm" style={{ color: theme.text.secondary }}>
                      Editing your profile will require admin approval again. Your profile will be marked as "Under Review" after saving changes.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Notice about missing required fields */}
              {!isEditing && (
                (!formData.country || !formData.city || !formData.availability || !formData.bio || 
                 formData.styles?.length === 0 || formData.projectTypes?.length === 0 || 
                 formData.industries?.length === 0 || !formData.projectPreferences || 
                 !formData.workingStyle || !formData.communicationStyle || !formData.remoteExperience) && (
                  <div 
                    className="mt-4 p-4 rounded-xl flex items-start gap-3"
                    style={{
                      backgroundColor: theme.error + '10',
                      border: `1px solid ${theme.error}40`
                    }}
                  >
                    <span className="text-lg">❗</span>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                        Incomplete Profile
                      </p>
                      <p className="text-sm" style={{ color: theme.text.secondary }}>
                        Some required fields from your application are missing. Please edit your profile to complete all required information.
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Current User Info */}
              {profile?.email && (
                <div className="rounded-2xl p-4 mb-4 bg-opacity-50" style={{
                  backgroundColor: theme.accent + '10',
                  border: `1px solid ${theme.accent}40`
                }}>
                  <p className="text-sm" style={{ color: theme.text.primary }}>
                    Currently logged in as: <strong>{profile.email}</strong>
                  </p>
                </div>
              )}

              {/* Profile Picture */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Profile Picture
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <input
                      type="file"
                      id="profile-picture-edit"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleProfilePictureUpload(e.target.files?.[0] || null)}
                      disabled={!isEditing}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-picture-edit"
                      className={`block w-32 h-32 rounded-full border-2 overflow-hidden transition-all duration-300 ${
                        isEditing ? 'cursor-pointer hover:scale-105 border-dashed' : 'cursor-not-allowed opacity-70'
                      }`}
                      style={{
                        backgroundColor: theme.nestedBg,
                        borderColor: theme.border
                      }}
                    >
                      {formData.profilePicture ? (
                        <img
                          src={formData.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-3xl mb-2">📷</span>
                          <span className="text-xs text-center px-2" style={{ color: theme.text.muted }}>
                            {isEditing ? 'Click to upload' : 'No photo'}
                          </span>
                        </div>
                      )}
                    </label>
                    {formData.profilePicture && isEditing && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, profilePicture: '' }))}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          backgroundColor: theme.error,
                          color: '#fff'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: theme.text.secondary }}>
                    <p>• Your professional photo or personal logo</p>
                    <p>• JPG, PNG, or WebP format (max 5MB)</p>
                    <p>• Square image recommended</p>
                    <p>• Shown to potential clients in matches</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Location & Availability */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Location & Availability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Country
                    </label>
                    <select
                      value={formData.country || ''}
                      onChange={(e) => {
                        handleInputChange('country', e.target.value)
                        handleInputChange('city', '') // Reset city when country changes
                      }}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      City
                    </label>
                    <select
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing || !formData.country}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing || !formData.country ? 0.7 : 1
                      }}
                    >
                      <option value="">Select city</option>
                      {formData.country && (COUNTRY_CITIES[formData.country] || DEFAULT_CITIES).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Years of Experience
                    </label>
                    <select
                      value={formData.yearsExperience || ''}
                      onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    >
                      <option value="">Select experience</option>
                      <option value="0-2">0-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Availability
                    </label>
                    <select
                      value={formData.availability || ''}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    >
                      <option value="">Select availability</option>
                      <option value="immediate">Immediate</option>
                      <option value="1_week">Within 1 week</option>
                      <option value="2_weeks">Within 2 weeks</option>
                      <option value="1_month">Within 1 month</option>
                      <option value="unavailable">Currently unavailable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Professional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Bio
                    </label>
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                        Project Price From ($)
                      </label>
                      <input
                        type="number"
                        value={formData.projectPriceFrom || ''}
                        onChange={(e) => handleInputChange('projectPriceFrom', parseInt(e.target.value))}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: theme.nestedBg,
                          border: `2px solid ${theme.border}`,
                          color: theme.text.primary,
                          opacity: !isEditing ? 0.7 : 1
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                        Project Price To ($)
                      </label>
                      <input
                        type="number"
                        value={formData.projectPriceTo || ''}
                        onChange={(e) => handleInputChange('projectPriceTo', parseInt(e.target.value))}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: theme.nestedBg,
                          border: `2px solid ${theme.border}`,
                          color: theme.text.primary,
                          opacity: !isEditing ? 0.7 : 1
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Links */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Portfolio Links
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.websiteUrl || ''}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={formData.portfolioUrl || ''}
                      onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                        Dribbble
                      </label>
                      <input
                        type="url"
                        value={formData.dribbbleUrl || ''}
                        onChange={(e) => handleInputChange('dribbbleUrl', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: theme.nestedBg,
                          border: `2px solid ${theme.border}`,
                          color: theme.text.primary,
                          opacity: !isEditing ? 0.7 : 1
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                        Behance
                      </label>
                      <input
                        type="url"
                        value={formData.behanceUrl || ''}
                        onChange={(e) => handleInputChange('behanceUrl', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: theme.nestedBg,
                          border: `2px solid ${theme.border}`,
                          color: theme.text.primary,
                          opacity: !isEditing ? 0.7 : 1
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.linkedinUrl || ''}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: theme.nestedBg,
                          border: `2px solid ${theme.border}`,
                          color: theme.text.primary,
                          opacity: !isEditing ? 0.7 : 1
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Images */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Portfolio Samples
                </h3>
                <p className="text-sm mb-4" style={{ color: theme.text.secondary }}>
                  Upload your best work samples (max 3 images, 5MB each)
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="relative">
                      <input
                        type="file"
                        id={`portfolio-image-edit-${index}`}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handlePortfolioImageUpload(index, e.target.files?.[0] || null)}
                        disabled={!isEditing}
                        className="hidden"
                      />
                      <label
                        htmlFor={`portfolio-image-edit-${index}`}
                        className={`block aspect-square rounded-xl border-2 border-dashed overflow-hidden transition-all duration-300 ${
                          isEditing ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-70'
                        }`}
                        style={{
                          backgroundColor: theme.nestedBg,
                          borderColor: theme.border
                        }}
                      >
                        {formData.portfolioImages?.[index] ? (
                          <img
                            src={formData.portfolioImages[index]}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <span className="text-2xl mb-2">📸</span>
                            <span className="text-xs text-center px-2" style={{ color: theme.text.muted }}>
                              {isEditing ? 'Click to upload' : 'No image'}
                            </span>
                          </div>
                        )}
                      </label>
                      {formData.portfolioImages?.[index] && isEditing && (
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            backgroundColor: theme.error,
                            color: '#fff'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills & Expertise */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Skills & Expertise
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: theme.text.secondary }}>
                      Design Styles
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {DESIGN_STYLES.map((style) => (
                        <label
                          key={style.id}
                          className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                          style={{
                            backgroundColor: formData.styles?.includes(style.id) ? theme.accent + '20' : theme.nestedBg,
                            border: `2px solid ${formData.styles?.includes(style.id) ? theme.accent : theme.border}`,
                            color: theme.text.primary
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.styles?.includes(style.id) || false}
                            onChange={(e) => {
                              if (!isEditing) return
                              const newStyles = e.target.checked
                                ? [...(formData.styles || []), style.id]
                                : (formData.styles || []).filter(s => s !== style.id)
                              handleInputChange('styles', newStyles)
                            }}
                            disabled={!isEditing}
                            className="sr-only"
                          />
                          <span>{style.emoji} {style.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: theme.text.secondary }}>
                      Project Types
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PROJECT_TYPES.map((type) => (
                        <label
                          key={type.id}
                          className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                          style={{
                            backgroundColor: formData.projectTypes?.includes(type.id) ? theme.accent + '20' : theme.nestedBg,
                            border: `2px solid ${formData.projectTypes?.includes(type.id) ? theme.accent : theme.border}`,
                            color: theme.text.primary
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.projectTypes?.includes(type.id) || false}
                            onChange={(e) => {
                              if (!isEditing) return
                              const newTypes = e.target.checked
                                ? [...(formData.projectTypes || []), type.id]
                                : (formData.projectTypes || []).filter(t => t !== type.id)
                              handleInputChange('projectTypes', newTypes)
                            }}
                            disabled={!isEditing}
                            className="sr-only"
                          />
                          <span>{type.emoji} {type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: theme.text.secondary }}>
                      Industries
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {INDUSTRIES.map((industry) => (
                        <label
                          key={industry}
                          className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                          style={{
                            backgroundColor: formData.industries?.includes(industry) ? theme.accent + '20' : theme.nestedBg,
                            border: `2px solid ${formData.industries?.includes(industry) ? theme.accent : theme.border}`,
                            color: theme.text.primary
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.industries?.includes(industry) || false}
                            onChange={(e) => {
                              if (!isEditing) return
                              const newIndustries = e.target.checked
                                ? [...(formData.industries || []), industry]
                                : (formData.industries || []).filter(i => i !== industry)
                              handleInputChange('industries', newIndustries)
                            }}
                            disabled={!isEditing}
                            className="sr-only"
                          />
                          <span>{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: theme.text.secondary }}>
                      Specializations
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SPECIALIZATIONS.map((spec) => (
                        <label
                          key={spec}
                          className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                          style={{
                            backgroundColor: formData.specializations?.includes(spec) ? theme.accent + '20' : theme.nestedBg,
                            border: `2px solid ${formData.specializations?.includes(spec) ? theme.accent : theme.border}`,
                            color: theme.text.primary
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.specializations?.includes(spec) || false}
                            onChange={(e) => {
                              if (!isEditing) return
                              const newSpecs = e.target.checked
                                ? [...(formData.specializations || []), spec]
                                : (formData.specializations || []).filter(s => s !== spec)
                              handleInputChange('specializations', newSpecs)
                            }}
                            disabled={!isEditing}
                            className="sr-only"
                          />
                          <span>{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: theme.text.secondary }}>
                      Software Skills
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SOFTWARE_SKILLS.map((software) => (
                        <label
                          key={software}
                          className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                          style={{
                            backgroundColor: formData.softwareSkills?.includes(software) ? theme.accent + '20' : theme.nestedBg,
                            border: `2px solid ${formData.softwareSkills?.includes(software) ? theme.accent : theme.border}`,
                            color: theme.text.primary
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.softwareSkills?.includes(software) || false}
                            onChange={(e) => {
                              if (!isEditing) return
                              const newSkills = e.target.checked
                                ? [...(formData.softwareSkills || []), software]
                                : (formData.softwareSkills || []).filter(s => s !== software)
                              handleInputChange('softwareSkills', newSkills)
                            }}
                            disabled={!isEditing}
                            className="sr-only"
                          />
                          <span>{software}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Style */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>
                  Working Style & Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Project Preferences
                    </label>
                    <textarea
                      value={formData.projectPreferences || ''}
                      onChange={(e) => handleInputChange('projectPreferences', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Describe your ideal projects..."
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Working Style
                    </label>
                    <textarea
                      value={formData.workingStyle || ''}
                      onChange={(e) => handleInputChange('workingStyle', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="How do you approach projects..."
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Communication Style
                    </label>
                    <select
                      value={formData.communicationStyle || ''}
                      onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    >
                      <option value="">Select communication style</option>
                      <option value="direct">Direct & Straightforward</option>
                      <option value="detailed">Detailed & Thorough</option>
                      <option value="collaborative">Collaborative & Interactive</option>
                      <option value="minimal">Minimal & Essential Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                      Remote Work Experience
                    </label>
                    <textarea
                      value={formData.remoteExperience || ''}
                      onChange={(e) => handleInputChange('remoteExperience', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Describe your remote work experience..."
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                      style={{
                        backgroundColor: theme.nestedBg,
                        border: `2px solid ${theme.border}`,
                        color: theme.text.primary,
                        opacity: !isEditing ? 0.7 : 1
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}