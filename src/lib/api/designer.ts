/**
 * Designer API service
 * Handles designer applications, profiles, and requests
 */

import { apiClient } from './client'

export interface DesignerProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  title: string
  bio: string
  city: string
  country: string
  timezone: string
  years_experience: string
  hourly_rate?: string
  website_url?: string
  phone?: string
  availability: 'available' | 'busy' | 'unavailable'
  styles: string[]
  project_types: string[]
  industries: string[]
  is_approved: boolean
  is_verified: boolean
}

export interface DesignerRequest {
  id: string
  matchId: string
  status: 'pending' | 'accepted' | 'declined'
  sentAt: string
  brief: {
    projectType: string
    industry: string
    timeline: string
  }
  client: {
    email: string
  }
  match: {
    score: number
    personalizedReasons: string[]
  }
}

export interface DesignerApplication {
  firstName: string
  lastName: string
  email: string
  phone?: string
  title: string
  yearsExperience: string
  websiteUrl?: string
  hourlyRate?: string
  city: string
  country: string
  timezone: string
  availability: string
  styles: string[]
  projectTypes: string[]
  industries: string[]
  bio: string
}

export const designerService = {
  // Submit designer application
  async apply(applicationData: DesignerApplication) {
    return apiClient.post('/designer/apply', applicationData)
  },

  // Get designer profile
  async getProfile() {
    return apiClient.get<DesignerProfile>('/designer/profile')
  },

  // Update designer profile
  async updateProfile(profileData: Partial<DesignerProfile>) {
    return apiClient.put('/designer/profile', profileData)
  },

  // Get designer requests/matches
  async getRequests() {
    return apiClient.get<{ requests: DesignerRequest[] }>('/designer/requests')
  },

  // Respond to a request (accept/decline)
  async respondToRequest(requestId: string, response: 'accept' | 'decline') {
    return apiClient.post(`/designer/requests/${requestId}/respond`, { response })
  }
}