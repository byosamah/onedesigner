import { apiResponse } from '@/lib/api/responses'
import { Features } from '@/lib/features'
import { DataService } from '@/lib/services/data-service'
import { 
import { logger } from '@/lib/core/logging-service'
  withPipeline, 
  createAuthenticatedPipeline, 
  AuthenticatedRequest,
  rateLimitMiddleware 
} from '@/lib/core/pipeline'

// Handler using pipeline
async function getClientProfileHandler(req: AuthenticatedRequest) {
  if (!req.clientId) {
    return apiResponse.error('Client ID not found in session')
  }

  if (Features.USE_NEW_DATA_SERVICE) {
    const dataService = DataService.getInstance()
    const client = await dataService.getClientWithCredits(req.clientId)
    
    return apiResponse.success({
      id: client.id,
      email: client.email,
      credits: client.match_credits,
      requestId: req.context?.requestId,
      rateLimitRemaining: req.rateLimitInfo?.remaining
    })
  }

  // Legacy data fetching would go here
  return apiResponse.success({
    id: req.clientId,
    message: 'Legacy data service not implemented',
    requestId: req.context?.requestId
  })
}

export async function GET(request: any, context?: any) {
  // Use new RequestPipeline if feature flag is enabled
  if (Features.USE_REQUEST_PIPELINE) {
    logger.info('✨ Using new RequestPipeline with authentication for client profile')
    
    // Create authenticated pipeline with rate limiting
    const pipeline = createAuthenticatedPipeline('client', {
      enableRateLimit: true,
      enableLogging: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // 100 requests per window per client
      }
    })

    return pipeline.execute(request, getClientProfileHandler, context)
  }

  // Legacy implementation with manual session checking
  return apiResponse.error('Legacy client profile endpoint not implemented')
}