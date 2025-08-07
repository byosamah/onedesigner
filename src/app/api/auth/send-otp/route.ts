import { NextRequest, NextResponse } from 'next/server'
import { createCustomOTP } from '@/lib/auth/custom-otp'
import { sendOTPEmail } from '@/lib/email/send-otp'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate and store OTP
    const otp = await createCustomOTP(email)

    // Send OTP email (in dev, this logs to console)
    await sendOTPEmail(email, otp)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    )
  }
}