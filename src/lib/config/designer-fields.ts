/**
 * Centralized Designer Field Configuration
 * Single source of truth for all designer-related fields across:
 * - Application form
 * - Profile page
 * - Matching system
 * - Admin dashboard
 */

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'textarea' 
  | 'select' 
  | 'multiselect' 
  | 'number' 
  | 'url' 
  | 'image' 
  | 'file'
  | 'radio'
  | 'checkbox'

export type FieldCategory = 
  | 'personal' 
  | 'professional' 
  | 'portfolio' 
  | 'experience' 
  | 'preferences'
  | 'internal'

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any) => boolean | string
}

export interface SelectOption {
  value: string
  label: string
  description?: string
}

export interface DesignerField {
  // Core field properties
  key: string                    // Database field name (snake_case)
  label: string                  // Display label
  type: FieldType               // Input type
  category: FieldCategory       // Field grouping
  
  // Display control
  showInApplication: boolean    // Show in initial application form
  showInProfile: boolean        // Show in profile edit page
  showInMatching: boolean       // Use in AI matching
  showInAdmin: boolean          // Show in admin dashboard
  
  // Edit control
  editableAfterApproval: boolean  // Can be edited after approval
  requiresReapproval: boolean     // Editing triggers re-approval
  
  // Field configuration
  placeholder?: string
  helpText?: string
  validation?: FieldValidation
  options?: SelectOption[]        // For select/multiselect
  defaultValue?: any
  
  // Data transformation
  apiField?: string              // API field name if different from key
  transformer?: (value: any) => any  // Transform data before save
}

/**
 * Master list of all designer fields
 * This is the SINGLE SOURCE OF TRUTH
 */
export const DESIGNER_FIELDS: DesignerField[] = [
  // ===== PERSONAL INFORMATION =====
  {
    key: 'first_name',
    label: 'First Name',
    type: 'text',
    category: 'personal',
    showInApplication: true,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'John',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50
    }
  },
  {
    key: 'last_name',
    label: 'Last Name',
    type: 'text',
    category: 'personal',
    showInApplication: true,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'Doe',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50
    }
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    category: 'personal',
    showInApplication: false, // Set during signup
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: false, // Email cannot be changed
    requiresReapproval: false,
    validation: {
      required: true
    }
  },
  
  // ===== PROFESSIONAL INFORMATION =====
  {
    key: 'title',
    label: 'Professional Title',
    type: 'text',
    category: 'professional',
    showInApplication: true,
    showInProfile: true,
    showInMatching: true,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: true,
    placeholder: 'Senior Product Designer',
    helpText: 'Your professional title or role',
    validation: {
      required: true,
      minLength: 5,
      maxLength: 100
    }
  },
  {
    key: 'bio',
    label: 'Professional Bio',
    type: 'textarea',
    category: 'professional',
    showInApplication: true,
    showInProfile: true,
    showInMatching: true,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: true,
    placeholder: 'Tell us about your design journey, expertise, and what makes you unique...',
    helpText: 'Minimum 100 characters. This helps clients understand your background.',
    validation: {
      required: true,
      minLength: 100,
      maxLength: 1000
    }
  },
  
  // ===== LOCATION & AVAILABILITY =====
  {
    key: 'country',
    label: 'Country',
    type: 'select',
    category: 'personal',
    showInApplication: true,
    showInProfile: true,
    showInMatching: true,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'Select your country',
    validation: {
      required: true
    }
  },
  {
    key: 'city',
    label: 'City',
    type: 'select',
    category: 'personal',
    showInApplication: true,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'Select your city',
    validation: {
      required: true
    }
  },
  {
    key: 'availability',
    label: 'Availability',
    type: 'select',
    category: 'professional',
    showInApplication: true,
    showInProfile: true,
    showInMatching: true,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    options: [
      { value: 'immediate', label: 'Immediately available' },
      { value: '1_week', label: 'Available in 1 week' },
      { value: '2_weeks', label: 'Available in 2 weeks' },
      { value: '1_month', label: 'Available in 1 month' },
      { value: 'not_available', label: 'Not currently available' }
    ],
    validation: {
      required: true
    }
  },
  
  // ===== PORTFOLIO LINKS =====
  {
    key: 'portfolio_url',
    label: 'Portfolio Website',
    type: 'url',
    category: 'portfolio',
    showInApplication: true,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: true,
    placeholder: 'https://yourportfolio.com',
    helpText: 'Your main portfolio website (required)',
    validation: {
      required: true,
      pattern: /^https?:\/\/.+/
    }
  },
  {
    key: 'website_url',
    label: 'Personal Website',
    type: 'url',
    category: 'portfolio',
    showInApplication: false,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'https://yourwebsite.com',
    validation: {
      pattern: /^https?:\/\/.+/
    }
  },
  {
    key: 'dribbble_url',
    label: 'Dribbble',
    type: 'url',
    category: 'portfolio',
    showInApplication: false,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'https://dribbble.com/username',
    validation: {
      pattern: /^https?:\/\/(www\.)?dribbble\.com\/.+/
    }
  },
  {
    key: 'behance_url',
    label: 'Behance',
    type: 'url',
    category: 'portfolio',
    showInApplication: false,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'https://behance.net/username',
    validation: {
      pattern: /^https?:\/\/(www\.)?behance\.net\/.+/
    }
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn',
    type: 'url',
    category: 'portfolio',
    showInApplication: false,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    placeholder: 'https://linkedin.com/in/username',
    validation: {
      pattern: /^https?:\/\/(www\.)?linkedin\.com\/.+/
    }
  },
  
  // ===== INTERNAL FIELDS (Not shown to designer) =====
  {
    key: 'is_approved',
    label: 'Approved',
    type: 'checkbox',
    category: 'internal',
    showInApplication: false,
    showInProfile: false,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: false,
    requiresReapproval: false,
    defaultValue: false
  },
  {
    key: 'is_verified',
    label: 'Email Verified',
    type: 'checkbox',
    category: 'internal',
    showInApplication: false,
    showInProfile: false,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: false,
    requiresReapproval: false,
    defaultValue: false
  },
  {
    key: 'rejection_reason',
    label: 'Rejection Reason',
    type: 'textarea',
    category: 'internal',
    showInApplication: false,
    showInProfile: false,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: false,
    requiresReapproval: false
  },
  {
    key: 'avatar_url',
    label: 'Profile Picture',
    type: 'image',
    category: 'personal',
    showInApplication: false,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    helpText: 'Upload a professional photo'
  },
  
  // ===== PORTFOLIO IMAGES =====
  {
    key: 'portfolio_image_1',
    label: 'Portfolio Image 1',
    type: 'image',
    category: 'portfolio',
    showInApplication: true,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    helpText: 'Upload your best work sample (JPG, PNG, max 5MB)'
  },
  {
    key: 'portfolio_image_2',
    label: 'Portfolio Image 2',
    type: 'image',
    category: 'portfolio',
    showInApplication: true,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    helpText: 'Upload your second work sample (JPG, PNG, max 5MB)'
  },
  {
    key: 'portfolio_image_3',
    label: 'Portfolio Image 3',
    type: 'image',
    category: 'portfolio',
    showInApplication: true,
    showInProfile: true,
    showInMatching: false,
    showInAdmin: true,
    editableAfterApproval: true,
    requiresReapproval: false,
    helpText: 'Upload your third work sample (JPG, PNG, max 5MB)'
  }
]

