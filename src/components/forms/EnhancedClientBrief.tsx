'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { LoadingButton } from '@/components/shared'
import { CategorySelector } from './CategorySelector'
import { RadioGroup } from './RadioGroup'
import { MultiSelect } from './MultiSelect'
import { ProgressBar } from './ProgressBar'
import { logger } from '@/lib/core/logging-service'
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
  theme?: any  // Theme object from design system
  isSubmitting?: boolean  // External submitting state
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
  update_frequency?: string
  involvement_preferences?: string
  communication_channels?: string[]
  project_management_tools?: string[]
  feedback_style?: string
  change_flexibility?: string
  
  // Category-Specific Fields - Branding
  brand_identity_type?: string
  brand_deliverables?: string[]
  industry_sector?: string
  brand_values?: string
  target_market?: string
  brand_personality?: string[]
  logo_style_preference?: string
  color_preferences?: string
  brand_assets_status?: string
  
  // Category-Specific Fields - Web/Mobile
  digital_product_type?: string
  number_of_screens?: string
  key_features?: string[]
  design_inspiration?: string
  technical_requirements?: string[]
  accessibility_requirements?: string[]
  content_strategy?: string
  integration_needs?: string[]
  user_research_needed?: string
  development_status?: string
  design_deliverables?: string[]
  
  // Category-Specific Fields - Branding (additional)
  existing_brand_elements?: string
  logo_usage?: string[]
  
  // Category-Specific Fields - Social Media
  social_platforms?: string[]
  social_content_types?: string[]
  social_quantity?: string
  social_post_count?: string
  social_brand_guidelines?: string
  social_frequency?: string
  
  // Category-Specific Fields - Motion Graphics
  motion_type?: string
  video_length?: string
  animation_style?: string
  motion_needs?: string[]
  motion_usage?: string[]
  
  // Category-Specific Fields - Photography/Video
  visual_content_type?: string[]
  asset_quantity?: string
  production_requirements?: string[]
  usage_rights?: string
  delivery_formats?: string[]
  
  // Category-Specific Fields - Presentations
  presentation_type?: string
  slide_count?: string
  presentation_requirements?: string[]
  content_status?: string
  software_preference?: string
}

const STEPS = [
  'Project Basics',
  'Category-Specific Questions',
  'Working Preferences',
  'Review & Submit'
]

