'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { LoadingButton } from '@/components/shared'
import { CategorySelector } from './CategorySelector'
import { RadioGroup } from './RadioGroup'
import { MultiSelect } from './MultiSelect'
import { ProgressBar } from './ProgressBar'
import { 
  DESIGN_CATEGORIES, 
  TIMELINE_TYPES, 
  BUDGET_RANGES,
  PROJECT_GOALS,
  INVOLVEMENT_LEVELS,
  COMMUNICATION_PREFERENCES
} from '@/lib/constants'

interface EnhancedClientBriefProps {
  isDarkMode: boolean
  onSubmit: (data: ClientBriefData) => Promise<void>
  initialData?: Partial<ClientBriefData>
}

interface ClientBriefData {
  // Project Basics
  design_category: string
  project_description: string
  timeline_type: string
  budget_range: string
  
  // Project Details
  deliverables: string[]
  target_audience: string
  project_goal: string
  design_style_keywords: string[]
  design_examples: string[]
  avoid_colors_styles: string
  
  // Working Preferences
  involvement_level: string
  communication_preference: string
  previous_designer_experience: string
  has_brand_guidelines: boolean
}

const STEPS = [
  'Project Basics',
  'Project Details', 
  'Working Preferences',
  'Review'
]

export function EnhancedClientBrief({ 
  isDarkMode, 
  onSubmit, 
  initialData = {} 
}: EnhancedClientBriefProps) {
  const theme = getTheme(isDarkMode)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<ClientBriefData>({
    design_category: '',
    project_description: '',
    timeline_type: '',
    budget_range: '',
    deliverables: [],
    target_audience: '',
    project_goal: '',
    design_style_keywords: [],
    design_examples: [],
    avoid_colors_styles: '',
    involvement_level: '',
    communication_preference: '',
    previous_designer_experience: '',
    has_brand_guidelines: false,
    ...initialData
  })

  const updateField = (field: keyof ClientBriefData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.design_category) newErrors.design_category = 'Please select a design category'
      if (!formData.project_description.trim()) newErrors.project_description = 'Please describe your project'
      if (!formData.timeline_type) newErrors.timeline_type = 'Please select a timeline'
      if (!formData.budget_range) newErrors.budget_range = 'Please select a budget range'
    }

    if (step === 2) {
      if (formData.deliverables.length === 0) newErrors.deliverables = 'Please specify deliverables'
      if (!formData.target_audience.trim()) newErrors.target_audience = 'Please describe your target audience'
      if (!formData.project_goal) newErrors.project_goal = 'Please select a project goal'
      if (formData.design_style_keywords.length === 0) newErrors.design_style_keywords = 'Please add at least one style keyword'
    }

    if (step === 3) {
      if (!formData.involvement_level) newErrors.involvement_level = 'Please select your involvement level'
      if (!formData.communication_preference) newErrors.communication_preference = 'Please select communication preference'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to submit brief:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="max-w-4xl mx-auto p-8 rounded-3xl animate-fadeIn"
      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
    >
      {/* Progress Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text.primary }}>
          Tell us about your project
        </h1>
        <ProgressBar 
          current={currentStep} 
          total={4}
          steps={STEPS}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Step Content */}
      <div className="space-y-8">
        {currentStep === 1 && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
              Project Basics
            </h2>
            
            {/* Design Category */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                Which design category best describes your project? *
              </label>
              <CategorySelector
                selected={formData.design_category}
                onSelect={(value) => updateField('design_category', value)}
                isDarkMode={isDarkMode}
                error={errors.design_category}
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                Describe your project in 2-3 sentences *
              </label>
              <textarea
                value={formData.project_description}
                onChange={(e) => updateField('project_description', e.target.value)}
                placeholder="What are you trying to achieve with this design project?"
                rows={4}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.01] ${
                  errors.project_description ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: theme.nestedBg,
                  borderColor: errors.project_description ? theme.error : theme.border,
                  color: theme.text.primary
                }}
              />
              {errors.project_description && (
                <p className="text-sm mt-2 animate-slideUp" style={{ color: theme.error }}>
                  {errors.project_description}
                </p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                What's your timeline? *
              </label>
              <RadioGroup
                options={Object.values(TIMELINE_TYPES).map(t => ({
                  value: t.id,
                  label: t.name,
                  description: t.description,
                  icon: t.icon
                }))}
                selected={formData.timeline_type}
                onChange={(value) => updateField('timeline_type', value)}
                isDarkMode={isDarkMode}
                error={errors.timeline_type}
              />
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                What's your budget range? *
              </label>
              <RadioGroup
                options={Object.values(BUDGET_RANGES).map(b => ({
                  value: b.id,
                  label: b.name,
                  description: b.description,
                  icon: b.icon
                }))}
                selected={formData.budget_range}
                onChange={(value) => updateField('budget_range', value)}
                isDarkMode={isDarkMode}
                error={errors.budget_range}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
              Project Details
            </h2>
            
            {/* Add more step 2 fields here */}
            <p style={{ color: theme.text.secondary }}>
              Step 2 content will be implemented with remaining project detail fields...
            </p>
          </div>
        )}

        {/* Add other steps similarly */}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-12">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50"
          style={{
            backgroundColor: 'transparent',
            border: `2px solid ${theme.border}`,
            color: theme.text.secondary
          }}
        >
          ← Back
        </button>
        
        {currentStep < 4 ? (
          <LoadingButton
            onClick={handleNext}
            className="px-8 py-3 rounded-2xl font-bold"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Next →
          </LoadingButton>
        ) : (
          <LoadingButton
            onClick={handleSubmit}
            loading={isSubmitting}
            className="px-8 py-3 rounded-2xl font-bold"
            style={{
              backgroundColor: theme.accent,
              color: '#000'
            }}
          >
            Complete Brief
          </LoadingButton>
        )}
      </div>
    </div>
  )
}