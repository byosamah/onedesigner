import { logger } from '@/lib/core/logging-service'

/**
 * Retry helper for AI operations
 * Implements exponential backoff with configurable retries
 */
export class RetryHelper {
  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @param options Retry options
   * @returns Result from the function
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number
      initialDelay?: number
      maxDelay?: number
      backoffMultiplier?: number
      retryCondition?: (error: any) => boolean
      onRetry?: (attempt: number, error: any) => void
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      retryCondition = () => true,
      onRetry
    } = options

    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        // Check if we should retry
        if (!retryCondition(error)) {
          throw error
        }
        
        // If this was the last attempt, throw
        if (attempt === maxRetries) {
          logger.error(`Failed after ${maxRetries} attempts:`, error)
          throw error
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay
        )
        
        logger.info(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`)
        
        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(attempt, error)
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  /**
   * Check if an error is retryable
   * @param error The error to check
   * @returns Whether the error is retryable
   */
  static isRetryableError(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ETIMEDOUT') {
      return true
    }
    
    // HTTP status codes that are retryable
    if (error.status === 429 || // Rate limit
        error.status === 502 || // Bad Gateway
        error.status === 503 || // Service Unavailable
        error.status === 504) { // Gateway Timeout
      return true
    }
    
    // AI service specific errors
    if (error.message?.includes('timeout') ||
        error.message?.includes('temporarily unavailable') ||
        error.message?.includes('rate limit')) {
      return true
    }
    
    return false
  }
}