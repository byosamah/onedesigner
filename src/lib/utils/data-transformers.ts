/**
 * Data transformation utilities for consistent API responses
 * Handles snake_case to camelCase conversions and data mapping
 */

/**
 * Transform designer data from database (snake_case) to frontend (camelCase)
 */
export const transformDesignerData = (designer: any) => {
  if (!designer) return null
  
  return {
    id: designer.id,
    email: designer.email,
    firstName: designer.first_name,
    lastName: designer.last_name,
    lastInitial: designer.last_initial,
    title: designer.title,
    phone: designer.phone,
    avatarUrl: designer.avatar_url,
    profilePicture: designer.avatar_url, // Alias for compatibility
    bio: designer.bio,
    portfolioUrl: designer.portfolio_url || designer.website_url,
    websiteUrl: designer.website_url,
    dribbbleUrl: designer.dribbble_url,
    behanceUrl: designer.behance_url,
    linkedinUrl: designer.linkedin_url,
    country: designer.country,
    city: designer.city,
    availability: designer.availability,
    yearsExperience: designer.years_experience,
    primaryCategories: designer.primary_categories,
    designPhilosophy: designer.design_philosophy,
    isApproved: designer.is_approved,
    isVerified: designer.is_verified,
    editedAfterApproval: designer.edited_after_approval,
    lastApprovedAt: designer.last_approved_at,
    approvedAt: designer.approved_at,
    createdAt: designer.created_at,
    updatedAt: designer.updated_at,
    rating: designer.rating,
    totalProjects: designer.total_projects,
    // Portfolio images - using tools array until portfolio_image columns are added
    portfolioImage1: designer.tools?.[0] || designer.portfolio_image_1,
    portfolioImage2: designer.tools?.[1] || designer.portfolio_image_2,
    portfolioImage3: designer.tools?.[2] || designer.portfolio_image_3,
    portfolioImages: designer.tools || [
      designer.portfolio_image_1,
      designer.portfolio_image_2,
      designer.portfolio_image_3
    ].filter(Boolean), // Array format for compatibility
  }
}

/**
 * Transform form data from frontend (camelCase) to database (snake_case)
 */
export const transformDesignerFormData = (formData: any) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    profilePicture,
    title,
    portfolioUrl,
    dribbbleUrl,
    behanceUrl,
    linkedinUrl,
    country,
    city,
    availability,
    bio,
    portfolioImages,
    yearsExperience,
    primaryCategories,
    designPhilosophy,
  } = formData

  // Calculate last initial from last name
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ''

  // Handle portfolio images - store in tools array until portfolio_image columns exist
  const portfolioImageData = portfolioImages ? {
    tools: portfolioImages, // Store in tools array which exists
    // These columns don't exist yet in the database
    // portfolio_image_1: portfolioImages[0] || null,
    // portfolio_image_2: portfolioImages[1] || null,
    // portfolio_image_3: portfolioImages[2] || null,
  } : { tools: [] }

  return {
    first_name: firstName,
    last_name: lastName,
    last_initial: lastInitial,
    email,
    phone: phone || null,
    avatar_url: profilePicture || null,
    title,
    portfolio_url: portfolioUrl,
    website_url: portfolioUrl, // Also save as website_url for compatibility
    dribbble_url: dribbbleUrl || null,
    behance_url: behanceUrl || null,
    linkedin_url: linkedinUrl || null,
    country,
    city,
    availability: availability || 'immediate',
    bio,
    years_experience: yearsExperience?.toString() || '0',
    primary_categories: primaryCategories || [],
    design_philosophy: designPhilosophy || '',
    ...portfolioImageData,
  }
}

/**
 * Transform client data from database to frontend
 */
export const transformClientData = (client: any) => {
  if (!client) return null
  
  return {
    id: client.id,
    email: client.email,
    name: client.name,
    company: client.company,
    matchCredits: client.match_credits,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
  }
}

/**
 * Transform match/request data for designer dashboard
 */
export const transformMatchRequestData = (request: any) => {
  if (!request) return null
  
  return {
    id: request.id,
    matchId: request.match_id || request.match?.id,
    designerId: request.designer_id,
    clientId: request.client_id,
    status: request.status,
    initialMessage: request.initial_message,
    createdAt: request.created_at,
    expiresAt: request.expires_at,
    viewedAt: request.viewed_at,
    respondedAt: request.responded_at,
    // Nested data
    client: transformClientData(request.client || request.clients),
    brief: request.brief ? {
      id: request.brief.id,
      projectType: request.brief.project_type || request.brief.design_category,
      industry: request.brief.industry,
      timeline: request.brief.timeline || request.brief.timeline_type,
      budget: request.brief.budget || request.brief.budget_range,
      description: request.brief.description || request.brief.project_description,
      styles: request.brief.styles || [],
      requirements: request.brief.requirements,
      targetAudience: request.brief.target_audience || request.brief.industry,
      projectGoal: request.brief.project_goal || request.brief.inspiration,
    } : null,
    match: request.match ? {
      score: request.match.score,
      personalizedReasons: request.match.personalized_reasons || [],
      reasons: request.match.reasons || [],
      confidence: request.match.confidence || 'High',
      matchSummary: request.match.match_summary || '',
      uniqueValue: request.match.unique_value || '',
    } : null,
  }
}

/**
 * Generic snake_case to camelCase converter for any object
 */
export const snakeToCamel = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj
  if (Array.isArray(obj)) return obj.map(snakeToCamel)
  if (typeof obj !== 'object') return obj

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    acc[camelKey] = snakeToCamel(obj[key])
    return acc
  }, {} as any)
}

/**
 * Generic camelCase to snake_case converter for any object
 */
export const camelToSnake = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj
  if (Array.isArray(obj)) return obj.map(camelToSnake)
  if (typeof obj !== 'object') return obj

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    acc[snakeKey] = camelToSnake(obj[key])
    return acc
  }, {} as any)
}