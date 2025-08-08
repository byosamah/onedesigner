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
  DESIGNER: 'designer-session',
  ADMIN: 'admin-session'
} as const

// API endpoints
export const API_ENDPOINTS = {
  RESEND: 'https://api.resend.com/emails',
  LEMONSQUEEZY: 'https://api.lemonsqueezy.com/v1',
  DEEPSEEK: 'https://api.deepseek.com/v1'
} as const

// OTP configuration
export const OTP_CONFIG = {
  EXPIRY_TIME: 600000, // 10 minutes in milliseconds
  LENGTH: 6
} as const

// Placeholder images
export const PLACEHOLDER_IMAGES = {
  DESIGNER_AVATAR: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  PROJECT_PREVIEW: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'
} as const

// Type exports for type safety
export type PricingPackage = typeof PRICING_PACKAGES[number]
export type DesignStyle = typeof DESIGN_STYLES[number]
export type ProjectType = typeof PROJECT_TYPES[number]
export type Industry = typeof INDUSTRIES[number]