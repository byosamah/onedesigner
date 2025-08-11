/**
 * Configuration initialization for OneDesigner
 * This file sets up the centralized configuration system
 */

import { initConfig, DEFAULT_SCHEMA, ConfigSchema } from '@/lib/core/config-manager'
import { logger } from '@/lib/core/logging-service'

// Extended schema for OneDesigner-specific configuration
export const ONEDESIGNER_CONFIG_SCHEMA: ConfigSchema = {
  ...DEFAULT_SCHEMA,

  // Matching Configuration
  'matching.ai.provider': {
    type: 'string',
    default: 'deepseek',
    validator: (value) => ['deepseek', 'openai', 'anthropic'].includes(value),
    description: 'AI provider for matching'
  },
  'matching.ai.model': {
    type: 'string',
    default: 'deepseek-chat',
    description: 'AI model to use for matching'
  },
  'matching.ai.temperature': {
    type: 'number',
    default: 0.1,
    validator: (value) => value >= 0 && value <= 1,
    description: 'AI temperature for matching (0-1)'
  },
  'matching.score.min': {
    type: 'number',
    default: 50,
    validator: (value) => value >= 0 && value <= 100,
    description: 'Minimum match score (0-100)'
  },
  'matching.score.threshold': {
    type: 'number',
    default: 85,
    validator: (value) => value >= 0 && value <= 100,
    description: 'High-quality match threshold (0-100)'
  },
  'matching.designers.limit': {
    type: 'number',
    default: 5,
    description: 'Maximum designers to analyze per match'
  },

  // Payment Configuration
  'payment.packages.starter.price': {
    type: 'number',
    default: 5,
    description: 'Starter package price in USD'
  },
  'payment.packages.starter.credits': {
    type: 'number',
    default: 3,
    description: 'Starter package credits'
  },
  'payment.packages.growth.price': {
    type: 'number',
    default: 15,
    description: 'Growth package price in USD'
  },
  'payment.packages.growth.credits': {
    type: 'number',
    default: 10,
    description: 'Growth package credits'
  },
  'payment.packages.scale.price': {
    type: 'number',
    default: 30,
    description: 'Scale package price in USD'
  },
  'payment.packages.scale.credits': {
    type: 'number',
    default: 25,
    description: 'Scale package credits'
  },

  // Email Configuration
  'email.from': {
    type: 'string',
    default: 'magic@onedesigner.app',
    env: 'EMAIL_FROM',
    description: 'Default from email address'
  },
  'email.templates.otp.expiry': {
    type: 'number',
    default: 300, // 5 minutes
    description: 'OTP expiry time in seconds'
  },

  // Business Rules
  'features.businessRules': {
    type: 'boolean',
    default: false,
    env: 'USE_BUSINESS_RULES',
    description: 'Enable centralized business rules'
  },
  'business.designer.approval.required': {
    type: 'boolean',
    default: true,
    description: 'Require admin approval for designers'
  },
  'business.designer.request.expiry': {
    type: 'number',
    default: 604800, // 7 days
    description: 'Designer request expiry in seconds'
  },
  'business.match.expiry': {
    type: 'number',
    default: 604800, // 7 days
    description: 'Match expiry in seconds'
  },

  // Performance Configuration
  'performance.matching.phases': {
    type: 'number',
    default: 3,
    validator: (value) => value >= 1 && value <= 5,
    description: 'Number of matching phases (1-5)'
  },
  'performance.embedding.cache.ttl': {
    type: 'number',
    default: 3600000, // 1 hour
    description: 'Embedding cache TTL in milliseconds'
  },
  'performance.database.pool.size': {
    type: 'number',
    default: 10,
    description: 'Database connection pool size'
  },

  // Security Configuration
  'security.session.expiry': {
    type: 'number',
    default: 2592000, // 30 days
    description: 'Session expiry in seconds'
  },
  'security.otp.length': {
    type: 'number',
    default: 6,
    validator: (value) => value >= 4 && value <= 8,
    description: 'OTP code length (4-8 digits)'
  },
  'security.password.minLength': {
    type: 'number',
    default: 8,
    description: 'Minimum password length'
  },

  // API Configuration
  'api.timeout': {
    type: 'number',
    default: 30000, // 30 seconds
    description: 'API request timeout in milliseconds'
  },
  'api.retries': {
    type: 'number',
    default: 3,
    description: 'Number of API request retries'
  }
}

let configInitialized = false

/**
 * Initialize OneDesigner configuration
 */
export async function initOneDesignerConfig() {
  if (configInitialized) {
    return
  }

  try {
    logger.info('🚀 Initializing OneDesigner configuration...')
    
    await initConfig(ONEDESIGNER_CONFIG_SCHEMA)
    
    configInitialized = true
    logger.info('✅ OneDesigner configuration initialized successfully')
    
    // Log non-sensitive configuration in development
    if (process.env.NODE_ENV === 'development') {
      const config = await import('@/lib/core/config-manager')
      const configManager = config.getConfig()
      const allConfig = configManager.getAll(false) // Don't include sensitive
      
      logger.info('🔧 Configuration values (non-sensitive):')
      console.table(allConfig)
    }
    
  } catch (error) {
    logger.error('❌ Failed to initialize configuration:', error)
    throw error
  }
}

/**
 * Check if configuration is initialized
 */
export function isConfigInitialized(): boolean {
  return configInitialized
}

/**
 * Get configuration value with OneDesigner-specific validation
 */
export function getOneDesignerConfig<T = any>(key: string, defaultValue?: T): T {
  if (!configInitialized) {
    logger.warn('⚠️ Configuration not initialized, using environment fallback for:', key)
    
    // Fallback to environment variable
    const envKey = key.toUpperCase().replace(/[.-]/g, '_')
    const envValue = process.env[envKey]
    
    if (envValue !== undefined) {
      return envValue as any as T
    }
    
    return defaultValue as T
  }

  const { config } = require('@/lib/core/config-manager')
  return config<T>(key, defaultValue)
}

/**
 * Initialize configuration with error handling for Next.js
 */
export async function safeInitConfig() {
  try {
    await initOneDesignerConfig()
  } catch (error) {
    logger.error('Configuration initialization failed, using environment fallbacks')
    // Don't throw in production to prevent app crashes
    if (process.env.NODE_ENV === 'development') {
      throw error
    }
  }
}