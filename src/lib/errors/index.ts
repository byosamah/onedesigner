/**
 * Centralized error handling system
 * Provides consistent error types and handling across the app
 */

import { toast } from '@/lib/toast'

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH', 
  VALIDATION = 'VALIDATION',
  API = 'API',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  type: ErrorType
  code?: string
  statusCode?: number

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.code = code
    this.statusCode = statusCode
  }
}

// Error handler function
export const handleError = (error: unknown, showToast = true): AppError => {
  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Error) {
    // Try to classify the error type
    if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
      appError = new AppError(error.message, ErrorType.NETWORK)
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      appError = new AppError(error.message, ErrorType.AUTH)
    } else {
      appError = new AppError(error.message, ErrorType.UNKNOWN)
    }
  } else if (typeof error === 'string') {
    appError = new AppError(error, ErrorType.UNKNOWN)
  } else {
    appError = new AppError('An unknown error occurred', ErrorType.UNKNOWN)
  }

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error handled:', appError)
  }

  // Show user-friendly toast message
  if (showToast) {
    const userMessage = getUserFriendlyMessage(appError)
    toast.error(userMessage)
  }

  return appError
}

// Convert technical errors to user-friendly messages
const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Network connection error. Please check your internet and try again.'
    
    case ErrorType.AUTH:
      return 'Authentication failed. Please sign in again.'
    
    case ErrorType.VALIDATION:
      return error.message // Validation messages are usually user-friendly
    
    case ErrorType.API:
      if (error.statusCode === 404) {
        return 'The requested resource was not found.'
      } else if (error.statusCode === 500) {
        return 'Server error. Please try again later.'
      } else {
        return error.message || 'An error occurred. Please try again.'
      }
    
    case ErrorType.UNKNOWN:
    default:
      return 'Something went wrong. Please try again.'
  }
}

// Specific error creators for common scenarios
export const createNetworkError = (message = 'Network error occurred') => 
  new AppError(message, ErrorType.NETWORK)

export const createAuthError = (message = 'Authentication failed') =>
  new AppError(message, ErrorType.AUTH)

export const createValidationError = (message: string) =>
  new AppError(message, ErrorType.VALIDATION)

export const createApiError = (message: string, statusCode?: number, code?: string) =>
  new AppError(message, ErrorType.API, code, statusCode)