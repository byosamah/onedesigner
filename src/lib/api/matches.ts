/**
 * Matches API service
 * Handles match finding, unlocking, and management
 */

import { apiClient } from './client'

export interface FindMatchRequest {
  projectType: string
  industry: string
  timeline: string
  styles: string[]
  inspiration?: string
  requirements?: string
  companyName?: string
  budget?: string
}

export interface Match {
  id: string
  score: number
  status: 'pending' | 'unlocked' | 'completed'
  reasons: string[]
  personalized_reasons: string[]
  created_at: string
  designer: {
    id: string
    firstName: string
    lastName: string
    lastInitial: string
    title: string
    city: string
    country: string
    email?: string
    phone?: string
    website?: string
    rating?: number
    totalProjects?: number
    yearsExperience?: number
  }
  brief: {
    project_type: string
    company_name: string
    budget: string
    timeline: string
  }
}

export const matchService = {
  // Find a new match (optimized with SSE streaming)
  async findOptimized(briefData: FindMatchRequest) {
    // Note: This would typically use EventSource for SSE streaming
    // For now, falls back to regular API call
    return apiClient.post<Match>('/match/find-optimized', briefData)
  },

  // Find a match (original endpoint)
  async find(briefData: FindMatchRequest) {
    return apiClient.post<Match>('/match/find', briefData)
  },

  // Get client matches
  async getClientMatches() {
    return apiClient.get<{ matches: Match[] }>('/client/matches')
  },

  // Unlock a match with credits
  async unlockMatch(matchId: string) {
    return apiClient.post(`/client/matches/${matchId}/unlock`)
  },

  // Submit match feedback
  async submitFeedback(matchId: string, rating: number, feedback: string) {
    return apiClient.post('/match/feedback', {
      matchId,
      rating,
      feedback
    })
  }
}