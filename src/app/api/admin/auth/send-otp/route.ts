import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendCustomOTP } from '@/lib/auth/custom-otp'
import { isAdminEmail } from '@/lib/admin/config'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email is in hardcoded admin list
    if (!isAdminEmail(email)) {
      logger.error('Not an authorized admin email:', email)
      return NextResponse.json(
        { error: 'Not authorized. This email is not registered as an admin.' },
        { status: 403 }
      )
    }

    // Send OTP with admin user type
    await sendCustomOTP(email, 'admin', 'login')

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error sending admin OTP:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}