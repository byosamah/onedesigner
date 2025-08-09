'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingButton } from '@/components/forms'
import { LoadingSpinner } from '@/components/shared'
import { DESIGN_STYLES, PROJECT_TYPES, INDUSTRIES } from '@/lib/constants'
import { useTheme } from '@/lib/hooks/useTheme'

// Comprehensive list of countries
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea',
  'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
].sort()

const COUNTRY_TIMEZONES: Record<string, string> = {
  'United States': 'ET/CT/MT/PT',
  'United Kingdom': 'GMT/BST',
  'Canada': 'ET/CT/MT/PT',
  'Australia': 'AEST/ACST/AWST',
  'Germany': 'CET/CEST',
  'France': 'CET/CEST',
  'Netherlands': 'CET/CEST',
  'India': 'IST',
  'Brazil': 'BRT',
  'Mexico': 'CST/MST/PST',
  'Japan': 'JST',
  'China': 'CST',
  'Russia': 'MSK/+3 to +12',
  'Spain': 'CET/CEST',
  'Italy': 'CET/CEST',
  'South Korea': 'KST',
  'Argentina': 'ART',
  'South Africa': 'SAST',
  'Egypt': 'EET',
  'Nigeria': 'WAT',
  'Kenya': 'EAT',
  'Saudi Arabia': 'AST',
  'UAE': 'GST',
  'Singapore': 'SGT',
  'Thailand': 'ICT',
  'Indonesia': 'WIB/WITA/WIT',
  'Philippines': 'PHT',
  'Vietnam': 'ICT',
  'Turkey': 'TRT',
  'Poland': 'CET/CEST',
  'Sweden': 'CET/CEST',
  'Norway': 'CET/CEST',
  'Denmark': 'CET/CEST',
  'Finland': 'EET/EEST',
  'Greece': 'EET/EEST',
  'Portugal': 'WET/WEST',
  'Belgium': 'CET/CEST',
  'Switzerland': 'CET/CEST',
  'Austria': 'CET/CEST',
  'Czech Republic': 'CET/CEST',
  'Hungary': 'CET/CEST',
  'Romania': 'EET/EEST',
  'Ukraine': 'EET/EEST',
  'Israel': 'IST',
  'New Zealand': 'NZST/NZDT',
  'Chile': 'CLT/CLST',
  'Colombia': 'COT',
  'Peru': 'PET',
  'Venezuela': 'VET',
  'Morocco': 'WET',
  'Pakistan': 'PKT',
  'Bangladesh': 'BST',
  'Malaysia': 'MYT',
  'Ireland': 'GMT/IST'
}