export function EnhancedClientBrief({ 
  isDarkMode, 
  onSubmit, 
  initialData = {},
  theme: externalTheme,
  isSubmitting: externalIsSubmitting
}: EnhancedClientBriefProps) {
  const theme = externalTheme || getTheme(isDarkMode)
  const [currentStep, setCurrentStep] = useState(1)
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Use external isSubmitting if provided, otherwise use internal state
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting
  
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
    // Working preference fields required by Step 3
    update_frequency: '',
    communication_channels: [],
    feedback_style: '',
    change_flexibility: '',
    ...initialData
  })

  const updateField = (field: keyof ClientBriefData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.design_category) newErrors.design_category = 'Please select a design category'
      if (!formData.project_description?.trim()) newErrors.project_description = 'Please describe your project'
      if (!formData.timeline_type) newErrors.timeline_type = 'Please select a timeline'
      if (!formData.budget_range) newErrors.budget_range = 'Please select a budget range'
    }

    if (step === 2) {
      // Category-specific validation
      if (formData.design_category === 'branding-logo') {
        if (!formData.brand_identity_type) newErrors.brand_identity_type = 'Please select brand identity type'
        if (!formData.brand_deliverables || formData.brand_deliverables.length === 0) newErrors.brand_deliverables = 'Please select required deliverables'
        if (!formData.industry_sector?.trim()) newErrors.industry_sector = 'Please describe your industry'
      }
      
      if (formData.design_category === 'web-mobile') {
        if (!formData.digital_product_type) newErrors.digital_product_type = 'Please select product type'
        if (!formData.number_of_screens) newErrors.number_of_screens = 'Please select number of screens'
      }
      
      if (formData.design_category === 'social-media') {
        if (!formData.social_platforms || formData.social_platforms.length === 0) newErrors.social_platforms = 'Please select at least one platform'
        if (!formData.social_content_types || formData.social_content_types.length === 0) newErrors.social_content_types = 'Please select content types'
        if (!formData.social_quantity) newErrors.social_quantity = 'Please select quantity'
      }
      
      if (formData.design_category === 'motion-graphics') {
        if (!formData.motion_type) newErrors.motion_type = 'Please select motion graphics type'
        if (!formData.video_length) newErrors.video_length = 'Please select video length'
        if (!formData.animation_style) newErrors.animation_style = 'Please select animation style'
      }
      
      if (formData.design_category === 'photography-video') {
        if (!formData.visual_content_type || formData.visual_content_type.length === 0) newErrors.visual_content_type = 'Please select content type'
        if (!formData.asset_quantity) newErrors.asset_quantity = 'Please select quantity'
        if (!formData.usage_rights) newErrors.usage_rights = 'Please select usage rights'
      }
      
      if (formData.design_category === 'presentations') {
        if (!formData.presentation_type) newErrors.presentation_type = 'Please select presentation type'
        if (!formData.slide_count) newErrors.slide_count = 'Please select slide count'
        if (!formData.content_status) newErrors.content_status = 'Please select content status'
      }
      
      // If no category selected, require category selection first
      if (!formData.design_category) {
        newErrors.design_category = 'Please select a design category in Step 1 first'
      }
    }

    if (step === 3) {
      if (!formData.involvement_level) newErrors.involvement_level = 'Please select an involvement level'
      if (!formData.update_frequency) newErrors.update_frequency = 'Please select update frequency'
      if (!formData.communication_channels || formData.communication_channels.length === 0) newErrors.communication_channels = 'Please select at least one communication channel'
      if (!formData.feedback_style) newErrors.feedback_style = 'Please select a feedback style'
      if (!formData.change_flexibility) newErrors.change_flexibility = 'Please select change flexibility'
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
    if (!validateStep(3)) {
      // Validation failed - scroll to first error field
      const firstErrorField = document.querySelector('[data-error="true"]')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      logger.error('Step 3 validation failed. Errors:', errors)
      // Show alert to user about validation errors
      const errorMessages = Object.values(errors).join('\n')
      alert('Please complete all required fields:\n\n' + errorMessages)
      return
    }

    // Set internal submitting state if not controlled externally
    if (externalIsSubmitting === undefined) {
      setInternalIsSubmitting(true)
    }
    
    try {
      await onSubmit(formData)
    } catch (error) {
      logger.error('Failed to submit brief:', error)
      // Re-throw to let parent handle the error
      throw error
    } finally {
      // Reset internal submitting state if not controlled externally
      if (externalIsSubmitting === undefined) {
        setInternalIsSubmitting(false)
      }
    }
  }

  const renderCategorySpecificQuestions = () => {
    const category = formData.design_category
    
    // If no category selected, show message
    if (!category) {
      return (
        <div>
          <p className="text-center text-lg py-8" style={{ color: theme.text.secondary }}>
            Please select a design category in Step 1 to see specific questions for that category.
          </p>
        </div>
      )
    }
    
    switch (category) {
      case 'branding-logo':
        return (
          <>
            {/* 1. Brand Identity Type */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                1. What type of brand identity work do you need? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'new-brand', label: 'New brand from scratch' },
                  { value: 'rebrand', label: 'Rebrand/refresh existing brand' },
                  { value: 'brand-extension', label: 'Brand extension/sub-brand' },
                  { value: 'brand-guidelines', label: 'Brand guidelines development' }
                ]}
                selected={formData.brand_identity_type}
                onChange={(value) => updateField('brand_identity_type', value)}
                isDarkMode={isDarkMode}
                error={errors.brand_identity_type}
                layout="stack"
              />
            </div>

            {/* 2. Brand Deliverables */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                2. Which deliverables are required? <span style={{ color: theme.error }}>*</span>
              </label>
              <MultiSelect
                options={[
                  { value: 'primary-logo', label: 'Primary logo' },
                  { value: 'logo-variations', label: 'Logo variations (horizontal, icon, etc.)' },
                  { value: 'color-palette', label: 'Color palette' },
                  { value: 'typography-system', label: 'Typography system' },
                  { value: 'brand-guidelines', label: 'Brand guidelines document' },
                  { value: 'business-cards', label: 'Business card design' },
                  { value: 'letterhead', label: 'Letterhead/Stationery' },
                  { value: 'brand-patterns', label: 'Brand patterns/graphics' }
                ]}
                selected={formData.brand_deliverables || []}
                onChange={(value) => updateField('brand_deliverables', value)}
                isDarkMode={isDarkMode}
                error={errors.brand_deliverables}
              />
            </div>

            {/* 3. Industry */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                3. What industry/sector are you in? <span style={{ color: theme.error }}>*</span>
              </label>
              <textarea
                value={formData.industry_sector || ''}
                onChange={(e) => updateField('industry_sector', e.target.value)}
                placeholder="Describe your industry and target market"
                rows={2}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.01] ${
                  errors.industry_sector ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: theme.nestedBg,
                  borderColor: errors.industry_sector ? theme.error : theme.border,
                  color: theme.text.primary
                }}
              />
              {errors.industry_sector && (
                <p className="text-sm mt-2 animate-slideUp" style={{ color: theme.error }}>
                  {errors.industry_sector}
                </p>
              )}
            </div>

            {/* 4. Existing Brand Elements */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                4. Do you have existing brand elements to work with?
              </label>
              <RadioGroup
                options={[
                  { value: 'starting-fresh', label: 'No, starting fresh' },
                  { value: 'incorporate-existing', label: 'Yes, need to incorporate existing elements' },
                  { value: 'open-to-change', label: 'Yes, but open to complete change' }
                ]}
                selected={formData.existing_brand_elements}
                onChange={(value) => updateField('existing_brand_elements', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 5. Logo Usage */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                5. How will the logo primarily be used?
              </label>
              <MultiSelect
                options={[
                  { value: 'digital', label: 'Digital (website, apps)' },
                  { value: 'print', label: 'Print materials' },
                  { value: 'packaging', label: 'Physical products/packaging' },
                  { value: 'signage', label: 'Signage/Environmental' },
                  { value: 'all', label: 'All of the above' }
                ]}
                selected={formData.logo_usage || []}
                onChange={(value) => updateField('logo_usage', value)}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        )

      case 'web-mobile':
        return (
          <>
            {/* 1. Digital Product Type */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                1. What type of digital product do you need? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'website', label: 'Website design' },
                  { value: 'mobile-app', label: 'Mobile app (iOS/Android)' },
                  { value: 'web-app', label: 'Web application' },
                  { value: 'responsive', label: 'Responsive website + mobile' }
                ]}
                selected={formData.digital_product_type}
                onChange={(value) => updateField('digital_product_type', value)}
                isDarkMode={isDarkMode}
                error={errors.digital_product_type}
                layout="stack"
              />
            </div>

            {/* 2. Number of Screens */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                2. Number of screens/pages needed? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'landing-page', label: 'Landing page only (1-2)' },
                  { value: 'small', label: 'Small (3-10)' },
                  { value: 'medium', label: 'Medium (11-25)' },
                  { value: 'large', label: 'Large (26-50)' },
                  { value: 'enterprise', label: 'Enterprise (50+)' }
                ]}
                selected={formData.number_of_screens}
                onChange={(value) => updateField('number_of_screens', value)}
                isDarkMode={isDarkMode}
                error={errors.number_of_screens}
                layout="grid"
              />
            </div>

            {/* 3. User Research/Testing */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                3. Do you need user research/testing?
              </label>
              <RadioGroup
                options={[
                  { value: 'full-ux', label: 'Yes, full UX research' },
                  { value: 'basic-flow', label: 'Basic user flow mapping' },
                  { value: 'visual-only', label: 'No, just visual design' }
                ]}
                selected={formData.user_research_needed}
                onChange={(value) => updateField('user_research_needed', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 4. Development Status */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                4. What's the development status?
              </label>
              <RadioGroup
                options={[
                  { value: 'design-only', label: 'Need design only' },
                  { value: 'design-handoff', label: 'Need design + developer handoff' },
                  { value: 'design-dev-support', label: 'Need design + development support' },
                  { value: 'redesign-existing', label: 'Redesigning existing product' }
                ]}
                selected={formData.development_status}
                onChange={(value) => updateField('development_status', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 5. Design Deliverables */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                5. Required design deliverables?
              </label>
              <MultiSelect
                options={[
                  { value: 'wireframes', label: 'Wireframes' },
                  { value: 'mockups', label: 'High-fidelity mockups' },
                  { value: 'prototype', label: 'Interactive prototype' },
                  { value: 'design-system', label: 'Design system/Component library' },
                  { value: 'dev-specs', label: 'Developer specifications' }
                ]}
                selected={formData.design_deliverables || []}
                onChange={(value) => updateField('design_deliverables', value)}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        )

      case 'social-media':
        return (
          <>
            {/* 1. Platforms */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                1. Which platforms do you need designs for? <span style={{ color: theme.error }}>*</span>
              </label>
              <MultiSelect
                options={[
                  { value: 'instagram', label: 'Instagram (Feed/Stories/Reels)' },
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'linkedin', label: 'LinkedIn' },
                  { value: 'twitter', label: 'Twitter/X' },
                  { value: 'tiktok', label: 'TikTok' },
                  { value: 'youtube', label: 'YouTube (Thumbnails/Banners)' },
                  { value: 'pinterest', label: 'Pinterest' }
                ]}
                selected={formData.social_platforms || []}
                onChange={(value) => updateField('social_platforms', value)}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* 2. Content Type */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                2. What type of content? <span style={{ color: theme.error }}>*</span>
              </label>
              <MultiSelect
                options={[
                  { value: 'post-templates', label: 'Regular post templates' },
                  { value: 'story-templates', label: 'Story templates' },
                  { value: 'ad-creatives', label: 'Ad creatives' },
                  { value: 'carousel-posts', label: 'Carousel posts' },
                  { value: 'video-overlays', label: 'Video graphics/overlays' },
                  { value: 'profile-images', label: 'Profile/Cover images' },
                  { value: 'highlight-covers', label: 'Highlight covers' }
                ]}
                selected={formData.social_content_types || []}
                onChange={(value) => updateField('social_content_types', value)}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* 3. Quantity Needed */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                3. How many templates/designs needed? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'one-time', label: 'One-time posts (specify quantity below)' },
                  { value: 'template-set', label: 'Template set (5-10 templates)' },
                  { value: 'content-library', label: 'Full content library (20+ templates)' },
                  { value: 'monthly-retainer', label: 'Monthly retainer (ongoing)' }
                ]}
                selected={formData.social_quantity}
                onChange={(value) => updateField('social_quantity', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
              {formData.social_quantity === 'one-time' && (
                <input
                  type="number"
                  placeholder="Number of posts needed"
                  className="mt-3 w-full p-4 rounded-2xl border-2"
                  style={{
                    backgroundColor: theme.nestedBg,
                    borderColor: theme.border,
                    color: theme.text.primary
                  }}
                  value={formData.social_post_count || ''}
                  onChange={(e) => updateField('social_post_count', e.target.value)}
                />
              )}
            </div>

            {/* 4. Brand Guidelines */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                4. Do you have brand guidelines?
              </label>
              <RadioGroup
                options={[
                  { value: 'strict-guidelines', label: 'Yes, strict guidelines to follow' },
                  { value: 'flexible-guidelines', label: 'Yes, but flexible' },
                  { value: 'no-guidelines', label: 'No, need help establishing style' }
                ]}
                selected={formData.social_brand_guidelines}
                onChange={(value) => updateField('social_brand_guidelines', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 5. Posting Frequency */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                5. Content creation frequency?
              </label>
              <RadioGroup
                options={[
                  { value: 'daily', label: 'Daily posting' },
                  { value: 'few-per-week', label: '3-4 times per week' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'campaign-based', label: 'Campaign-based' }
                ]}
                selected={formData.social_frequency}
                onChange={(value) => updateField('social_frequency', value)}
                isDarkMode={isDarkMode}
                layout="grid"
              />
            </div>
          </>
        )

      case 'motion-graphics':
        return (
          <>
            {/* 1. Type of Motion Graphics */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                1. What type of motion graphics do you need? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'explainer-video', label: 'Explainer video/animated storytelling' },
                  { value: 'logo-animation', label: 'Logo animation/brand intro' },
                  { value: 'product-demo', label: 'Product demo/feature showcase' },
                  { value: 'social-video', label: 'Social media videos/ads' },
                  { value: 'presentation-animation', label: 'Animated presentations' }
                ]}
                selected={formData.motion_type}
                onChange={(value) => updateField('motion_type', value)}
                isDarkMode={isDarkMode}
                error={errors.motion_type}
                layout="stack"
              />
            </div>

            {/* 2. Video Length */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                2. Estimated video/animation length? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'micro', label: 'Micro (under 15 seconds)' },
                  { value: 'short', label: 'Short (15-30 seconds)' },
                  { value: 'medium', label: 'Medium (30-60 seconds)' },
                  { value: 'long', label: 'Long (1-3 minutes)' },
                  { value: 'extended', label: 'Extended (3+ minutes)' }
                ]}
                selected={formData.video_length}
                onChange={(value) => updateField('video_length', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 3. Animation Style */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                3. Preferred animation style? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: '2d-flat', label: '2D flat design/minimalist' },
                  { value: '2d-character', label: '2D character animation' },
                  { value: '3d-realistic', label: '3D realistic' },
                  { value: '3d-stylized', label: '3D stylized' },
                  { value: 'mixed-media', label: 'Mixed media/hybrid' },
                  { value: 'kinetic-typography', label: 'Kinetic typography' }
                ]}
                selected={formData.animation_style}
                onChange={(value) => updateField('animation_style', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 4. Motion Needs */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                4. What elements need animation? (select all that apply)
              </label>
              <MultiSelect
                options={[
                  { value: 'script-storyboard', label: 'Script/storyboard development' },
                  { value: 'voiceover', label: 'Voiceover integration' },
                  { value: 'sound-design', label: 'Sound design/effects' },
                  { value: 'music', label: 'Background music' },
                  { value: 'subtitles', label: 'Subtitles/captions' }
                ]}
                selected={formData.motion_needs || []}
                onChange={(values) => updateField('motion_needs', values)}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* 5. Usage/Distribution */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                5. Where will this be used?
              </label>
              <MultiSelect
                options={[
                  { value: 'website', label: 'Website/landing page' },
                  { value: 'social-media', label: 'Social media channels' },
                  { value: 'presentations', label: 'Presentations/pitches' },
                  { value: 'ads', label: 'Paid advertising' },
                  { value: 'internal', label: 'Internal use' },
                  { value: 'events', label: 'Events/conferences' }
                ]}
                selected={formData.motion_usage || []}
                onChange={(values) => updateField('motion_usage', values)}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        )

      case 'photography-video':
        return (
          <>
            {/* 1. Type of Visual Content */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                1. What type of visual content do you need? <span style={{ color: theme.error }}>*</span>
              </label>
              <MultiSelect
                options={[
                  { value: 'product-photography', label: 'Product photography' },
                  { value: 'lifestyle-photography', label: 'Lifestyle photography' },
                  { value: 'headshots', label: 'Headshots/team photos' },
                  { value: 'event-coverage', label: 'Event coverage' },
                  { value: 'brand-video', label: 'Brand video/commercial' },
                  { value: 'testimonial-video', label: 'Testimonial/interview videos' }
                ]}
                selected={formData.visual_content_type || []}
                onChange={(values) => updateField('visual_content_type', values)}
                isDarkMode={isDarkMode}
                error={errors.visual_content_type}
              />
            </div>

            {/* 2. Quantity of Assets */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                2. How many photos/videos needed? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'small-batch', label: 'Small batch (10-20 assets)' },
                  { value: 'medium-batch', label: 'Medium batch (20-50 assets)' },
                  { value: 'large-batch', label: 'Large batch (50-100 assets)' },
                  { value: 'extensive', label: 'Extensive library (100+ assets)' },
                  { value: 'ongoing', label: 'Ongoing/retainer basis' }
                ]}
                selected={formData.asset_quantity}
                onChange={(value) => updateField('asset_quantity', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 3. Production Requirements */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                3. Production requirements?
              </label>
              <MultiSelect
                options={[
                  { value: 'location-scouting', label: 'Location scouting' },
                  { value: 'models-talent', label: 'Models/talent casting' },
                  { value: 'styling-props', label: 'Styling/props' },
                  { value: 'studio-setup', label: 'Studio setup' },
                  { value: 'post-production', label: 'Extensive post-production' }
                ]}
                selected={formData.production_requirements || []}
                onChange={(values) => updateField('production_requirements', values)}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* 4. Usage Rights */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                4. Usage rights needed? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'web-only', label: 'Web only' },
                  { value: 'social-media', label: 'Web + social media' },
                  { value: 'marketing', label: 'All marketing materials' },
                  { value: 'unlimited', label: 'Unlimited usage' },
                  { value: 'limited-time', label: 'Limited time usage' }
                ]}
                selected={formData.usage_rights}
                onChange={(value) => updateField('usage_rights', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 5. Delivery Format */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                5. Required file formats?
              </label>
              <MultiSelect
                options={[
                  { value: 'raw-files', label: 'RAW files' },
                  { value: 'high-res-jpg', label: 'High-res JPG/PNG' },
                  { value: 'web-optimized', label: 'Web-optimized versions' },
                  { value: 'social-formats', label: 'Social media formats' },
                  { value: 'video-4k', label: '4K video' },
                  { value: 'video-1080p', label: '1080p video' }
                ]}
                selected={formData.delivery_formats || []}
                onChange={(values) => updateField('delivery_formats', values)}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        )

      case 'presentations':
        return (
          <>
            {/* 1. Presentation Type */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                1. What type of presentation do you need? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'pitch-deck', label: 'Investor pitch deck' },
                  { value: 'sales-deck', label: 'Sales presentation' },
                  { value: 'conference', label: 'Conference/keynote' },
                  { value: 'webinar', label: 'Webinar slides' },
                  { value: 'training', label: 'Training/educational' },
                  { value: 'report', label: 'Report/data visualization' }
                ]}
                selected={formData.presentation_type}
                onChange={(value) => updateField('presentation_type', value)}
                isDarkMode={isDarkMode}
                error={errors.presentation_type}
                layout="stack"
              />
            </div>

            {/* 2. Number of Slides */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                2. Estimated number of slides? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'concise', label: 'Concise (10-15 slides)' },
                  { value: 'standard', label: 'Standard (15-25 slides)' },
                  { value: 'detailed', label: 'Detailed (25-40 slides)' },
                  { value: 'comprehensive', label: 'Comprehensive (40+ slides)' },
                  { value: 'template-system', label: 'Template system (master slides)' }
                ]}
                selected={formData.slide_count}
                onChange={(value) => updateField('slide_count', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 3. Design Requirements */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                3. Special requirements? (select all that apply)
              </label>
              <MultiSelect
                options={[
                  { value: 'data-viz', label: 'Data visualization/charts' },
                  { value: 'infographics', label: 'Custom infographics' },
                  { value: 'animations', label: 'Slide animations/transitions' },
                  { value: 'interactive', label: 'Interactive elements' },
                  { value: 'custom-icons', label: 'Custom icons/illustrations' },
                  { value: 'photo-editing', label: 'Photo editing/retouching' }
                ]}
                selected={formData.presentation_requirements || []}
                onChange={(values) => updateField('presentation_requirements', values)}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* 4. Content Status */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                4. Is your content ready? <span style={{ color: theme.error }}>*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'all-ready', label: 'Yes, all content is finalized' },
                  { value: 'mostly-ready', label: 'Mostly ready, minor edits needed' },
                  { value: 'outline-only', label: 'Have outline/key points only' },
                  { value: 'need-help', label: 'Need help with content development' }
                ]}
                selected={formData.content_status}
                onChange={(value) => updateField('content_status', value)}
                isDarkMode={isDarkMode}
                layout="stack"
              />
            </div>

            {/* 5. Software Preference */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                5. Preferred presentation software?
              </label>
              <RadioGroup
                options={[
                  { value: 'powerpoint', label: 'PowerPoint' },
                  { value: 'keynote', label: 'Keynote' },
                  { value: 'google-slides', label: 'Google Slides' },
                  { value: 'figma', label: 'Figma/design tool' },
                  { value: 'no-preference', label: 'No preference' }
                ]}
                selected={formData.software_preference}
                onChange={(value) => updateField('software_preference', value)}
                isDarkMode={isDarkMode}
                layout="grid"
              />
            </div>
          </>
        )

      default:
        // This should never happen if category is selected
        return (
          <div>
            <p className="text-center text-lg py-8" style={{ color: theme.text.secondary }}>
              Unknown category selected. Please go back and select a valid category.
            </p>
          </div>
        )
    }
  }

  return (
    <>
      {/* Progress Bar - Outside the card */}
      <div className="mb-8">
        <ProgressBar 
          current={currentStep} 
          total={4}
          steps={STEPS}
          isDarkMode={isDarkMode}
        />
      </div>
      
      <div 
        className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl animate-fadeIn"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
      >
        {/* Title inside the card - Dynamic based on step */}
        {currentStep !== 4 && (
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.text.primary }}>
              {currentStep === 1 && 'Tell us about your project'}
              {currentStep === 2 && 'Category-Specific Questions'}
              {currentStep === 3 && 'Working Preferences'}
            </h1>
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-6 sm:space-y-8">
          {currentStep === 1 && (
            <div className="space-y-6 sm:space-y-8">
              {/* Design Category */}
              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                  Which design category best describes your project? <span style={{ color: theme.error }}>*</span>
                </label>
                <CategorySelector
                  options={Object.values(DESIGN_CATEGORIES).map(cat => ({
                    value: cat.id,
                    label: cat.name,
                    description: cat.description,
                    icon: cat.icon
                  }))}
                  selected={formData.design_category}
                  onChange={(value) => updateField('design_category', value)}
                  isDarkMode={isDarkMode}
                  error={errors.design_category}
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                  Describe your project <span style={{ color: theme.error }}>*</span>
                </label>
                <textarea
                  value={formData.project_description}
                  onChange={(e) => updateField('project_description', e.target.value)}
                  placeholder="Tell us about your project goals, vision, and what you're hoping to achieve..."
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
                  What's your preferred timeline? <span style={{ color: theme.error }}>*</span>
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
                  What's your budget range? <span style={{ color: theme.error }}>*</span>
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
            <div className="space-y-6 sm:space-y-8">
              {/* Debug: Show current category */}
              {formData.design_category && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.accent + '10', border: `1px solid ${theme.accent}` }}>
                  <p className="text-sm" style={{ color: theme.accent }}>
                    Selected Category: {DESIGN_CATEGORIES[formData.design_category as keyof typeof DESIGN_CATEGORIES]?.name || formData.design_category}
                  </p>
                </div>
              )}
              {renderCategorySpecificQuestions()}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 sm:space-y-8">
              {/* Show validation errors if any */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 rounded-2xl border-2 animate-pulse" style={{ 
                  backgroundColor: theme.error + '10',
                  borderColor: theme.error 
                }}>
                  <p className="font-semibold mb-2" style={{ color: theme.error }}>
                    Please fill in all required fields:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field} className="text-sm" style={{ color: theme.error }}>
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Involvement Level */}
              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                  How involved do you want to be? <span style={{ color: theme.error }}>*</span>
                </label>
                <RadioGroup
                  options={[
                    { value: 'highly-collaborative', label: 'Highly Collaborative', description: 'Active involvement in creative process' },
                    { value: 'milestone-checkins', label: 'Milestone Check-ins', description: 'Review at key stages' },
                    { value: 'hands-off', label: 'Hands-off', description: 'Trust designer, minimal involvement' }
                  ]}
                  selected={formData.involvement_level}
                  onChange={(value) => updateField('involvement_level', value)}
                  isDarkMode={isDarkMode}
                  error={errors.involvement_level}
                  layout="stack"
                />
              </div>

              {/* Update Frequency */}
              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                  Update Frequency (select one): <span style={{ color: theme.error }}>*</span>
                </label>
                <RadioGroup
                  options={[
                    { value: 'daily', label: 'Daily Updates', description: 'Get updates every day' },
                    { value: 'every-2-3-days', label: 'Every 2-3 Days', description: 'Regular but not overwhelming' },
                    { value: 'weekly', label: 'Weekly Summaries', description: 'Comprehensive weekly reports' },
                    { value: 'milestone-based', label: 'Milestone-based Only', description: 'Updates at key project stages' },
                    { value: 'as-needed', label: 'As-needed', description: 'Only when questions arise' }
                  ]}
                  selected={formData.update_frequency}
                  onChange={(value) => updateField('update_frequency', value)}
                  isDarkMode={isDarkMode}
                  error={errors.update_frequency}
                  layout="grid"
                />
              </div>

              {/* Communication Channels */}
              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                  Preferred communication channels (select multiple): <span style={{ color: theme.error }}>*</span>
                </label>
                <MultiSelect
                  options={[
                    { value: 'email', label: 'Email', description: 'Traditional email communication' },
                    { value: 'slack', label: 'Slack', description: 'Real-time messaging' },
                    { value: 'video-calls', label: 'Video calls', description: 'Face-to-face meetings' },
                    { value: 'phone', label: 'Phone calls', description: 'Voice conversations' },
                    { value: 'project-management', label: 'Project management tools', description: 'Organized task tracking' }
                  ]}
                  selected={formData.communication_channels || []}
                  onChange={(value) => updateField('communication_channels', value)}
                  isDarkMode={isDarkMode}
                  error={errors.communication_channels}
                />
              </div>

              {/* Feedback Style */}
              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                  Feedback and revision style preference: <span style={{ color: theme.error }}>*</span>
                </label>
                <RadioGroup
                  options={[
                    { value: 'detailed-written', label: 'Detailed written feedback', description: 'Comprehensive written notes' },
                    { value: 'quick-verbal', label: 'Quick verbal feedback', description: 'Fast phone/video feedback' },
                    { value: 'annotated-mockups', label: 'Annotated mockups/screenshots', description: 'Visual feedback directly on designs' },
                    { value: 'mixed-approach', label: 'Mixed approach', description: 'Combination based on project phase' }
                  ]}
                  selected={formData.feedback_style}
                  onChange={(value) => updateField('feedback_style', value)}
                  isDarkMode={isDarkMode}
                  error={errors.feedback_style}
                  layout="stack"
                />
              </div>

              {/* Change Flexibility */}
              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                  How do you handle changes and iterations? <span style={{ color: theme.error }}>*</span>
                </label>
                <RadioGroup
                  options={[
                    { value: 'plan-thoroughly', label: 'Plan thoroughly upfront, minimal changes', description: 'Detailed planning to avoid revisions' },
                    { value: 'iterative-feedback', label: 'Iterative with regular feedback', description: 'Regular check-ins and adjustments' },
                    { value: 'flexible-evolution', label: 'Flexible, project can evolve', description: 'Open to significant changes during process' },
                    { value: 'structured-phases', label: 'Structured phases with approval gates', description: 'Formal approval at each milestone' }
                  ]}
                  selected={formData.change_flexibility}
                  onChange={(value) => updateField('change_flexibility', value)}
                  isDarkMode={isDarkMode}
                  error={errors.change_flexibility}
                  layout="stack"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Review Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Review Your Project Brief
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Please review your answers below. You can go back to make changes or submit to find your perfect designer.
                </p>
              </div>

              {/* Project Details Review */}
              <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Project Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Category: </span>
                    <span style={{ color: theme.text.secondary }}>
                      {DESIGN_CATEGORIES[formData.design_category as keyof typeof DESIGN_CATEGORIES]?.name || formData.design_category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Timeline: </span>
                    <span style={{ color: theme.text.secondary }}>
                      {TIMELINE_TYPES[formData.timeline_type as keyof typeof TIMELINE_TYPES]?.name || formData.timeline_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Budget: </span>
                    <span style={{ color: theme.text.secondary }}>
                      {BUDGET_RANGES[formData.budget_range as keyof typeof BUDGET_RANGES]?.name || formData.budget_range}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Description: </span>
                    <span className="text-sm max-w-xs text-right" style={{ color: theme.text.secondary }}>
                      {formData.project_description?.substring(0, 50)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Category-Specific Details Review */}
              <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Category-Specific Details</h3>
                <div className="space-y-3">
                  {/* Branding-Logo specific */}
                  {formData.design_category === 'branding-logo' && (
                    <>
                      {formData.brand_identity_type && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Brand Type: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.brand_identity_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.brand_deliverables && formData.brand_deliverables.length > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Deliverables: </span>
                          <span className="text-sm max-w-xs text-right" style={{ color: theme.text.secondary }}>
                            {formData.brand_deliverables.length} items selected
                          </span>
                        </div>
                      )}
                      {formData.industry_sector && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Industry: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.industry_sector}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Web-Mobile specific */}
                  {formData.design_category === 'web-mobile' && (
                    <>
                      {formData.digital_product_type && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Product Type: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.digital_product_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.number_of_screens && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Screens: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.number_of_screens.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.key_features && formData.key_features.length > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Key Features: </span>
                          <span className="text-sm max-w-xs text-right" style={{ color: theme.text.secondary }}>
                            {formData.key_features.length} features
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Social Media specific */}
                  {formData.design_category === 'social-media' && (
                    <>
                      {formData.social_platforms && formData.social_platforms.length > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Platforms: </span>
                          <span className="text-sm max-w-xs text-right" style={{ color: theme.text.secondary }}>
                            {formData.social_platforms.join(', ')}
                          </span>
                        </div>
                      )}
                      {formData.social_quantity && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Quantity: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.social_quantity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.social_frequency && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Frequency: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.social_frequency.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Motion Graphics specific */}
                  {formData.design_category === 'motion-graphics' && (
                    <>
                      {formData.motion_type && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Type: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.motion_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.video_length && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Length: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.video_length.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.animation_style && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Style: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.animation_style.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Photography/Video specific */}
                  {formData.design_category === 'photography-video' && (
                    <>
                      {formData.visual_content_type && formData.visual_content_type.length > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Content Types: </span>
                          <span className="text-sm max-w-xs text-right" style={{ color: theme.text.secondary }}>
                            {formData.visual_content_type.length} types
                          </span>
                        </div>
                      )}
                      {formData.asset_quantity && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Quantity: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.asset_quantity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.usage_rights && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Usage Rights: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.usage_rights.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Presentations specific */}
                  {formData.design_category === 'presentations' && (
                    <>
                      {formData.presentation_type && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Type: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.presentation_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.slide_count && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Slides: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.slide_count.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {formData.content_status && (
                        <div className="flex justify-between">
                          <span className="font-medium" style={{ color: theme.text.primary }}>Content Status: </span>
                          <span style={{ color: theme.text.secondary }}>
                            {formData.content_status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Working Preferences Review */}
              <div className="p-6 rounded-2xl" style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Working Preferences</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Involvement: </span>
                    <span style={{ color: theme.text.secondary }}>
                      {formData.involvement_level?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Updates: </span>
                    <span style={{ color: theme.text.secondary }}>
                      {formData.update_frequency?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Communication: </span>
                    <span style={{ color: theme.text.secondary }}>
                      {formData.communication_channels?.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: theme.text.primary }}>Feedback Style: </span>
                    <span style={{ color: theme.text.secondary }}>
                      {formData.feedback_style?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submission Note */}
              <div 
                className="p-4 rounded-2xl text-center"
                style={{ 
                  backgroundColor: theme.accent + '10',
                  border: `1px solid ${theme.accent}`,
                }}
              >
                <p className="text-sm font-medium" style={{ color: theme.accent }}>
                  Ready to find your perfect designer? Click "Complete Brief" to submit your project and get matched!
                </p>
              </div>
            </div>
          )}

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
      </div>
    </>
  )
}