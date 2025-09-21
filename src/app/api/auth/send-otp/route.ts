import { NextRequest } from 'next/server'
import { createCustomOTP } from '@/lib/auth/custom-otp'
import { emailService } from '@/lib/core/email-service'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createServiceClient } from '@/lib/supabase/server'
import { Features } from '@/lib/features'
import { handleApiError as handleApiErrorNew } from '@/lib/core/error-manager'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  let isLogin = false
  try {
    const { email, isLogin: isLoginParam = false } = await request.json()
    isLogin = isLoginParam

    if (!email) {
      return apiResponse.error('Email is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return apiResponse.error('Please enter a valid email address')
    }

    logger.info('📧 Processing OTP request for:', email, 'isLogin:', isLogin)
    
    // If this is a login request, check if the user exists
    if (isLogin) {
      const supabase = createServiceClient()
      
      // Check if client exists
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single()
      
      if (!client) {
        logger.info('❌ Login attempt for non-existent client:', email)
        return apiResponse.error('No account found with this email. Please sign up first.')
      }
    }

    // Generate and store OTP
    let otp
    try {
      otp = await createCustomOTP(email)
    } catch (error) {
      logger.error('Failed to create OTP:', error)
      return apiResponse.error('Failed to generate verification code. Please try again.')
    }

    // Send OTP email using centralized EmailService with Marc Lou templates
    const emailResult = await emailService.sendOTPEmail(email, otp, 'client', isLogin ? 'login' : 'signup')
    
    if (!emailResult.success) {
      logger.info('⚠️ Email sending failed but OTP was created:', otp, 'Error:', emailResult.error)
      // In development, we still return success since the OTP is logged
      if (process.env.NODE_ENV === 'development') {
        return apiResponse.success({ success: true })
      }
      return apiResponse.error('Failed to send verification email. Please try again.')
    }

    return apiResponse.success({ success: true })
  } catch (error) {
    // Use new ErrorManager if feature flag is enabled
    if (Features.USE_ERROR_MANAGER) {
      logger.info('✨ Using new ErrorManager for OTP error handling')
      return handleApiErrorNew(error, 'auth/send-otp', {
        operation: 'send_otp',
        metadata: { isLogin }
      })
    }
    
    // Legacy error handling
    logger.error('Error in send-otp endpoint:', error)
    if (error instanceof Error) {
      return apiResponse.serverError(error.message)
    }
    return handleApiError(error, 'auth/send-otp')
  }
}