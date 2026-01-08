/**
 * Shared type definitions for dashboard components
 * Centralized types improve maintainability while preserving backward compatibility
 */

/**
 * Designer information for match display
 */
export interface MatchDesigner {
  id: string
  firstName: string
  lastName: string
  lastInitial: string
  title: string
  city: string
  country: string
  yearsExperience?: number // Optional for backward compatibility
  rating: number
  totalProjects: number
  email?: string
  phone?: string
  website?: string
  portfolioUrl?: string
  linkedinUrl?: string
  dribbbleUrl?: string
  behanceUrl?: string
  avatarUrl?: string
  portfolioImages?: string[]
  designPhilosophy: string
  primaryCategories: string[]
  styleKeywords: string[]
  avgClientSatisfaction: number
  onTimeDeliveryRate: number
}

/**
 * Brief information for match context
 */
export interface MatchBrief {
  designCategory: string
  timeline: string
  budget: string
  description: string
  // Additional fields for backward compatibility
  project_type?: string
  project_description?: string
  requirements?: string
}

/**
 * Working request status information
 */
export interface WorkingRequestStatus {
  status: 'pending' | 'accepted' | 'declined' | 'approved'
  createdAt: string
  responseDeadline: string
  viewedAt?: string
}

/**
 * Enhanced match with all related data
 */
export interface EnhancedMatch {
  id: string
  score: number
  confidence: string
  matchSummary: string
  reasons: string[]
  personalizedReasons: string[]
  uniqueValue: string
  potentialChallenges: string[]
  riskLevel: string
  status: 'pending' | 'unlocked' | 'completed'
  created_at: string
  designer: MatchDesigner
  brief: MatchBrief
  workingRequest?: WorkingRequestStatus
}

/**
 * Client profile information
 */
export interface ClientProfile {
  id: string
  email: string
  match_credits: number
  created_at: string
  company_name?: string
  first_name?: string
  last_name?: string
}

/**
 * Designer profile for admin views
 */
export interface DesignerProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  title: string
  avatar_url?: string
  is_approved: boolean
  is_verified: boolean
  edited_after_approval?: boolean
  last_approved_at?: string
  created_at: string
  // Application details
  city?: string
  country?: string
  portfolio_url?: string
  linkedin_url?: string
  dribbble_url?: string
  behance_url?: string
  years_experience?: number
  design_philosophy?: string
  primary_categories?: string[]
  style_keywords?: string[]
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalMatches?: number
  unlockedMatches?: number
  pendingRequests?: number
  acceptedRequests?: number
  remainingCredits?: number
  avgMatchScore?: number
}

/**
 * API response types for type safety
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Session types for authentication
 */
export interface ClientSession {
  valid: boolean
  clientId: string
  email: string
  role: 'client'
}

export interface DesignerSession {
  valid: boolean
  designerId: string
  email: string
  role: 'designer'
  isApproved: boolean
  isVerified: boolean
}

export interface AdminSession {
  valid: boolean
  adminId: string
  email: string
  role: 'admin'
}

export type UserSession = ClientSession | DesignerSession | AdminSession

/**
 * Type guards for runtime type checking
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true
}

export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false
}

export function isClientSession(session: UserSession): session is ClientSession {
  return session.role === 'client'
}

export function isDesignerSession(session: UserSession): session is DesignerSession {
  return session.role === 'designer'
}

export function isAdminSession(session: UserSession): session is AdminSession {
  return session.role === 'admin'
}

// Export all types for convenience
export default {
  // Re-export all interfaces for backward compatibility
  EnhancedMatch,
  ClientProfile,
  DesignerProfile,
  DashboardStats,
  ApiResponse,
  UserSession,
  // Type guards
  isApiSuccess,
  isApiError,
  isClientSession,
  isDesignerSession,
  isAdminSession
} as const