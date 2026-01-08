import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api/responses'
import { otpService } from '@/lib/core/otp-service'
import { Features } from '@/lib/features'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    logger.info('Testing OTPService functionality')
    
    // Test configuration
    const config = otpService.getConfig()
    
    // Test status check
    const testEmail = 'test@example.com'
    const status = await otpService.getOTPStatus(testEmail, 'client')
    
    // Clean up expired OTPs
    const cleaned = await otpService.cleanupExpired()
    
    return apiResponse.success({
      message: 'OTPService test completed',
      featureEnabled: Features.USE_OTP_SERVICE || false,
      config,
      tests: {
        statusCheck: status,
        cleanedExpired: cleaned
      }
    })
  } catch (error) {
    logger.error('OTPService test failed', error)
    return apiResponse.error('Failed to test OTPService')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, code, type = 'client', purpose = 'login' } = await request.json()
    
    if (!Features.USE_OTP_SERVICE) {
      return apiResponse.error('OTPService not enabled')
    }
    
    logger.info('Testing OTPService action', { action, email, type, purpose })
    
    switch (action) {
      case 'generate': {
        const result = await otpService.generateOTP(email, type, purpose)
        
        if (result.success) {
          logger.info('OTP generated for testing', { email, code: result.code })
          return apiResponse.success({
            message: 'OTP generated successfully',
            code: result.code, // Only for testing
            expiresIn: otpService.getConfig().expiry * 60 // seconds
          })
        } else {
          return apiResponse.error(result.error || 'Failed to generate OTP')
        }
      }
      
      case 'validate': {
        const result = await otpService.validateOTP(email, code, type, purpose)
        
        return apiResponse.success({
          message: result.isValid ? 'OTP is valid' : 'OTP is invalid',
          validation: result
        })
      }
      
      case 'resend': {
        const result = await otpService.resendOTP(email, type, purpose)
        
        if (result.success) {
          logger.info('OTP resent for testing', { email, code: result.code })
          return apiResponse.success({
            message: 'OTP resent successfully',
            code: result.code // Only for testing
          })
        } else {
          return apiResponse.error(result.error || 'Failed to resend OTP')
        }
      }
      
      case 'invalidate': {
        const success = await otpService.invalidateOTP(email, type, purpose)
        
        return apiResponse.success({
          message: success ? 'OTP invalidated' : 'Failed to invalidate OTP',
          success
        })
      }
      
      case 'status': {
        const status = await otpService.getOTPStatus(email, type)
        
        return apiResponse.success({
          message: 'OTP status retrieved',
          status
        })
      }
      
      case 'cleanup': {
        const cleaned = await otpService.cleanupExpired()
        
        return apiResponse.success({
          message: `Cleaned up ${cleaned} expired OTPs`,
          cleaned
        })
      }
      
      case 'clear-rate-limit': {
        otpService.clearRateLimit(`${email}:${type}:${purpose}`)
        
        return apiResponse.success({
          message: 'Rate limit cleared',
          email,
          type,
          purpose
        })
      }
      
      default:
        return apiResponse.error('Unknown action', 400)
    }
    
  } catch (error) {
    logger.error('OTPService test error', error)
    return apiResponse.error('Failed to test OTPService action')
  }
}