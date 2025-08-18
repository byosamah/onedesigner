import { NextRequest } from 'next/server'
import { createCustomOTP } from '@/lib/auth/custom-otp'
import { emailService } from '@/lib/core/email-service'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    const { email, isLogin = false } = await request.json()

    if (!email) {
      return apiResponse.error('Email is required')
    }

    logger.info('🎨 Processing designer OTP request for:', email, 'isLogin:', isLogin)
    
    // If this is a login request, check if the designer exists
    if (isLogin) {
      const supabase = createServiceClient()
      
      // Check if designer exists
      const { data: designer } = await supabase
        .from('designers')
        .select('id')
        .eq('email', email)
        .single()
      
      if (!designer) {
        logger.info('❌ Login attempt for non-existent designer:', email)
        return apiResponse.error('No designer account found with this email. Please sign up first.')
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
    const emailResult = await emailService.sendOTPEmail(email, otp, 'designer', isLogin ? 'login' : 'signup')
    
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
    logger.error('Error in designer send-otp endpoint:', error)
    if (error instanceof Error) {
      return apiResponse.serverError(error.message)
    }
    return handleApiError(error, 'designer/auth/send-otp')
  }
}