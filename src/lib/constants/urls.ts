/**
 * Centralized URL Configuration
 * All hardcoded URLs should be managed through this file
 */

// Environment-aware URL building
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location.origin
    return window.location.origin
  }
  
  // Server-side: use environment variable or fallback
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://onedesigner.app'
}

// Production URLs (environment configurable)
export const PRODUCTION_URLS = {
  APP: {
    BASE: process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app',
    WWW: 'https://www.onedesigner.app',
    DYNAMIC: getBaseUrl()
  },
  API: {
    RESEND: process.env.RESEND_API_URL || 'https://api.resend.com/emails',
    LEMONSQUEEZY: process.env.LEMONSQUEEZY_API_URL || 'https://api.lemonsqueezy.com/v1',
    DEEPSEEK: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'
  }
} as const

// Page URLs - environment aware
export const PAGE_URLS = {
  // Authentication
  CLIENT: {
    LOGIN: '/client/login',
    SIGNUP: '/client/signup',
    VERIFY: '/client/signup/verify',
    DASHBOARD: '/client/dashboard',
    CONVERSATIONS: '/client/conversations'
  },
  DESIGNER: {
    LOGIN: '/designer/login',
    SIGNUP: '/designer/signup',
    VERIFY: '/designer/signup/verify',
    APPLY: '/designer/apply',
    DASHBOARD: '/designer/dashboard',
    REQUESTS: '/designer/requests',
    UPDATE_APPLICATION: '/designer/update-application'
  },
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    DESIGNERS: '/admin/designers'
  },
  
  // Public pages
  PUBLIC: {
    HOME: '/',
    BRIEF: '/brief',
    CONTACT: '/contact',
    HELP: '/help',
    BLOG: '/blog',
    BLOG_ADMIN: '/blog/admin'
  },
  
  // Match pages
  MATCH: {
    BASE: '/match',
    DYNAMIC: (briefId: string) => `/match/${briefId}`
  }
} as const

// Full URL builders (with domain)
export const FULL_URLS = {
  // Authentication URLs
  CLIENT: {
    LOGIN: () => `${getBaseUrl()}${PAGE_URLS.CLIENT.LOGIN}`,
    DASHBOARD: () => `${getBaseUrl()}${PAGE_URLS.CLIENT.DASHBOARD}`,
    VERIFY: () => `${getBaseUrl()}${PAGE_URLS.CLIENT.VERIFY}`
  },
  DESIGNER: {
    LOGIN: () => `${getBaseUrl()}${PAGE_URLS.DESIGNER.LOGIN}`,
    DASHBOARD: () => `${getBaseUrl()}${PAGE_URLS.DESIGNER.DASHBOARD}`,
    REQUESTS: () => `${getBaseUrl()}${PAGE_URLS.DESIGNER.REQUESTS}`,
    UPDATE_APPLICATION: (token?: string) => 
      `${getBaseUrl()}${PAGE_URLS.DESIGNER.UPDATE_APPLICATION}${token ? `?token=${token}` : ''}`
  },
  
  // Public URLs
  PUBLIC: {
    CONTACT: () => `${getBaseUrl()}${PAGE_URLS.PUBLIC.CONTACT}`,
    HELP: () => `${getBaseUrl()}${PAGE_URLS.PUBLIC.HELP}`,
    HOME: () => `${getBaseUrl()}${PAGE_URLS.PUBLIC.HOME}`
  },
  
  // Match URLs
  MATCH: {
    VIEW: (briefId: string) => `${getBaseUrl()}${PAGE_URLS.MATCH.DYNAMIC(briefId)}`
  }
} as const