const CITY_TIMEZONES: Record<string, string> = {
  // US Cities
  'New York': 'ET (UTC-5)',
  'Los Angeles': 'PT (UTC-8)',
  'Chicago': 'CT (UTC-6)',
  'Houston': 'CT (UTC-6)',
  'Phoenix': 'MT (UTC-7)',
  'Philadelphia': 'ET (UTC-5)',
  'San Antonio': 'CT (UTC-6)',
  'San Diego': 'PT (UTC-8)',
  'Dallas': 'CT (UTC-6)',
  'San Jose': 'PT (UTC-8)',
  'Austin': 'CT (UTC-6)',
  'Jacksonville': 'ET (UTC-5)',
  'San Francisco': 'PT (UTC-8)',
  'Seattle': 'PT (UTC-8)',
  'Denver': 'MT (UTC-7)',
  'Boston': 'ET (UTC-5)',
  'Nashville': 'CT (UTC-6)',
  'Portland': 'PT (UTC-8)',
  'Las Vegas': 'PT (UTC-8)',
  'Miami': 'ET (UTC-5)',
  'Atlanta': 'ET (UTC-5)',
  // UK Cities
  'London': 'GMT (UTC+0)',
  'Birmingham': 'GMT (UTC+0)',
  'Manchester': 'GMT (UTC+0)',
  'Glasgow': 'GMT (UTC+0)',
  'Edinburgh': 'GMT (UTC+0)',
  // Canada Cities
  'Toronto': 'ET (UTC-5)',
  'Montreal': 'ET (UTC-5)',
  'Vancouver': 'PT (UTC-8)',
  'Calgary': 'MT (UTC-7)',
  'Edmonton': 'MT (UTC-7)',
  'Ottawa': 'ET (UTC-5)',
  // Australia Cities
  'Sydney': 'AEST (UTC+10)',
  'Melbourne': 'AEST (UTC+10)',
  'Brisbane': 'AEST (UTC+10)',
  'Perth': 'AWST (UTC+8)',
  'Adelaide': 'ACST (UTC+9.5)',
  // Germany Cities
  'Berlin': 'CET (UTC+1)',
  'Hamburg': 'CET (UTC+1)',
  'Munich': 'CET (UTC+1)',
  'Frankfurt': 'CET (UTC+1)',
  // France Cities
  'Paris': 'CET (UTC+1)',
  'Marseille': 'CET (UTC+1)',
  'Lyon': 'CET (UTC+1)',
  // Netherlands Cities
  'Amsterdam': 'CET (UTC+1)',
  'Rotterdam': 'CET (UTC+1)',
  'The Hague': 'CET (UTC+1)',
  // India Cities
  'Mumbai': 'IST (UTC+5.5)',
  'Delhi': 'IST (UTC+5.5)',
  'Bangalore': 'IST (UTC+5.5)',
  'Hyderabad': 'IST (UTC+5.5)',
  // Brazil Cities
  'São Paulo': 'BRT (UTC-3)',
  'Rio de Janeiro': 'BRT (UTC-3)',
  'Brasília': 'BRT (UTC-3)',
  // Mexico Cities
  'Mexico City': 'CST (UTC-6)',
  'Guadalajara': 'CST (UTC-6)',
  'Monterrey': 'CST (UTC-6)',
  'Tijuana': 'PST (UTC-8)',
  // Japan Cities
  'Tokyo': 'JST (UTC+9)',
  'Osaka': 'JST (UTC+9)',
  'Kyoto': 'JST (UTC+9)',
  // Default
  'Other': 'Local Time'
}

