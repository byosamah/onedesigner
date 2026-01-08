// Import URL constants
import { PRODUCTION_URLS, EXTERNAL_URLS } from './urls'

// Pricing packages configuration
export const PRICING_PACKAGES = [
  {
    id: 'STARTER_PACK',
    name: 'Starter Pack',
    description: 'Perfect for trying out',
    price: 5,
    credits: 3,
    pricePerMatch: 1.67,
    features: [
      '3 designer matches',
      'AI-powered matching',
      'Direct contact info',
      '48-hour guarantee',
      'No platform fees'
    ],
    popular: false,
  },
  {
    id: 'GROWTH_PACK',
    name: 'Growth Pack',
    description: 'Most founders choose this',
    price: 15,
    credits: 10,
    pricePerMatch: 1.50,
    features: [
      '10 designer matches',
      'Everything in Starter',
      'Priority matching',
      'Bulk project briefs',
      'Save 10% per match'
    ],
    popular: true,
  },
  {
    id: 'SCALE_PACK',
    name: 'Scale Pack',
    description: 'Best value for agencies',
    price: 30,
    credits: 25,
    pricePerMatch: 1.20,
    features: [
      '25 designer matches',
      'Everything in Growth',
      'Dedicated support',
      'Team access (3 seats)',
      'Save 28% per match'
    ],
    popular: false,
  },
] as const

// Design styles configuration
export const DESIGN_STYLES = [
  { id: 'minimal', label: 'Minimal & Clean', emoji: '⚪' },
  { id: 'modern', label: 'Modern & Bold', emoji: '🔥' },
  { id: 'playful', label: 'Playful & Fun', emoji: '🎨' },
  { id: 'corporate', label: 'Corporate & Professional', emoji: '💼' },
  { id: 'elegant', label: 'Elegant & Sophisticated', emoji: '✨' },
  { id: 'technical', label: 'Technical & Data-driven', emoji: '📊' },
] as const

// Project types configuration
export const PROJECT_TYPES = [
  { id: 'brand-identity', label: 'Brand Identity', emoji: '🎯' },
  { id: 'web-design', label: 'Web Design', emoji: '🌐' },
  { id: 'app-design', label: 'App Design', emoji: '📱' },
  { id: 'dashboard', label: 'Dashboard/SaaS', emoji: '📊' },
  { id: 'marketing', label: 'Marketing Design', emoji: '📢' },
  { id: 'illustration', label: 'Illustration', emoji: '🎨' },
] as const

// Industries list
export const INDUSTRIES = [
  'SaaS', 
  'Fintech', 
  'E-commerce', 
  'Healthcare', 
  'Education', 
  'Crypto', 
  'AI/ML', 
  'Social Media'
] as const

// Animation classes
export const ANIMATIONS = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  scale: 'hover:scale-[1.02]'
} as const

// Common styling values
export const STYLES = {
  borderRadius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
  }
} as const

// Authentication constants
export const AUTH_COOKIES = {
  CLIENT: 'client-session',
  DESIGNER: 'designer-auth',
  ADMIN: 'admin-session'
} as const

export const API_ENDPOINTS = {
  RESEND: PRODUCTION_URLS.API.RESEND,
  LEMONSQUEEZY: PRODUCTION_URLS.API.LEMONSQUEEZY,
  DEEPSEEK: PRODUCTION_URLS.API.DEEPSEEK
} as const

// OTP configuration
export const OTP_CONFIG = {
  EXPIRY_TIME: 600000, // 10 minutes in milliseconds
  LENGTH: 6
} as const

// Discount codes configuration for testing
export const DISCOUNT_CODES = {
  OSAMA: {
    code: 'OSAMA',
    discount: 100, // 100% discount (completely free)
    description: 'Free matches for Cypress testing',
    active: true,
    isTestingCode: true, // Bypasses LemonSqueezy entirely
    expiresAt: null, // Never expires
    usageLimit: null, // Unlimited usage for testing
    appliesTo: ['STARTER_PACK', 'GROWTH_PACK', 'SCALE_PACK'] // All packages
  }
} as const

// Placeholder images (now from centralized URLs)
export const PLACEHOLDER_IMAGES = {
  DESIGNER_AVATAR: EXTERNAL_URLS.PLACEHOLDER.UNSPLASH_DESIGNER,
  PROJECT_PREVIEW: EXTERNAL_URLS.PLACEHOLDER.UNSPLASH_PROJECT
} as const

// Re-export design categories, URLs, and business timing
export * from './design-categories'
export * from './urls'
export * from './business-timing'

// Type exports for type safety
export type PricingPackage = typeof PRICING_PACKAGES[number]
export type DesignStyle = typeof DESIGN_STYLES[number]
export type ProjectType = typeof PROJECT_TYPES[number]
export type Industry = typeof INDUSTRIES[number]