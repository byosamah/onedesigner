import { NextRequest } from 'next/server'
import { createCustomOTP } from '@/lib/auth/custom-otp'
import { sendOTPEmail } from '@/lib/email/send-otp'
import { apiResponse, handleApiError } from '@/lib/api/responses'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return apiResponse.error('Email is required')
    }

    console.log('📧 Processing OTP request for:', email)

    // Generate and store OTP
    let otp
    try {
      otp = await createCustomOTP(email)
    } catch (error) {
      console.error('Failed to create OTP:', error)
      return apiResponse.error('Failed to generate verification code. Please try again.')
    }

    // Send OTP email (in dev, this logs to console)
    const emailSent = await sendOTPEmail(email, otp)
    
    if (!emailSent) {
      console.log('⚠️ Email sending failed but OTP was created:', otp)
      // In development, we still return success since the OTP is logged
      if (process.env.NODE_ENV === 'development') {
        return apiResponse.success({ success: true })
      }
      return apiResponse.error('Failed to send verification email. Please try again.')
    }

    return apiResponse.success({ success: true })
  } catch (error) {
    console.error('Error in send-otp endpoint:', error)
    if (error instanceof Error) {
      return apiResponse.serverError(error.message)
    }
    return handleApiError(error, 'auth/send-otp')
  }
}