/**
 * Central Configuration Export
 * All configuration files are exported from here for easy access
 */

// Matching Configuration
export { MATCHING_PROMPT_CONFIG } from './matching/prompt.config'
export type { MatchingPromptConfig } from './matching/prompt.config'

// Form Configurations
export { DESIGNER_FORM_CONFIG } from './forms/designer.config'
export type { DesignerFormConfig } from './forms/designer.config'

export { BRIEF_FORM_CONFIG } from './forms/brief.config'
export type { BriefFormConfig } from './forms/brief.config'

// Configuration Documentation
export const CONFIG_DOCS = {
  matching: {
    description: "Controls how the AI matches designers to clients",
    location: "./matching/prompt.config.ts",
    editable: [
      "systemRole - Change the AI's personality and approach",
      "scoringWeights - Adjust importance of different factors (must total 100)",
      "eliminationCriteria - Enable/disable filters and adjust tolerances",
      "thresholds - Set minimum scores and messages",
      "customRules - Add business logic without code changes"
    ]
  },
  designerForm: {
    description: "Defines all fields in the designer application form",
    location: "./forms/designer.config.ts",
    editable: [
      "steps - Add/remove/reorder form steps",
      "fields - Add/remove/modify form fields",
      "validation - Change validation rules",
      "options - Update dropdown and checkbox options"
    ]
  },
  briefForm: {
    description: "Defines all fields in the client brief form",
    location: "./forms/brief.config.ts",
    editable: [
      "commonFields - Fields shown for all project types",
      "categoryFields - Category-specific fields",
      "styleFields - Design preference fields",
      "options - Update all selectable options"
    ]
  }
}

// Utility function to validate config
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate scoring weights total 100
  const weights = MATCHING_PROMPT_CONFIG.scoringWeights
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  if (total !== 100) {
    errors.push(`Scoring weights must total 100, currently ${total}`)
  }
  
  // Validate temperature is between 0 and 1
  const temp = MATCHING_PROMPT_CONFIG.aiSettings.temperature
  if (temp < 0 || temp > 1) {
    errors.push(`Temperature must be between 0 and 1, currently ${temp}`)
  }
  
  // Validate form steps have required fields
  DESIGNER_FORM_CONFIG.steps.forEach((step, index) => {
    if (!step.fields || step.fields.length === 0) {
      errors.push(`Designer form step ${index + 1} has no fields`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Helper to get config by path
export function getConfigValue(path: string): any {
  const parts = path.split('.')
  let current: any = {
    matching: MATCHING_PROMPT_CONFIG,
    designer: DESIGNER_FORM_CONFIG,
    brief: BRIEF_FORM_CONFIG
  }
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return undefined
    }
  }
  
  return current
}