/**
 * Centralized API services export
 * Single import point for all API services
 */

// Core client
export { apiClient, ApiClient } from './client'
export type { ApiResponse } from './client'

// Auth services
export { authService, designerAuthService, adminAuthService } from './auth'
export type { AuthSession, OTPRequest, OTPVerification } from './auth'

// Match services  
export { matchService } from './matches'
export type { FindMatchRequest, Match } from './matches'

// Payment services
export { paymentService } from './payment'
export type { CheckoutRequest, PurchasePackage } from './payment'

// Designer services
export { designerService } from './designer'
export type { DesignerProfile, DesignerRequest } from './designer'

// Admin services
export { adminService } from './admin'
export type { AdminStats, DesignerApproval } from './admin'