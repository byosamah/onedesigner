import { NextRequest, NextResponse } from 'next/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { apiResponse, handleApiError } from '@/lib/api/responses'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return apiResponse.error('Email and token are required')
    }

    // Verify OTP using our custom system
    const isValid = await verifyCustomOTP(email, token)

    if (!isValid) {
      return apiResponse.unauthorized('Invalid or expired code')
    }

    // Return success - the actual designer check will be done in a separate call
    return apiResponse.success({ 
      success: true,
      message: 'OTP verified successfully'
    })
  } catch (error) {
    console.error('Error verifying designer OTP:', error)
    return handleApiError(error, 'designer/auth/verify-otp')
  }
}