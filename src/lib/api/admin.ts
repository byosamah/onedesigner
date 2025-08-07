/**
 * Admin API service
 * Handles admin operations like designer management and stats
 */

import { apiClient } from './client'

export interface AdminStats {
  totalDesigners: number
  approvedDesigners: number
  pendingDesigners: number
  totalMatches: number
  averageMatchScore: number
  matchingPerformance?: {
    averageTime: number
    successRate: number
  }
}

export interface DesignerApproval {
  id: string
  first_name: string
  last_name: string
  email: string
  title: string
  city: string
  country: string
  is_approved: boolean
  is_verified: boolean
  created_at: string
}

export const adminService = {
  // Get admin dashboard stats
  async getStats() {
    return apiClient.get<AdminStats>('/admin/stats')
  },

  // Get all designers for approval
  async getDesigners() {
    return apiClient.get<{ designers: DesignerApproval[] }>('/admin/designers')
  },

  // Approve a designer
  async approveDesigner(designerId: string) {
    return apiClient.post(`/admin/designers/${designerId}/approve`)
  },

  // Reject a designer
  async rejectDesigner(designerId: string) {
    return apiClient.post(`/admin/designers/${designerId}/reject`)
  }
}