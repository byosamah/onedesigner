/**
 * Authentication API service
 * Handles OTP sending, verification, and session management
 */

import { apiClient } from './client'

export interface AuthSession {
  user: {
    id: string
    email: string
    role?: string
  }
  client?: {
    id: string
    email: string
    match_credits: number
  }
  designer?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export interface OTPRequest {
  email: string
}

export interface OTPVerification {
  email: string
  token: string
}

export const authService = {
  // Send OTP code to email
  async sendOTP(data: OTPRequest) {
    return apiClient.post('/auth/send-otp', data)
  },

  // Verify OTP code
  async verifyOTP(data: OTPVerification) {
    return apiClient.post('/auth/verify-otp', data)
  },

  // Get current session
  async getSession() {
    return apiClient.get<AuthSession>('/auth/session')
  },

  // Sign out
  async signOut() {
    return apiClient.post('/auth/signout')
  }
}

// Designer-specific auth
export const designerAuthService = {
  // Designer login
  async login(email: string) {
    return apiClient.post('/designer/login', { email })
  },

  // Designer session check
  async getSession() {
    return apiClient.get('/designer/auth/session')
  },

  // Designer sign out
  async signOut() {
    return apiClient.post('/designer/auth/signout')
  },

  // Designer verification
  async verify(data: { email: string; token: string; applicationData?: any }) {
    return apiClient.post('/designer/verify', data)
  }
}

// Admin-specific auth
export const adminAuthService = {
  // Send admin OTP
  async sendOTP(email: string) {
    return apiClient.post('/admin/auth/send-otp', { email })
  },

  // Verify admin OTP
  async verifyOTP(data: OTPVerification) {
    return apiClient.post('/admin/auth/verify', data)
  },

  // Get admin session
  async getSession() {
    return apiClient.get('/admin/auth/session')
  },

  // Admin sign out
  async signOut() {
    return apiClient.post('/admin/auth/signout')
  }
}