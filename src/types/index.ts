export interface Designer {
  id: string
  // Public fields
  firstName: string
  lastInitial: string
  title: string
  city: string
  country: string
  yearsExperience: number
  totalProjects: number
  avatarUrl?: string
  
  // Protected fields (only visible after unlock)
  lastName?: string
  email?: string
  phone?: string
  websiteUrl?: string
  calendarUrl?: string
  linkedinUrl?: string
  
  // Profile data
  bio?: string
  styles: string[]
  industries: string[]
  tools: string[]
  hourlyRate?: number
  availability?: string
  responseTime?: string
  timezone?: string
}

export interface Portfolio {
  id: string
  title: string
  description?: string
  imageUrl: string
  projectType: string
  industry?: string
  client?: string
  caseStudyUrl?: string
  featured: boolean
}

export interface Brief {
  id: string
  projectType: string
  industry: string
  timeline: string
  budget?: string
  styles: string[]
  inspiration?: string
  requirements?: string
  timezone?: string
  communication: string[]
}

export interface Match {
  id: string
  designer: Designer
  score: number
  reasons: string[]
  personalizedReasons: string[]
  isUnlocked: boolean
}

export interface MatchUnlock {
  matchId: string
  paymentId: string
  amount: number
  unlockedAt: Date
}

export type DesignerRequestStatus = 'pending' | 'viewed' | 'accepted' | 'declined' | 'expired'

export interface DesignerRequest {
  id: string
  match: Match
  status: DesignerRequestStatus
  sentAt: Date
  viewedAt?: Date
  respondedAt?: Date
  expiresAt: Date
  response?: string
  message?: string
}