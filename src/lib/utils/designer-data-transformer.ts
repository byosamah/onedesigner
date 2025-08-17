/**
 * Designer Data Transformer
 * Handles data transformation between API (snake_case) and UI (camelCase)
 * Ensures data consistency across the application
 */

import { DESIGNER_FIELDS, getFieldByKey } from '@/lib/config/designer-fields'

/**
 * Transform snake_case API response to camelCase for UI
 */
export function transformDesignerApiToUI(apiData: Record<string, any>): Record<string, any> {
  const uiData: Record<string, any> = {}
  
  // Only include fields that are defined in our field configuration
  DESIGNER_FIELDS.forEach(field => {
    const apiKey = field.apiField || field.key
    
    // Check if the API response has this field
    if (apiData.hasOwnProperty(apiKey)) {
      // Convert snake_case to camelCase for UI
      const uiKey = snakeToCamel(field.key)
      uiData[uiKey] = apiData[apiKey]
    } else if (field.defaultValue !== undefined) {
      // Use default value if field is missing
      const uiKey = snakeToCamel(field.key)
      uiData[uiKey] = field.defaultValue
    }
  })
  
  // Special handling for computed fields
  if (!uiData.status) {
    // Derive status if not present
    if (apiData.is_approved) {
      uiData.status = 'approved'
    } else if (apiData.rejection_reason) {
      uiData.status = 'rejected'
    } else if (apiData.first_name && apiData.last_name && apiData.bio) {
      uiData.status = 'pending'
    } else {
      uiData.status = 'incomplete'
    }
  }
  
  // Add full name for convenience
  if (uiData.firstName && uiData.lastName) {
    uiData.fullName = `${uiData.firstName} ${uiData.lastName}`.trim()
  }
  
  // Add initials for avatar fallback
  if (uiData.firstName || uiData.lastName) {
    const firstInitial = uiData.firstName?.[0] || ''
    const lastInitial = uiData.lastName?.[0] || ''
    uiData.initials = (firstInitial + lastInitial).toUpperCase()
  }
  
  return uiData
}

/**
 * Transform camelCase UI data to snake_case for API
 */
export function transformDesignerUIToApi(uiData: Record<string, any>): Record<string, any> {
  const apiData: Record<string, any> = {}
  
  Object.keys(uiData).forEach(uiKey => {
    // Convert camelCase to snake_case
    const snakeKey = camelToSnake(uiKey)
    
    // Check if this field exists in our configuration
    const field = getFieldByKey(snakeKey)
    
    if (field) {
      // Only include fields that are defined in our configuration
      const apiKey = field.apiField || field.key
      apiData[apiKey] = uiData[uiKey]
    }
  })
  
  return apiData
}

/**
 * Filter out fields that shouldn't be sent to API
 */
export function filterApiFields(data: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {}
  
  DESIGNER_FIELDS.forEach(field => {
    // Skip internal fields when sending to API (except from admin)
    if (field.category === 'internal') {
      return
    }
    
    const key = field.key
    if (data.hasOwnProperty(key) && data[key] !== undefined && data[key] !== '') {
      filtered[key] = data[key]
    }
  })
  
  return filtered
}

/**
 * Clean and validate designer data before saving
 */
export function cleanDesignerData(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  
  DESIGNER_FIELDS.forEach(field => {
    const value = data[field.key]
    
    // Skip undefined or empty values unless they have defaults
    if (value === undefined || value === '') {
      if (field.defaultValue !== undefined) {
        cleaned[field.key] = field.defaultValue
      }
      return
    }
    
    // Clean based on field type
    switch (field.type) {
      case 'text':
      case 'email':
      case 'textarea':
        cleaned[field.key] = String(value).trim()
        break
      
      case 'url':
        // Ensure URLs have protocol
        let url = String(value).trim()
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url
        }
        cleaned[field.key] = url
        break
      
      case 'number':
        cleaned[field.key] = Number(value)
        break
      
      case 'checkbox':
        cleaned[field.key] = Boolean(value)
        break
      
      default:
        cleaned[field.key] = value
    }
  })
  
  return cleaned
}

/**
 * Utility functions for case conversion
 */

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '')
}

/**
 * Get only the fields that have changed
 */
export function getChangedFields(
  original: Record<string, any>, 
  updated: Record<string, any>
): Record<string, any> {
  const changes: Record<string, any> = {}
  
  Object.keys(updated).forEach(key => {
    if (original[key] !== updated[key]) {
      changes[key] = updated[key]
    }
  })
  
  return changes
}

/**
 * Merge designer data with defaults
 */
export function mergeWithDefaults(data: Record<string, any>): Record<string, any> {
  const merged = { ...data }
  
  DESIGNER_FIELDS.forEach(field => {
    if (!merged.hasOwnProperty(field.key) && field.defaultValue !== undefined) {
      merged[field.key] = field.defaultValue
    }
  })
  
  return merged
}

/**
 * Prepare designer data for matching algorithm
 */
export function prepareForMatching(designer: Record<string, any>): Record<string, any> {
  const matchingData: Record<string, any> = {
    id: designer.id,
    // Only include fields marked for matching
    ...DESIGNER_FIELDS
      .filter(field => field.showInMatching)
      .reduce((acc, field) => {
        if (designer[field.key] !== undefined) {
          acc[field.key] = designer[field.key]
        }
        return acc
      }, {} as Record<string, any>)
  }
  
  return matchingData
}