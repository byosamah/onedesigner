/**
 * Centralized Matching System
 * Uses the centralized field configuration to ensure consistency
 * Only sends fields marked for matching to the AI
 */

import { 
  DESIGNER_FIELDS,
  getFieldsForContext 
} from '@/lib/config/designer-fields'
import { prepareForMatching } from '@/lib/utils/designer-data-transformer'
import { logger } from '@/lib/core/logging-service'

export interface PreparedDesigner {
  // Core identification
  id: string
  firstName: string
  lastName: string
  email: string
  
  // Professional info (for matching)
  title?: string
  bio?: string
  yearsExperience?: string
  
  // Location & availability
  country?: string
  availability?: string
  
  // Internal use
  isApproved: boolean
  isVerified: boolean
}

export interface PreparedBrief {
  // Core project info
  projectType: string
  industry: string
  budget: string
  timeline: string
  styles?: string[]
  
  // Company info
  companyName?: string
  
  // Detailed requirements
  requirements?: string
  targetAudience?: string
  brandPersonality?: string
  successMetrics?: string
  inspiration?: string
}

/**
 * Prepare designer data for matching using centralized fields
 * Only includes fields marked with showInMatching: true
 */
export function prepareDesignerForMatching(designer: any): PreparedDesigner {
  // Get only fields that should be used in matching
  const matchingFields = getFieldsForContext('matching')
  
  const prepared: PreparedDesigner = {
    // Always include core identification
    id: designer.id,
    firstName: designer.first_name || designer.firstName || '',
    lastName: designer.last_name || designer.lastName || '',
    email: designer.email || '',
    
    // Include approval status
    isApproved: designer.is_approved || designer.isApproved || false,
    isVerified: designer.is_verified || designer.isVerified || false
  }
  
  // Add matching fields dynamically based on configuration
  matchingFields.forEach(field => {
    const dbKey = field.key
    const camelKey = dbKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    
    // Get value from either snake_case or camelCase
    const value = designer[dbKey] || designer[camelKey]
    
    if (value !== undefined && value !== null && value !== '') {
      // Map to camelCase for consistency
      switch (dbKey) {
        case 'title':
          prepared.title = value
          break
        case 'bio':
          prepared.bio = value
          break
        case 'years_experience':
          prepared.yearsExperience = value
          break
        case 'country':
          prepared.country = value
          break
        case 'availability':
          prepared.availability = value
          break
      }
    }
  })
  
  return prepared
}

/**
 * Prepare brief data for matching
 * Normalizes field names to camelCase
 */
export function prepareBriefForMatching(brief: any): PreparedBrief {
  return {
    // Core fields
    projectType: brief.project_type || brief.projectType || '',
    industry: brief.industry || '',
    budget: brief.budget || '',
    timeline: brief.timeline || '',
    styles: brief.styles || [],
    
    // Company info
    companyName: brief.company_name || brief.companyName || '',
    
    // Detailed requirements
    requirements: brief.requirements || '',
    targetAudience: brief.target_audience || brief.targetAudience || '',
    brandPersonality: brief.brand_personality || brief.brandPersonality || '',
    successMetrics: brief.success_metrics || brief.successMetrics || '',
    inspiration: brief.inspiration || ''
  }
}

/**
 * Create a match analysis prompt using only available fields
 * This ensures we don't reference phantom fields in AI prompts
 */
export function createCentralizedMatchPrompt(
  designer: PreparedDesigner, 
  brief: PreparedBrief
): string {
  return `
==== DESIGNER-CLIENT MATCH ANALYSIS ====

Analyze if this designer is a perfect match for this client's project.
Score from 0-100 where:
- 90-100: Perfect match, exceptional fit
- 80-89: Great match, strong alignment  
- 70-79: Good match, solid choice
- 60-69: Decent match, acceptable
- Below 60: Poor match, not recommended

==== CLIENT PROJECT ====

PROJECT BASICS:
- Project Type: ${brief.projectType}
- Industry: ${brief.industry}
- Budget: ${brief.budget}
- Timeline: ${brief.timeline}
- Design Styles: ${brief.styles?.join(', ') || 'Not specified'}

PROJECT DETAILS:
- Company: ${brief.companyName || 'Not specified'}
- Requirements: ${brief.requirements || 'Not specified'}
- Target Audience: ${brief.targetAudience || 'Not specified'}
- Brand Personality: ${brief.brandPersonality || 'Not specified'}

==== DESIGNER PROFILE ====

PROFESSIONAL INFO:
- Name: ${designer.firstName} ${designer.lastName}
- Title: ${designer.title || 'Not specified'}
- Experience: ${designer.yearsExperience || 'Not specified'}
- Location: ${designer.country || 'Not specified'}
- Availability: ${designer.availability || 'Not specified'}

BIO & EXPERTISE:
${designer.bio || 'No bio provided'}

==== ANALYSIS REQUIRED ====

Based ONLY on the information provided above, evaluate:

1. EXPERTISE FIT (0-100):
   Does the designer's title and bio suggest expertise in ${brief.projectType}?
   
2. INDUSTRY ALIGNMENT (0-100):
   Does their background align with ${brief.industry}?
   
3. AVAILABILITY MATCH (0-100):
   Can they deliver within the ${brief.timeline} timeline?
   
4. OVERALL CHEMISTRY (0-100):
   How well do they match the project's needs?

Provide response in this exact JSON format:
{
  "matchScore": [0-100],
  "isRecommended": [true/false],
  "confidence": ["high", "medium", "low"],
  "specificEvidence": ["reason1", "reason2", "reason3"],
  "matchDecision": "Brief explanation of decision",
  "potentialConcerns": ["concern1", "concern2"] or [],
  "keyDistinction": "What makes this designer unique for this project"
}

IMPORTANT: 
- Base your analysis ONLY on the actual data provided
- Do not assume or invent capabilities not mentioned in the bio
- Be realistic with scoring - most matches should be 60-85
- Only score 90+ for truly exceptional alignment`
}

/**
 * Validate that a designer has minimum required fields for matching
 */
export function isDesignerValidForMatching(designer: any): boolean {
  // Check required fields from centralized config
  const requiredFields = ['first_name', 'last_name', 'title', 'bio']
  
  for (const field of requiredFields) {
    const value = designer[field]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      logger.warn(`Designer ${designer.id} missing required field: ${field}`)
      return false
    }
  }
  
  // Must be approved and verified
  if (!designer.is_approved || !designer.is_verified) {
    logger.warn(`Designer ${designer.id} not approved/verified`)
    return false
  }
  
  return true
}

/**
 * Filter designers to only those valid for matching
 */
export function filterDesignersForMatching(designers: any[]): any[] {
  return designers.filter(d => isDesignerValidForMatching(d))
}

/**
 * Log matching context for debugging
 */
export function logMatchingContext(
  preparedDesigner: PreparedDesigner,
  preparedBrief: PreparedBrief
): void {
  logger.info('=== MATCHING CONTEXT ===')
  logger.info('Designer:', {
    name: `${preparedDesigner.firstName} ${preparedDesigner.lastName}`,
    title: preparedDesigner.title,
    experience: preparedDesigner.yearsExperience,
    availability: preparedDesigner.availability
  })
  logger.info('Brief:', {
    type: preparedBrief.projectType,
    industry: preparedBrief.industry,
    timeline: preparedBrief.timeline,
    budget: preparedBrief.budget
  })
  logger.info('========================')
}