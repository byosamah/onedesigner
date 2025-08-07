/**
 * Payment API service
 * Handles checkout creation and payment processing
 */

import { apiClient } from './client'

export interface CheckoutRequest {
  productKey: string
  matchId?: string | null
}

export interface PurchasePackage {
  id: string
  name: string
  credits: number
  price: number
  pricePerMatch: number
  popular?: boolean
  description: string
  features: string[]
}

export const paymentService = {
  // Create checkout session
  async createCheckout(data: CheckoutRequest) {
    return apiClient.post<{ checkoutUrl: string }>('/checkout/create', data)
  },

  // Alternative checkout endpoint (legacy)
  async createPaymentCheckout(data: CheckoutRequest) {
    return apiClient.post<{ checkoutUrl: string }>('/payment/create-checkout', data)
  }
}