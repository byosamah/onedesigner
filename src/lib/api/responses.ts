import { NextResponse } from 'next/server'
import { logger } from '@/lib/core/logging-service'

/**
 * Centralized API response utilities for consistent response formatting
 * All responses maintain backward compatibility with existing client code
 */

interface SuccessResponse<T = any> {
  data?: T
  message?: string
  [key: string]: any
}

interface ErrorResponse {
  error: string
  details?: any
  code?: string
  [key: string]: any
}

export const apiResponse = {
  /**
   * Success response
   * @param data - Response data (can be any type)
   * @param status - HTTP status code (default: 200)
   */
  success: <T = any>(data: T, status = 200) => {
    return NextResponse.json(data, { status })
  },

  /**
   * Success response with message
   * @param data - Response data
   * @param message - Success message
   * @param status - HTTP status code (default: 200)
   */
  successWithMessage: <T = any>(data: T, message: string, status = 200) => {
    return NextResponse.json({ ...data, message }, { status })
  },

  /**
   * Error response
   * @param message - Error message
   * @param status - HTTP status code (default: 400)
   * @param details - Additional error details
   */
  error: (message: string, status = 400, details?: any) => {
    const response: ErrorResponse = { error: message }
    if (details) {
      response.details = details
    }
    return NextResponse.json(response, { status })
  },

  /**
   * Unauthorized response
   * @param message - Custom error message (default: 'Unauthorized')
   */
  unauthorized: (message = 'Unauthorized') => {
    return NextResponse.json({ error: message }, { status: 401 })
  },

  /**
   * Forbidden response
   * @param message - Custom error message (default: 'Forbidden')
   */
  forbidden: (message = 'Forbidden') => {
    return NextResponse.json({ error: message }, { status: 403 })
  },

  /**
   * Not found response
   * @param resource - Resource name (default: 'Resource')
   */
  notFound: (resource = 'Resource') => {
    return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
  },

  /**
   * Validation error response
   * @param errors - Validation errors
   */
  validationError: (errors: any) => {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: errors 
      }, 
      { status: 422 }
    )
  },

  /**
   * Internal server error response
   * @param message - Custom error message
   * @param details - Error details (only included in development)
   */
  serverError: (message = 'Internal server error', details?: any) => {
    const response: ErrorResponse = { error: message }
    
    // Only include details in development for security
    if (process.env.NODE_ENV === 'development' && details) {
      response.details = details
    }
    
    return NextResponse.json(response, { status: 500 })
  },

  /**
   * No content response (204)
   */
  noContent: () => {
    return new NextResponse(null, { status: 204 })
  },

  /**
   * Created response (201)
   * @param data - Created resource data
   */
  created: <T = any>(data: T) => {
    return NextResponse.json(data, { status: 201 })
  },

  /**
   * Accepted response (202)
   * @param data - Response data
   */
  accepted: <T = any>(data?: T) => {
    return NextResponse.json(data || { status: 'accepted' }, { status: 202 })
  }
}

/**
 * Helper function to handle API errors consistently
 * @param error - The error object
 * @param context - Context for logging (e.g., 'auth/login')
 */
export function handleApiError(error: any, context?: string): NextResponse {
  logger.error(`API Error${context ? ` in ${context}` : ''}:`, error)

  // Handle known error types
  if (error?.code === 'PGRST116') {
    return apiResponse.notFound()
  }

  if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
    return apiResponse.unauthorized()
  }

  if (error?.status === 403 || error?.code === 'FORBIDDEN') {
    return apiResponse.forbidden()
  }

  if (error?.status === 422 || error?.code === 'VALIDATION_ERROR') {
    return apiResponse.validationError(error.details || error.message)
  }

  // Handle AI service errors with user-friendly messages
  if (error?.message?.includes('AI matching service failed') || 
      error?.message?.includes('AI match analysis failed') ||
      error?.message?.includes('DeepSeek')) {
    return apiResponse.serverError(
      'Our matching service is temporarily busy. Please try again in a moment.',
      { retryable: true }
    )
  }

  if (error?.message?.includes('Failed to calculate embedding')) {
    return apiResponse.serverError(
      'Unable to process match similarity. Please try again.',
      { retryable: true }
    )
  }

  // Default to server error with user-friendly message
  const userMessage = error?.message?.length > 100 
    ? 'An unexpected error occurred. Please try again or contact support.'
    : (error?.message || 'An unexpected error occurred')
    
  return apiResponse.serverError(userMessage, error)
}