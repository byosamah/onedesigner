import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/core/email-service'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }

  // Generate a test OTP
  const testOTP = Math.floor(100000 + Math.random() * 900000).toString()
  
  logger.info('Test OTP endpoint called')
  logger.info('Email:', email)
  logger.info('OTP:', testOTP)
  logger.info('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  logger.info('EMAIL_FROM:', process.env.EMAIL_FROM)

  try {
    // Use centralized EmailService with Marc Lou templates
    const result = await emailService.sendOTPEmail(email, testOTP, 'client', 'verify')
    
    return NextResponse.json({ 
      success: result.success,
      message: result.success ? 'OTP email sent with Marc Lou template' : 'Failed to send OTP email',
      debug: {
        otp: testOTP,
        email: email,
        hasApiKey: !!process.env.RESEND_API_KEY,
        emailFrom: process.env.EMAIL_FROM,
        messageId: result.messageId,
        error: result.error
      }
    })
  } catch (error) {
    logger.error('Test OTP error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send OTP',
      details: error
    }, { status: 500 })
  }
}