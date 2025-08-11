import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api/responses'
import { Features } from '@/lib/features'
import { getOneDesignerConfig, isConfigInitialized, safeInitConfig } from '@/lib/config/init'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    // Initialize config if not already initialized
    if (!isConfigInitialized()) {
      await safeInitConfig()
    }

    // Use ConfigManager if enabled
    if (Features.USE_CONFIG_MANAGER) {
      logger.info('✨ Using ConfigManager for configuration endpoint')
      
      const { getConfig } = await import('@/lib/core/config-manager')
      const configManager = getConfig()
      
      // Get all non-sensitive configuration
      const allConfig = configManager.getAll(false)
      
      // Get some metadata for demonstration
      const metadata = {
        'app.name': configManager.getMetadata('app.name'),
        'app.environment': configManager.getMetadata('app.environment'),
        'features.dataService': configManager.getMetadata('features.dataService')
      }

      return apiResponse.success({
        message: 'Configuration loaded via ConfigManager',
        configManager: {
          isLoaded: configManager.isLoaded(),
          totalValues: Object.keys(allConfig).length
        },
        configuration: allConfig,
        sampleMetadata: metadata,
        features: {
          dataService: Features.USE_NEW_DATA_SERVICE,
          errorManager: Features.USE_ERROR_MANAGER,
          requestPipeline: Features.USE_REQUEST_PIPELINE,
          configManager: Features.USE_CONFIG_MANAGER,
          queryCache: Features.ENABLE_QUERY_CACHE,
          monitoring: Features.ENABLE_MONITORING
        }
      })
    }

    // Legacy configuration display
    return apiResponse.success({
      message: 'Configuration loaded via environment variables (legacy)',
      configuration: {
        'app.environment': process.env.NODE_ENV || 'development',
        'app.url': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'database.url': process.env.NEXT_PUBLIC_SUPABASE_URL ? '[CONFIGURED]' : '[MISSING]',
        'api.deepseek.key': process.env.DEEPSEEK_API_KEY ? '[CONFIGURED]' : '[MISSING]'
      },
      features: {
        dataService: Features.USE_NEW_DATA_SERVICE,
        errorManager: Features.USE_ERROR_MANAGER,
        requestPipeline: Features.USE_REQUEST_PIPELINE,
        configManager: Features.USE_CONFIG_MANAGER
      }
    })

  } catch (error) {
    logger.error('Configuration endpoint error:', error)
    return apiResponse.error('Failed to load configuration')
  }
}

// POST endpoint to update configuration (admin only in production)
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return apiResponse.error('Configuration updates not allowed in production via API')
    }

    if (!Features.USE_CONFIG_MANAGER) {
      return apiResponse.error('ConfigManager not enabled')
    }

    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return apiResponse.error('Key and value are required')
    }

    const { getConfig, ConfigSource } = await import('@/lib/core/config-manager')
    const configManager = getConfig()

    // Update configuration
    configManager.set(key, value, ConfigSource.DEFAULT)

    return apiResponse.success({
      message: `Configuration '${key}' updated successfully`,
      key,
      value,
      metadata: configManager.getMetadata(key)
    })

  } catch (error) {
    logger.error('Configuration update error:', error)
    return apiResponse.error('Failed to update configuration')
  }
}