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

    // Generate and store OTP
    const otp = await createCustomOTP(email)

    // Send OTP email (in dev, this logs to console)
    await sendOTPEmail(email, otp)

    return apiResponse.success({ success: true })
  } catch (error) {
    console.error('Error sending OTP:', error)
    if (error instanceof Error) {
      return apiResponse.serverError(error.message)
    }
    return handleApiError(error, 'auth/send-otp')
  }
}