const COUNTRIES_AND_CITIES = {
  'United States': [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'San Francisco', 'Seattle', 'Denver', 'Boston', 'Nashville', 'Portland',
    'Las Vegas', 'Miami', 'Atlanta', 'Other'
  ],
  'United Kingdom': [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds',
    'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Belfast', 'Newcastle',
    'Brighton', 'Cambridge', 'Oxford', 'Other'
  ],
  'Canada': [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa',
    'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'Halifax', 'Victoria',
    'Other'
  ],
  'Australia': [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast',
    'Newcastle', 'Canberra', 'Wollongong', 'Hobart', 'Darwin', 'Other'
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

// For countries not in the above list, provide a default set of options
const DEFAULT_CITIES = ['Capital City', 'Major City', 'Other']

export default function DesignerApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getTimezone = (country: string, city: string): string => {
    if (city && city !== 'Other' && CITY_TIMEZONES[city]) {
      return CITY_TIMEZONES[city]
    }
    if (country && COUNTRY_TIMEZONES[country]) {
      return COUNTRY_TIMEZONES[country]
    }
    // Default timezone for countries not in the list
    if (country) {
      return 'Local Time'
    }
    return ''
  }

  // Remove the automatic timezone effect - we'll handle it in onChange instead

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Step 2: Professional Info
    title: '',
    yearsExperience: '',
    websiteUrl: '',
    projectPriceFrom: '',
    projectPriceTo: '',
    
    // Step 3: Location & Availability
    city: '',
    country: '',
    timezone: '',
    availability: 'immediate',
    
    // Step 4: Style & Expertise
    styles: [] as string[],
    projectTypes: [] as string[],
    industries: [] as string[],
    bio: '',

    // Step 5: Enhanced Portfolio & Skills
    portfolioUrl: '',
    dribbbleUrl: '',
    behanceUrl: '',
    linkedinUrl: '',
    specializations: [] as string[],
    softwareSkills: [] as string[],
    
    // Step 6: Experience & Preferences
    previousClients: '',
    projectPreferences: '',
    workingStyle: '',
    communicationStyle: 'direct',
    remoteExperience: '',
    teamCollaboration: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address'
        }
        // Phone is optional
        break

      case 2:
        if (!formData.title.trim()) newErrors.title = 'Professional title is required'
        if (!formData.yearsExperience) newErrors.yearsExperience = 'Years of experience is required'
        if (!formData.websiteUrl.trim()) {
          newErrors.websiteUrl = 'Portfolio/Website URL is required'
        } else {
          const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[^\s]*)?$/
          if (!urlPattern.test(formData.websiteUrl.trim())) {
            newErrors.websiteUrl = 'Please enter a valid URL (e.g., https://example.com)'
          }
        }
        if (!formData.projectPriceFrom) newErrors.projectPriceFrom = 'Minimum project price is required'
        if (!formData.projectPriceTo) newErrors.projectPriceTo = 'Maximum project price is required'
        if (formData.projectPriceFrom && formData.projectPriceTo && parseInt(formData.projectPriceFrom) > parseInt(formData.projectPriceTo)) {
          newErrors.projectPriceTo = 'Maximum price must be greater than minimum price'
        }
        break

      case 3:
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.country.trim()) newErrors.country = 'Country is required'
        // Timezone is automatically set based on country/city
        break

      case 4:
        if (formData.styles.length === 0) newErrors.styles = 'Please select at least one design style'
        if (formData.projectTypes.length === 0) newErrors.projectTypes = 'Please select at least one project type'
        if (formData.industries.length === 0) newErrors.industries = 'Please select at least one industry'
        if (!formData.bio.trim()) {
          newErrors.bio = 'Bio is required'
        } else if (formData.bio.trim().length < 100) {
          newErrors.bio = 'Bio must be at least 100 characters'
        } else if (formData.bio.trim().length > 500) {
          newErrors.bio = 'Bio must be less than 500 characters'
        }
        break

      case 5:
        if (formData.portfolioUrl && formData.portfolioUrl.trim()) {
          const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[^\s]*)?$/
          if (!urlPattern.test(formData.portfolioUrl.trim())) {
            newErrors.portfolioUrl = 'Please enter a valid URL (e.g., https://example.com)'
          }
        }
        if (formData.specializations.length === 0) newErrors.specializations = 'Please select at least one specialization'
        if (formData.softwareSkills.length === 0) newErrors.softwareSkills = 'Please select at least one software skill'
        break

      case 6:
        if (!formData.projectPreferences.trim()) newErrors.projectPreferences = 'Project preferences is required'
        if (!formData.workingStyle.trim()) newErrors.workingStyle = 'Working style & process is required'
        if (!formData.communicationStyle) newErrors.communicationStyle = 'Communication style is required'
        if (!formData.remoteExperience.trim()) newErrors.remoteExperience = 'Remote work experience is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 6) {
        setStep(step + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleStyleToggle = (styleId: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(styleId)
        ? prev.styles.filter(s => s !== styleId)
        : [...prev.styles, styleId]
    }))
  }

  const handleProjectTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(typeId)
        ? prev.projectTypes.filter(t => t !== typeId)
        : [...prev.projectTypes, typeId]
    }))
  }

  const handleIndustryToggle = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }))
  }

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }))
  }

  const handleSoftwareToggle = (software: string) => {
    setFormData(prev => ({
      ...prev,
      softwareSkills: prev.softwareSkills.includes(software)
        ? prev.softwareSkills.filter(s => s !== software)
        : [...prev.softwareSkills, software]
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    console.log('Submitting form data:', formData)
    try {
      const response = await fetch('/api/designer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Submission error details:', data.details)
        alert(data.error || 'Failed to submit application')
        throw new Error(data.error || 'Failed to submit application')
      }

      // Store email and application data for verification
      sessionStorage.setItem('designerEmail', formData.email)
      sessionStorage.setItem('designerApplication', JSON.stringify(formData))
      
      // Navigate to verification page
      router.push('/designer/apply/verify')
    } catch (error) {
      console.error('Error submitting application:', error)
      // Handle error (show toast, etc)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Basic Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    First Name <span style={{ color: theme.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm mt-1" style={{ color: theme.error }}>
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Last Name <span style={{ color: theme.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm mt-1" style={{ color: theme.error }}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Email <span style={{ color: theme.error }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm mt-1" style={{ color: theme.error }}>
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Professional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Professional Title <span style={{ color: theme.error }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Senior Product Designer"
                />
                {errors.title && (
                  <p className="text-sm mt-1" style={{ color: theme.error }}>
                    {errors.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Years of Experience <span style={{ color: theme.error }}>*</span>
                </label>
                <select
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                >
                  <option value="">Select experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
                {errors.yearsExperience && (
                  <p className="text-sm mt-1" style={{ color: theme.error }}>
                    {errors.yearsExperience}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Portfolio/Website URL <span style={{ color: theme.error }}>*</span>
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: errors.websiteUrl ? theme.error : theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="https://yourportfolio.com"
                />
                {errors.websiteUrl && (
                  <p className="text-sm mt-1" style={{ color: theme.error }}>
                    {errors.websiteUrl}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Average Project Price Range (USD) <span style={{ color: theme.error }}>*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={formData.projectPriceFrom}
                      onChange={(e) => setFormData({ ...formData, projectPriceFrom: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: errors.projectPriceFrom ? theme.error : theme.border,
                        '--tw-ring-color': theme.accent
                      } as any}
                      placeholder="From: 500"
                    />
                    {errors.projectPriceFrom && (
                      <p className="text-sm mt-1" style={{ color: theme.error }}>
                        {errors.projectPriceFrom}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.projectPriceTo}
                      onChange={(e) => setFormData({ ...formData, projectPriceTo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.nestedBg, 
                        color: theme.text.primary,
                        borderColor: errors.projectPriceTo ? theme.error : theme.border,
                        '--tw-ring-color': theme.accent
                      } as any}
                      placeholder="To: 5000"
                    />
                    {errors.projectPriceTo && (
                      <p className="text-sm mt-1" style={{ color: theme.error }}>
                        {errors.projectPriceTo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )

      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Location & Availability
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Country <span style={{ color: theme.error }}>*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => {
                      const newCountry = e.target.value
                      const newTimezone = getTimezone(newCountry, '')
                      setFormData({ ...formData, country: newCountry, city: '', timezone: newTimezone })
                    }}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: errors.country ? theme.error : theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-sm mt-1" style={{ color: theme.error }}>
                      {errors.country}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    City <span style={{ color: theme.error }}>*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      const newCity = e.target.value
                      const newTimezone = getTimezone(formData.country, newCity)
                      setFormData({ ...formData, city: newCity, timezone: newTimezone })
                    }}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: errors.city ? theme.error : theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    disabled={!formData.country}
                  >
                    <option value="">Select city</option>
                    {formData.country && (COUNTRIES_AND_CITIES[formData.country as keyof typeof COUNTRIES_AND_CITIES] || DEFAULT_CITIES).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-sm mt-1" style={{ color: theme.error }}>
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Timezone <span className="text-sm font-normal" style={{ color: theme.text.secondary }}>(Auto-filled)</span>
                </label>
                <input
                  type="text"
                  value={formData.timezone || (formData.country ? 'Select a city to see timezone' : 'Select country first')}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 cursor-not-allowed opacity-75"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: formData.timezone ? theme.text.primary : theme.text.muted,
                    borderColor: theme.border
                  } as any}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Current Availability
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { 
                      value: 'immediate', 
                      label: 'Immediate', 
                      description: 'Available now',
                      icon: '⚡' 
                    },
                    { 
                      value: '1-2weeks', 
                      label: 'Short-term', 
                      description: '1-2 weeks',
                      icon: '📅' 
                    },
                    { 
                      value: '2-4weeks', 
                      label: 'Standard', 
                      description: '2-4 weeks',
                      icon: '📆' 
                    },
                    { 
                      value: '1-2months', 
                      label: 'Flexible', 
                      description: '1+ months',
                      icon: '🗓️' 
                    },
                    { 
                      value: 'unavailable', 
                      label: 'Unavailable', 
                      description: 'Not taking projects',
                      icon: '⏸️' 
                    }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, availability: option.value })}
                      className="relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] text-center"
                      style={{
                        backgroundColor: formData.availability === option.value ? theme.nestedBg : theme.cardBg,
                        borderColor: formData.availability === option.value ? theme.accent : theme.border,
                        color: theme.text.primary
                      }}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold mb-1">{option.label}</div>
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        {option.description}
                      </div>
                      {formData.availability === option.value && (
                        <div 
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.accent }}
                        >
                          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )

      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Style & Expertise
            </h2>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Design Styles (Select all that apply) <span style={{ color: theme.error }}>*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DESIGN_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleToggle(style.id)}
                      className="px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.styles.includes(style.id) ? theme.accent : theme.nestedBg,
                        color: formData.styles.includes(style.id) ? '#000' : theme.text.primary,
                        borderColor: formData.styles.includes(style.id) ? theme.accent : theme.border
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
                {errors.styles && (
                  <p className="text-sm mt-2" style={{ color: theme.error }}>
                    {errors.styles}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Project Types (Select all that apply) <span style={{ color: theme.error }}>*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleProjectTypeToggle(type.id)}
                      className="px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.projectTypes.includes(type.id) ? theme.accent : theme.nestedBg,
                        color: formData.projectTypes.includes(type.id) ? '#000' : theme.text.primary,
                        borderColor: formData.projectTypes.includes(type.id) ? theme.accent : theme.border
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {errors.projectTypes && (
                  <p className="text-sm mt-2" style={{ color: theme.error }}>
                    {errors.projectTypes}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Industries (Select up to 5) <span style={{ color: theme.error }}>*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => handleIndustryToggle(industry)}
                      disabled={formData.industries.length >= 5 && !formData.industries.includes(industry)}
                      className="px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 disabled:opacity-50"
                      style={{
                        backgroundColor: formData.industries.includes(industry) ? theme.accent : theme.nestedBg,
                        color: formData.industries.includes(industry) ? '#000' : theme.text.primary,
                        borderColor: formData.industries.includes(industry) ? theme.accent : theme.border
                      }}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
                {errors.industries && (
                  <p className="text-sm mt-2" style={{ color: theme.error }}>
                    {errors.industries}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Bio <span style={{ color: theme.error }}>*</span>
                </label>
                <p className="text-sm mb-3" style={{ color: theme.text.secondary }}>
                  Help clients understand who you are and why you're the perfect designer for their project.
                </p>
                <div className="space-y-2 mb-3">
                  <p className="text-sm font-medium" style={{ color: theme.text.primary }}>Consider including:</p>
                  <ul className="text-sm space-y-1" style={{ color: theme.text.secondary }}>
                    <li>• Your design philosophy and approach</li>
                    <li>• What drives your passion for design</li>
                    <li>• Your unique strengths and specialties</li>
                    <li>• Notable achievements or experiences</li>
                    <li>• What clients love about working with you</li>
                  </ul>
                </div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none placeholder:text-xs placeholder:opacity-70"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: errors.bio ? theme.error : theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Example: I'm a passionate UI/UX designer with 5+ years of experience creating digital experiences that delight users and drive business results. My approach combines user research, modern aesthetics, and strategic thinking to solve complex design challenges. I specialize in SaaS platforms and have helped 20+ startups transform their ideas into successful products. Clients appreciate my collaborative approach, attention to detail, and ability to deliver on tight deadlines."
                />
                {errors.bio && (
                  <p className="text-sm mt-1" style={{ color: theme.error }}>
                    {errors.bio}
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                  Minimum 100 characters • {formData.bio?.length || 0} / 500 characters
                </p>
              </div>
            </div>
          </>
        )

      case 5:
        const specializations = [
          'UI/UX Design', 'Web Design', 'Mobile App Design', 'Brand Identity', 
          'Logo Design', 'Illustration', 'Print Design', 'Packaging Design',
          'Motion Graphics', 'Product Design', 'Service Design', 'Design Systems'
        ]
        
        const softwareOptions = [
          'Figma', 'Adobe XD', 'Sketch', 'Adobe Photoshop', 'Adobe Illustrator',
          'Adobe InDesign', 'Adobe After Effects', 'Framer', 'Principle', 'InVision',
          'Zeplin', 'Abstract', 'Miro', 'FigJam'
        ]

        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Portfolio & Skills
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Portfolio URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: errors.portfolioUrl ? theme.error : theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://yourportfolio.com"
                  />
                  {errors.portfolioUrl && (
                    <p className="text-sm mt-1" style={{ color: theme.error }}>
                      {errors.portfolioUrl}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Dribbble URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.dribbbleUrl}
                    onChange={(e) => setFormData({ ...formData, dribbbleUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://dribbble.com/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Behance URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.behanceUrl}
                    onChange={(e) => setFormData({ ...formData, behanceUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://behance.net/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    LinkedIn URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: theme.nestedBg, 
                      color: theme.text.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.accent
                    } as any}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Specializations (Select all that apply) <span style={{ color: theme.error }}>*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {specializations.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => handleSpecializationToggle(spec)}
                      className="px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.specializations.includes(spec) ? theme.accent : theme.nestedBg,
                        color: formData.specializations.includes(spec) ? '#000' : theme.text.primary,
                        borderColor: formData.specializations.includes(spec) ? theme.accent : theme.border
                      }}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
                {errors.specializations && (
                  <p className="text-sm mt-2" style={{ color: theme.error }}>
                    {errors.specializations}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Software Skills (Select all that apply) <span style={{ color: theme.error }}>*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {softwareOptions.map((software) => (
                    <button
                      key={software}
                      onClick={() => handleSoftwareToggle(software)}
                      className="px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: formData.softwareSkills.includes(software) ? theme.accent : theme.nestedBg,
                        color: formData.softwareSkills.includes(software) ? '#000' : theme.text.primary,
                        borderColor: formData.softwareSkills.includes(software) ? theme.accent : theme.border
                      }}
                    >
                      {software}
                    </button>
                  ))}
                </div>
                {errors.softwareSkills && (
                  <p className="text-sm mt-2" style={{ color: theme.error }}>
                    {errors.softwareSkills}
                  </p>
                )}
              </div>
            </div>
          </>
        )

      case 6:
        return (
          <>
            <h2 className="text-2xl font-bold mb-8" style={{ color: theme.text.primary }}>
              Experience & Preferences
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Previous Notable Clients or Projects
                </label>
                <textarea
                  value={formData.previousClients}
                  onChange={(e) => setFormData({ ...formData, previousClients: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Briefly describe notable clients or projects you've worked on..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Project Preferences <span style={{ color: theme.error }}>*</span>
                </label>
                <textarea
                  value={formData.projectPreferences}
                  onChange={(e) => setFormData({ ...formData, projectPreferences: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: errors.projectPreferences ? theme.error : theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="What types of projects do you enjoy most? What are your ideal project characteristics?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Working Style & Process <span style={{ color: theme.error }}>*</span>
                </label>
                <textarea
                  value={formData.workingStyle}
                  onChange={(e) => setFormData({ ...formData, workingStyle: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Describe your design process, how you approach projects, and your working style..."
                />
                {errors.workingStyle && (
                  <p className="text-sm mt-1" style={{ color: theme.error }}>
                    {errors.workingStyle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
                  Communication Style <span style={{ color: theme.error }}>*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { 
                      value: 'direct', 
                      label: 'Direct', 
                      description: 'Straightforward & efficient',
                      icon: '🎯' 
                    },
                    { 
                      value: 'collaborative', 
                      label: 'Collaborative', 
                      description: 'Consultative approach',
                      icon: '🤝' 
                    },
                    { 
                      value: 'detailed', 
                      label: 'Detailed', 
                      description: 'Regular updates & reports',
                      icon: '📋' 
                    },
                    { 
                      value: 'flexible', 
                      label: 'Flexible', 
                      description: 'Adapt to client needs',
                      icon: '🌀' 
                    }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, communicationStyle: option.value })}
                      className="relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] text-center"
                      style={{
                        backgroundColor: formData.communicationStyle === option.value ? theme.nestedBg : theme.cardBg,
                        borderColor: formData.communicationStyle === option.value ? theme.accent : theme.border,
                        color: theme.text.primary
                      }}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold mb-1">{option.label}</div>
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        {option.description}
                      </div>
                      {formData.communicationStyle === option.value && (
                        <div 
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.accent }}
                        >
                          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {errors.communicationStyle && (
                  <p className="text-sm mt-2" style={{ color: theme.error }}>
                    {errors.communicationStyle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Remote Work Experience <span style={{ color: theme.error }}>*</span>
                </label>
                <textarea
                  value={formData.remoteExperience}
                  onChange={(e) => setFormData({ ...formData, remoteExperience: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="Describe your experience working remotely with clients..."
                />
                {errors.remoteExperience && (
                  <p className="text-sm mt-1" style={{ color: theme.error }}>
                    {errors.remoteExperience}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                  Team Collaboration Experience
                </label>
                <textarea
                  value={formData.teamCollaboration}
                  onChange={(e) => setFormData({ ...formData, teamCollaboration: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: theme.nestedBg, 
                    color: theme.text.primary,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.accent
                  } as any}
                  placeholder="How do you work with developers, product managers, and other stakeholders?"
                />
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300 animate-fadeIn" style={{ backgroundColor: theme.bg }}>
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
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
        </div>
      </nav>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Join Our Designer Network
          </h1>
          <p className="text-base sm:text-lg" style={{ color: theme.text.secondary }}>
            Get matched with clients looking for your unique expertise
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 sm:mb-10 lg:mb-12 animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full mx-1 transition-all duration-300 ${
                  i === 1 ? 'ml-0' : ''
                } ${i === 6 ? 'mr-0' : ''}`}
                style={{
                  backgroundColor: i <= step ? theme.accent : theme.border
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Basic', 'Professional', 'Location', 'Expertise', 'Portfolio', 'Experience'].map((label, i) => (
              <div 
                key={label} 
                className="text-xs flex-1 text-center"
                style={{ 
                  color: i + 1 <= step ? theme.text.primary : theme.text.muted,
                  fontWeight: i + 1 === step ? 600 : 400
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border"
          style={{ 
            backgroundColor: theme.cardBg,
            borderColor: theme.border
          }}
        >
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor: theme.nestedBg,
                  color: theme.text.primary,
                  borderColor: theme.border
                }}
              >
                Back
              </button>
            )}
            <LoadingButton
              onClick={handleNext}
              loading={isLoading}
              theme={theme}
              className="ml-auto px-6 py-3 text-sm font-medium"
              size="sm"
              variant="primary"
            >
              {step === 6 ? 'Submit Application' : 'Continue'}
            </LoadingButton>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            Already applied?{' '}
            <Link
              href="/designer/login"
              className="font-medium transition-colors duration-300 hover:opacity-80"
              style={{ color: theme.accent }}
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}