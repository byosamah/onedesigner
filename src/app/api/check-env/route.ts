import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
    resendKeyStart: process.env.RESEND_API_KEY?.substring(0, 10) || 'not-set',
    hasEmailFrom: !!process.env.EMAIL_FROM,
    emailFrom: process.env.EMAIL_FROM || 'not-set',
    nodeEnv: process.env.NODE_ENV || 'not-set',
    timestamp: new Date().toISOString()
  })
}