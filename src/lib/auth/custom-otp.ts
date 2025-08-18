import { createServiceClient } from '@/lib/supabase/server'
import { OTP_CONFIG } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'
import { emailService } from '@/lib/core/email-service'

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTP in our auth_tokens table
export async function createCustomOTP(email: string) {
  const supabase = createServiceClient()
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_TIME) // 10 minutes

  logger.info('Creating OTP for email:', email)

  // Clean up old OTPs for this email
  const { error: deleteError } = await supabase
    .from('auth_tokens')
    .delete()
    .eq('email', email)
    .eq('type', 'otp')

  if (deleteError) {
    logger.error('Error deleting old OTPs:', deleteError)
  }

  // Insert new OTP
  const { error } = await supabase
    .from('auth_tokens')
    .insert({
      email,
      token: otp,
      type: 'otp',
      expires_at: expiresAt.toISOString(),
    })

  if (error) {
    logger.error('Error creating OTP in auth_tokens:', error)
    throw error
  }

  logger.info('OTP created successfully:', otp)
  return otp
}

// Verify OTP from our auth_tokens table
export async function verifyCustomOTP(email: string, token: string) {
  const supabase = createServiceClient()

  // Find valid OTP
  const { data, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('email', email)
    .eq('token', token)
    .eq('type', 'otp')
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return false
  }

  // Mark as used
  await supabase
    .from('auth_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id)

  return true
}

// Send OTP via email
export async function sendCustomOTP(email: string, userType: 'admin' | 'designer' | 'client' = 'admin', purpose: 'login' | 'signup' | 'reset' | 'verify' = 'login') {
  const otp = await createCustomOTP(email)
  
  // Always use centralized email service with the Marc Lou style template
  await emailService.sendOTPEmail(email, otp, userType, purpose)
  
  return otp
}