// External service URLs
export const EXTERNAL_URLS = {
  SUPABASE: {
    DASHBOARD: `https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || 'frwchtwxpnrlpzksupgm'}`,
    SQL_EDITOR: `https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || 'frwchtwxpnrlpzksupgm'}/sql/new`
  },
  SOCIAL: {
    TWITTER: 'https://twitter.com/onedesigner',
    LINKEDIN: 'https://linkedin.com/company/onedesigner'
  },
  PLACEHOLDER: {
    UNSPLASH_DESIGNER: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    UNSPLASH_PROJECT: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
    UI_AVATARS: (name: string, size = 200, background = 'e9c46a') => 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&size=${size}&bold=true`
  }
} as const

// Development URLs (for testing)
export const DEV_URLS = {
  LOCAL: {
    BASE: 'http://localhost:3000',
    ALT_PORT: 'http://localhost:3001',
    API_BASE: (port = 3000) => `http://localhost:${port}/api`
  },
  VERCEL_DEPLOYMENTS: {
    // Common Vercel deployment patterns
    PREVIEW: (hash: string) => `https://onedesigner2-${hash}-onedesigners-projects.vercel.app`,
    STAGING: 'https://onedesigner-staging.vercel.app'
  }
} as const

// Email-specific URLs (for templates)
export const EMAIL_URLS = {
  SENDER: {
    DEFAULT: process.env.EMAIL_FROM || 'Hala from OneDesigner <team@onedesigner.app>',
    SUPPORT: 'OneDesigner Support <support@onedesigner.app>',
    NOREPLY: 'OneDesigner <noreply@onedesigner.app>'
  },
  UNSUBSCRIBE: {
    BASE: () => `${getBaseUrl()}/unsubscribe`,
    DYNAMIC: (token: string) => `${getBaseUrl()}/unsubscribe?token=${token}`
  },
  FOOTER_LINKS: {
    WEBSITE: () => getBaseUrl(),
    CONTACT: () => FULL_URLS.PUBLIC.CONTACT(),
    HELP: () => FULL_URLS.PUBLIC.HELP()
  }
} as const

// API Route URLs (internal)
export const API_ROUTES = {
  AUTH: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp'
  },
  CLIENT: {
    MATCHES: '/api/client/matches',
    UNLOCK: (matchId: string) => `/api/client/matches/${matchId}/unlock`,
    CONTACT: (matchId: string) => `/api/client/matches/${matchId}/contact`
  },
  DESIGNER: {
    APPLY: '/api/designer/apply',
    REQUESTS: '/api/designer/project-requests',
    RESPOND: (requestId: string) => `/api/designer/project-requests/${requestId}/respond`
  },
  ADMIN: {
    DESIGNERS: '/api/admin/designers',
    APPROVE: (designerId: string) => `/api/admin/designers/${designerId}/approve`
  },
  WEBHOOKS: {
    LEMONSQUEEZY: '/api/webhooks/lemonsqueezy'
  },
  HEALTH: '/api/health',
  TEST: {
    DIRECT_DB: '/api/test-direct-db',
    MATCH: '/api/test-match'
  }
} as const

// Utility functions for URL building
export const urlBuilders = {
  /**
   * Build a full URL for the current environment
   */
  buildUrl: (path: string, params?: Record<string, string>) => {
    const baseUrl = getBaseUrl()
    const url = new URL(path, baseUrl)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    
    return url.toString()
  },
  
  /**
   * Build API URL for current environment
   */
  buildApiUrl: (endpoint: string) => {
    return `${getBaseUrl()}${endpoint}`
  },
  
  /**
   * Get current environment type
   */
  getEnvironment: () => {
    const baseUrl = getBaseUrl()
    if (baseUrl.includes('localhost')) return 'development'
    if (baseUrl.includes('vercel.app')) return 'preview'
    return 'production'
  }
}

// Type exports for type safety
export type ProductionUrls = typeof PRODUCTION_URLS
export type PageUrls = typeof PAGE_URLS
export type FullUrls = typeof FULL_URLS
export type ExternalUrls = typeof EXTERNAL_URLS
export type DevUrls = typeof DEV_URLS
export type EmailUrls = typeof EMAIL_URLS
export type ApiRoutes = typeof API_ROUTES