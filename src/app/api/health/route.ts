import { apiResponse } from '@/lib/api/responses'
import { Features } from '@/lib/features'
import { handleApiError } from '@/lib/core/error-manager'
import { withPipeline, loggingMiddleware, corsMiddleware, AuthenticatedRequest } from '@/lib/core/pipeline'
import { logger } from '@/lib/core/logging-service'

async function healthHandler(req: AuthenticatedRequest) {
  return apiResponse.success({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'OneDesigner API is running',
    requestId: req.context?.requestId,
    features: {
      dataService: Features.USE_NEW_DATA_SERVICE,
      errorManager: Features.USE_ERROR_MANAGER,
      authMiddleware: Features.USE_AUTH_MIDDLEWARE,
      requestPipeline: Features.USE_REQUEST_PIPELINE
    }
  })
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

  // Legacy implementation
  try {
    return apiResponse.success({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'OneDesigner API is running',
      features: {
        dataService: Features.USE_NEW_DATA_SERVICE,
        errorManager: Features.USE_ERROR_MANAGER,
        authMiddleware: Features.USE_AUTH_MIDDLEWARE,
        requestPipeline: Features.USE_REQUEST_PIPELINE
      }
    })
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