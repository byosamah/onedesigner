import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
    resendKeyStart: process.env.RESEND_API_KEY?.substring(0, 10) || 'not-set',
    hasEmailFrom: !!process.env.EMAIL_FROM,
    emailFrom: process.env.EMAIL_FROM || 'not-set',
    nodeEnv: process.env.NODE_ENV || 'not-set',
    featureFlags: {
      USE_NEW_DATA_SERVICE: process.env.USE_NEW_DATA_SERVICE || 'not-set',
      USE_ERROR_MANAGER: process.env.USE_ERROR_MANAGER || 'not-set',
      USE_REQUEST_PIPELINE: process.env.USE_REQUEST_PIPELINE || 'not-set',
      USE_CONFIG_MANAGER: process.env.USE_CONFIG_MANAGER || 'not-set',
      USE_BUSINESS_RULES: process.env.USE_BUSINESS_RULES || 'not-set',
      USE_CENTRALIZED_LOGGING: process.env.USE_CENTRALIZED_LOGGING || 'not-set',
      USE_OTP_SERVICE: process.env.USE_OTP_SERVICE || 'not-set',
      USE_EMAIL_SERVICE: process.env.USE_EMAIL_SERVICE || 'not-set'
    },
    timestamp: new Date().toISOString()
  })
}