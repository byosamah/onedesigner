import { apiResponse } from '@/lib/api/responses'
import { Features } from '@/lib/features'
import { handleApiError } from '@/lib/core/error-manager'
import { withPipeline, loggingMiddleware, corsMiddleware, AuthenticatedRequest } from '@/lib/core/pipeline'
import { logger } from '@/lib/core/logging-service'

/**
 * Build standardized health check response
 * Extracts duplicate logic into single source of truth
 * @param requestId Optional request correlation ID from pipeline context
 */
function buildHealthResponse(requestId?: string) {
  const featureStatuses = {
    dataService: Features.USE_NEW_DATA_SERVICE,
    errorManager: Features.USE_ERROR_MANAGER,
    authMiddleware: Features.USE_AUTH_MIDDLEWARE,
    requestPipeline: Features.USE_REQUEST_PIPELINE
  }

  const serviceStatuses = {
    dataService: Features.USE_NEW_DATA_SERVICE ? 'active' : 'inactive',
    errorManager: Features.USE_ERROR_MANAGER ? 'active' : 'inactive',
    requestPipeline: Features.USE_REQUEST_PIPELINE ? 'active' : 'inactive',
    configManager: Features.USE_CONFIG_MANAGER ? 'active' : 'inactive',
    businessRules: Features.USE_BUSINESS_RULES ? 'active' : 'inactive',
    loggingService: Features.USE_CENTRALIZED_LOGGING ? 'active' : 'inactive',
    otpService: Features.USE_OTP_SERVICE ? 'active' : 'inactive',
    emailService: Features.USE_EMAIL_SERVICE ? 'active' : 'inactive'
  }

  return {
    status: 'OK' as const,
    timestamp: new Date().toISOString(),
    message: 'OneDesigner API is running',
    ...(requestId && { requestId }),
    features: featureStatuses,
    services: serviceStatuses
  }
}

async function healthHandler(req: AuthenticatedRequest) {
  return apiResponse.success(buildHealthResponse(req.context?.requestId))
}

export async function GET(request: any, context?: any) {
  // Use new RequestPipeline if feature flag is enabled
  if (Features.USE_REQUEST_PIPELINE) {
    logger.info('✨ Using new RequestPipeline for health check')
    return withPipeline(
      healthHandler,
      [
        { name: 'cors', middleware: corsMiddleware() },
        { name: 'logging', middleware: loggingMiddleware({ excludePaths: [] }) }
      ],
      { enableLogging: true }
    )(request, context)
  }

  // Legacy implementation (preserved for backward compatibility)
  try {
    // Now uses the same helper function for consistency
    return apiResponse.success(buildHealthResponse())
  } catch (error) {
    // Use new ErrorManager if feature flag is enabled
    if (Features.USE_ERROR_MANAGER) {
      return handleApiError(error, 'health', {
        operation: 'health_check'
      })
    }
    
    // Legacy error handling (simple for health check)
    return apiResponse.error('Health check failed')
  }
}