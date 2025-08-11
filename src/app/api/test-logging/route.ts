import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api/responses'
import { logger } from '@/lib/core/logging-service'
import { Features } from '@/lib/features'

export async function GET(request: NextRequest) {
  try {
    // Set correlation ID
    const correlationId = logger.setCorrelationId()
    
    // Test different log levels
    logger.debug('Debug message test', { level: 'debug' })
    logger.info('Info message test', { level: 'info' })
    logger.warn('Warning message test', { level: 'warn' })
    logger.error('Error message test', new Error('Test error'), { level: 'error' })
    
    // Test user context
    logger.setUserContext('test-user-123', 'client')
    logger.info('Message with user context')
    
    // Test performance timing
    logger.startTimer('test-operation')
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 100))
    const duration = logger.endTimer('test-operation', 'Test operation completed')
    
    // Test sensitive data redaction
    logger.info('Testing sensitive data', {
      password: 'secret123',
      token: 'abc-def-ghi',
      normal: 'visible data'
    })
    
    // Clear context
    logger.clearContext()
    
    return apiResponse.success({
      message: 'LoggingService test completed',
      correlationId,
      duration,
      featureEnabled: Features.USE_CENTRALIZED_LOGGING || false,
      tests: {
        levels: 'completed',
        userContext: 'completed',
        performance: 'completed',
        sanitization: 'completed'
      }
    })
  } catch (error) {
    logger.error('Test logging failed', error)
    return apiResponse.error('Failed to test logging')
  }
}