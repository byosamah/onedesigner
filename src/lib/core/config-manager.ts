import { logger } from '@/lib/core/logging-service'

/**
 * Configuration Manager for centralized configuration handling
 * Supports environment variables, database settings, file-based config, and defaults
 */

// Configuration source types
export enum ConfigSource {
  ENVIRONMENT = 'environment',
  DATABASE = 'database', 
  FILE = 'file',
  DEFAULT = 'default'
}

// Configuration value with metadata
export interface ConfigValue<T = any> {
  value: T
  source: ConfigSource
  lastUpdated: Date
  isRequired?: boolean
  validator?: (value: T) => boolean
  description?: string
}

// Configuration schema definition
export interface ConfigSchema {
  [key: string]: {
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
    default?: any
    validator?: (value: any) => boolean
    description?: string
    env?: string // Environment variable name
    sensitive?: boolean // Mark as sensitive (won't be logged)
  }
}

// Configuration change event
export interface ConfigChangeEvent {
  key: string
  oldValue: any
  newValue: any
  source: ConfigSource
  timestamp: Date
}

// Configuration listener
export type ConfigChangeListener = (event: ConfigChangeEvent) => void

/**
 * Centralized Configuration Manager
 */
export class ConfigManager {
  private static instance: ConfigManager
  private config = new Map<string, ConfigValue>()
  private listeners = new Map<string, ConfigChangeListener[]>()
  private schema = new Map<string, ConfigSchema[string]>()
  private loaded = false

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!this.instance) {
      this.instance = new ConfigManager()
    }
    return this.instance
  }

  /**
   * Load configuration from all sources
   */
  async load(schema?: ConfigSchema): Promise<void> {
    if (schema) {
      this.setSchema(schema)
    }

    logger.info('🔧 ConfigManager: Loading configuration...')

    // Load in priority order: defaults -> files -> environment -> database
    await this.loadDefaults()
    await this.loadFromFiles()
    await this.loadFromEnvironment()
    await this.loadFromDatabase()

    this.loaded = true
    logger.info(`✅ ConfigManager: Loaded ${this.config.size} configuration values`)

    // Validate all required values are present
    this.validateRequired()
  }

  /**
   * Set configuration schema
   */
  setSchema(schema: ConfigSchema): void {
    for (const [key, definition] of Object.entries(schema)) {
      this.schema.set(key, definition)
    }
  }

  /**
   * Get configuration value
   */
  get<T = any>(key: string, defaultValue?: T): T {
    const configValue = this.config.get(key)
    
    if (configValue !== undefined) {
      return configValue.value as T
    }

    if (defaultValue !== undefined) {
      return defaultValue
    }

    const schemaDef = this.schema.get(key)
    if (schemaDef?.default !== undefined) {
      return schemaDef.default as T
    }

    return undefined as T
  }

  /**
   * Get required configuration value (throws if missing)
   */
  getRequired<T = any>(key: string): T {
    const value = this.get<T>(key)
    
    if (value === undefined || value === null) {
      throw new Error(`Required configuration missing: ${key}`)
    }

    return value
  }

  /**
   * Set configuration value
   */
  set<T = any>(key: string, value: T, source: ConfigSource = ConfigSource.DEFAULT): void {
    const oldValue = this.get(key)
    
    // Validate if validator exists
    const schemaDef = this.schema.get(key)
    if (schemaDef?.validator && !schemaDef.validator(value)) {
      throw new Error(`Configuration value for '${key}' failed validation`)
    }

    // Type checking
    if (schemaDef?.type) {
      this.validateType(key, value, schemaDef.type)
    }

    const configValue: ConfigValue<T> = {
      value,
      source,
      lastUpdated: new Date(),
      isRequired: schemaDef?.required,
      validator: schemaDef?.validator,
      description: schemaDef?.description
    }

    this.config.set(key, configValue)

    // Notify listeners
    this.notifyChange({
      key,
      oldValue,
      newValue: value,
      source,
      timestamp: new Date()
    })

    // Log change (unless sensitive)
    if (!schemaDef?.sensitive) {
      logger.info(`🔧 ConfigManager: Updated '${key}' = ${JSON.stringify(value)} (${source})`)
    } else {
      logger.info(`🔧 ConfigManager: Updated '${key}' = [REDACTED] (${source})`)
    }
  }

  /**
   * Get all configuration values
   */
  getAll(includeSensitive = false): Record<string, any> {
    const result: Record<string, any> = {}
    
    for (const [key, configValue] of this.config.entries()) {
      const schemaDef = this.schema.get(key)
      
      if (schemaDef?.sensitive && !includeSensitive) {
        result[key] = '[REDACTED]'
      } else {
        result[key] = configValue.value
      }
    }

    return result
  }

  /**
   * Get configuration metadata
   */
  getMetadata(key: string): ConfigValue | undefined {
    return this.config.get(key)
  }

  /**
   * Check if configuration is loaded
   */
  isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Reload configuration
   */
  async reload(): Promise<void> {
    logger.info('🔄 ConfigManager: Reloading configuration...')
    this.config.clear()
    this.loaded = false
    await this.load()
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(key: string, listener: ConfigChangeListener): void {
    const listeners = this.listeners.get(key) || []
    listeners.push(listener)
    this.listeners.set(key, listeners)
  }

  /**
   * Unsubscribe from configuration changes
   */
  unsubscribe(key: string, listener: ConfigChangeListener): void {
    const listeners = this.listeners.get(key) || []
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
      this.listeners.set(key, listeners)
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Load default values from schema
   */
  private async loadDefaults(): Promise<void> {
    for (const [key, definition] of this.schema.entries()) {
      if (definition.default !== undefined) {
        this.set(key, definition.default, ConfigSource.DEFAULT)
      }
    }
  }

  /**
   * Load configuration from files
   */
  private async loadFromFiles(): Promise<void> {
    try {
      // Try to load from config.json
      const configPath = process.env.CONFIG_FILE || 'config.json'
      
      if (typeof window === 'undefined') { // Server-side only
        const fs = await import('fs')
        const path = await import('path')
        
        const fullPath = path.resolve(process.cwd(), configPath)
        
        if (fs.existsSync(fullPath)) {
          const fileContent = fs.readFileSync(fullPath, 'utf8')
          const fileConfig = JSON.parse(fileContent)
          
          for (const [key, value] of Object.entries(fileConfig)) {
            this.set(key, value, ConfigSource.FILE)
          }
          
          logger.info(`📄 ConfigManager: Loaded configuration from ${configPath}`)
        }
      }
    } catch (error) {
      logger.warn('⚠️ ConfigManager: Failed to load file configuration:', error)
    }
  }

  /**
   * Load configuration from environment variables
   */
  private async loadFromEnvironment(): Promise<void> {
    // Load from process.env based on schema
    for (const [key, definition] of this.schema.entries()) {
      const envVar = definition.env || key.toUpperCase().replace(/[.-]/g, '_')
      const envValue = process.env[envVar]
      
      if (envValue !== undefined) {
        const parsedValue = this.parseEnvironmentValue(envValue, definition.type)
        this.set(key, parsedValue, ConfigSource.ENVIRONMENT)
      }
    }

    // Also load any NEXT_PUBLIC_ variables
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('ONEDESIGNER_')) {
        const configKey = key.toLowerCase().replace(/_/g, '.')
        if (!this.config.has(configKey)) {
          this.set(configKey, value, ConfigSource.ENVIRONMENT)
        }
      }
    }
  }

  /**
   * Load configuration from database
   */
  private async loadFromDatabase(): Promise<void> {
    try {
      // Only load from database if we have a connection
      if (typeof window === 'undefined' && this.get('database.url')) {
        // This would typically connect to a config table
        // For now, we'll skip this to avoid circular dependencies
        logger.info('📊 ConfigManager: Database configuration loading skipped (not implemented)')
      }
    } catch (error) {
      logger.warn('⚠️ ConfigManager: Failed to load database configuration:', error)
    }
  }

  /**
   * Parse environment variable value based on type
   */
  private parseEnvironmentValue(value: string, type?: string): any {
    if (!type) return value

    switch (type) {
      case 'boolean':
        return value.toLowerCase() === 'true'
      case 'number':
        const num = Number(value)
        if (isNaN(num)) throw new Error(`Invalid number: ${value}`)
        return num
      case 'array':
        return value.split(',').map(item => item.trim())
      case 'object':
        try {
          return JSON.parse(value)
        } catch {
          throw new Error(`Invalid JSON object: ${value}`)
        }
      default:
        return value
    }
  }

  /**
   * Validate configuration type
   */
  private validateType(key: string, value: any, expectedType: string): void {
    const actualType = Array.isArray(value) ? 'array' : typeof value

    if (actualType !== expectedType) {
      throw new Error(`Configuration '${key}' expected ${expectedType}, got ${actualType}`)
    }
  }

  /**
   * Validate all required configuration values are present
   */
  private validateRequired(): void {
    const missing: string[] = []

    for (const [key, definition] of this.schema.entries()) {
      if (definition.required) {
        const value = this.get(key)
        if (value === undefined || value === null) {
          missing.push(key)
        }
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`)
    }
  }

  /**
   * Notify configuration change listeners
   */
  private notifyChange(event: ConfigChangeEvent): void {
    const listeners = this.listeners.get(event.key) || []
    for (const listener of listeners) {
      try {
        listener(event)
      } catch (error) {
        logger.error(`ConfigManager listener error for '${event.key}':`, error)
      }
    }
  }
}

// ==================== DEFAULT CONFIGURATION SCHEMA ====================

export const DEFAULT_SCHEMA: ConfigSchema = {
  // Application settings
  'app.name': {
    type: 'string',
    default: 'OneDesigner',
    description: 'Application name'
  },
  'app.version': {
    type: 'string',
    default: '1.0.0',
    description: 'Application version'
  },
  'app.environment': {
    type: 'string',
    default: 'development',
    validator: (value) => ['development', 'staging', 'production'].includes(value),
    description: 'Application environment'
  },
  'app.url': {
    type: 'string',
    required: true,
    env: 'NEXT_PUBLIC_APP_URL',
    description: 'Application base URL'
  },

  // Database configuration
  'database.url': {
    type: 'string',
    required: true,
    env: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Database connection URL'
  },
  'database.key': {
    type: 'string',
    required: true,
    sensitive: true,
    env: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Database public key'
  },
  'database.service.key': {
    type: 'string',
    required: true,
    sensitive: true,
    env: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Database service role key'
  },

  // API Keys
  'api.deepseek.key': {
    type: 'string',
    required: true,
    sensitive: true,
    env: 'DEEPSEEK_API_KEY',
    description: 'DeepSeek AI API key'
  },
  'api.lemonsqueezy.key': {
    type: 'string',
    required: true,
    sensitive: true,
    env: 'LEMONSQUEEZY_API_KEY',
    description: 'LemonSqueezy payment API key'
  },
  'api.resend.key': {
    type: 'string',
    required: true,
    sensitive: true,
    env: 'RESEND_API_KEY',
    description: 'Resend email API key'
  },

  // Authentication
  'auth.secret': {
    type: 'string',
    required: true,
    sensitive: true,
    env: 'NEXTAUTH_SECRET',
    description: 'NextAuth secret key'
  },
  'auth.url': {
    type: 'string',
    env: 'NEXTAUTH_URL',
    description: 'NextAuth URL'
  },

  // Security
  'security.cron.secret': {
    type: 'string',
    required: true,
    sensitive: true,
    env: 'CRON_SECRET',
    description: 'Cron job secret for API protection'
  },

  // Feature Flags
  'features.dataService': {
    type: 'boolean',
    default: false,
    env: 'USE_NEW_DATA_SERVICE',
    description: 'Enable new DataService'
  },
  'features.errorManager': {
    type: 'boolean',
    default: false,
    env: 'USE_ERROR_MANAGER',
    description: 'Enable ErrorManager'
  },
  'features.requestPipeline': {
    type: 'boolean',
    default: false,
    env: 'USE_REQUEST_PIPELINE',
    description: 'Enable RequestPipeline'
  },

  // Performance
  'cache.ttl': {
    type: 'number',
    default: 300000, // 5 minutes
    description: 'Default cache TTL in milliseconds'
  },
  'cache.enabled': {
    type: 'boolean',
    default: true,
    env: 'ENABLE_QUERY_CACHE',
    description: 'Enable query caching'
  },

  // Monitoring
  'monitoring.enabled': {
    type: 'boolean',
    default: false,
    env: 'ENABLE_MONITORING',
    description: 'Enable monitoring'
  },
  'logging.level': {
    type: 'string',
    default: 'info',
    validator: (value) => ['debug', 'info', 'warn', 'error'].includes(value),
    description: 'Logging level'
  },

  // Rate limiting
  'rateLimit.window': {
    type: 'number',
    default: 900000, // 15 minutes
    description: 'Rate limit window in milliseconds'
  },
  'rateLimit.max': {
    type: 'number',
    default: 100,
    description: 'Max requests per window'
  }
}

// ==================== CONVENIENCE FUNCTIONS ====================

let configManager: ConfigManager | null = null

/**
 * Initialize configuration manager
 */
export async function initConfig(schema: ConfigSchema = DEFAULT_SCHEMA): Promise<ConfigManager> {
  configManager = ConfigManager.getInstance()
  await configManager.load(schema)
  return configManager
}

/**
 * Get configuration instance (must be initialized first)
 */
export function getConfig(): ConfigManager {
  if (!configManager) {
    throw new Error('Configuration not initialized. Call initConfig() first.')
  }
  return configManager
}

/**
 * Get configuration value (convenience function)
 */
export function config<T = any>(key: string, defaultValue?: T): T {
  return getConfig().get<T>(key, defaultValue)
}

/**
 * Get required configuration value (convenience function)
 */
export function configRequired<T = any>(key: string): T {
  return getConfig().getRequired<T>(key)
}