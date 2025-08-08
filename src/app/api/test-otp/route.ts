import { NextRequest, NextResponse } from 'next/server'
import { sendOTPEmail } from '@/lib/email/send-otp'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }

  // Generate a test OTP
  const testOTP = Math.floor(100000 + Math.random() * 900000).toString()
  
  console.log('Test OTP endpoint called')
  console.log('Email:', email)
  console.log('OTP:', testOTP)
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM)

  try {
    const result = await sendOTPEmail(email, testOTP)
    
    return NextResponse.json({ 
      success: result,
      message: result ? 'OTP email sent' : 'Failed to send OTP email',
      debug: {
        otp: testOTP,
        email: email,
        hasApiKey: !!process.env.RESEND_API_KEY,
        emailFrom: process.env.EMAIL_FROM
      }
    })
  } catch (error) {
    console.error('Test OTP error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send OTP',
      details: error
    }, { status: 500 })
  }
}