/**
 * Helper functions to work with fields
 */

// Get fields for a specific context
export function getFieldsForContext(context: 'application' | 'profile' | 'matching' | 'admin'): DesignerField[] {
  switch (context) {
    case 'application':
      return DESIGNER_FIELDS.filter(f => f.showInApplication)
    case 'profile':
      return DESIGNER_FIELDS.filter(f => f.showInProfile)
    case 'matching':
      return DESIGNER_FIELDS.filter(f => f.showInMatching)
    case 'admin':
      return DESIGNER_FIELDS.filter(f => f.showInAdmin)
    default:
      return []
  }
}

// Get fields by category
export function getFieldsByCategory(category: FieldCategory): DesignerField[] {
  return DESIGNER_FIELDS.filter(f => f.category === category)
}

// Get field by key
export function getFieldByKey(key: string): DesignerField | undefined {
  return DESIGNER_FIELDS.find(f => f.key === key)
}

// Check if field requires reapproval when edited
export function requiresReapproval(key: string): boolean {
  const field = getFieldByKey(key)
  return field?.requiresReapproval || false
}

// Validate field value
export function validateField(key: string, value: any): { valid: boolean; error?: string } {
  const field = getFieldByKey(key)
  if (!field || !field.validation) return { valid: true }
  
  const validation = field.validation
  
  // Required check
  if (validation.required && (!value || value === '')) {
    return { valid: false, error: `${field.label} is required` }
  }
  
  // String validations
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return { valid: false, error: `${field.label} must be at least ${validation.minLength} characters` }
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return { valid: false, error: `${field.label} must be no more than ${validation.maxLength} characters` }
    }
    // Only validate pattern if field has a value or is required
    if (validation.pattern && value.length > 0 && !validation.pattern.test(value)) {
      return { valid: false, error: `${field.label} format is invalid` }
    }
  }
  
  // Number validations
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return { valid: false, error: `${field.label} must be at least ${validation.min}` }
    }
    if (validation.max !== undefined && value > validation.max) {
      return { valid: false, error: `${field.label} must be no more than ${validation.max}` }
    }
  }
  
  // Custom validation
  if (validation.custom) {
    const result = validation.custom(value)
    if (result !== true) {
      return { valid: false, error: typeof result === 'string' ? result : `${field.label} is invalid` }
    }
  }
  
  return { valid: true }
}

// Transform API response to form data
export function transformApiToForm(apiData: Record<string, any>): Record<string, any> {
  const formData: Record<string, any> = {}
  
  DESIGNER_FIELDS.forEach(field => {
    const apiField = field.apiField || field.key
    if (apiData.hasOwnProperty(apiField)) {
      const value = apiData[apiField]
      formData[field.key] = field.transformer ? field.transformer(value) : value
    } else if (field.defaultValue !== undefined) {
      formData[field.key] = field.defaultValue
    }
  })
  
  return formData
}

// Transform form data to API format
export function transformFormToApi(formData: Record<string, any>): Record<string, any> {
  const apiData: Record<string, any> = {}
  
  DESIGNER_FIELDS.forEach(field => {
    if (formData.hasOwnProperty(field.key)) {
      const apiField = field.apiField || field.key
      apiData[apiField] = formData[field.key]
    }
  })
  
  return apiData
}

// Get only editable fields based on approval status
export function getEditableFields(isApproved: boolean): DesignerField[] {
  if (!isApproved) {
    // Before approval, all profile fields are editable
    return DESIGNER_FIELDS.filter(f => f.showInProfile)
  }
  // After approval, only fields marked as editableAfterApproval
  return DESIGNER_FIELDS.filter(f => f.showInProfile && f.editableAfterApproval)
}

// Check if any edited fields require reapproval
export function checkReapprovalNeeded(originalData: Record<string, any>, newData: Record<string, any>): boolean {
  for (const field of DESIGNER_FIELDS) {
    if (field.requiresReapproval) {
      const originalValue = originalData[field.key]
      const newValue = newData[field.key]
      if (originalValue !== newValue) {
        return true
      }
    }
  }
  return false
}