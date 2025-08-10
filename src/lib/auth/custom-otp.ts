import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { OTP_CONFIG } from '@/lib/constants'

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTP in our auth_tokens table
export async function createCustomOTP(email: string) {
  const supabase = createServiceClient()
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_TIME) // 10 minutes

  console.log('Creating OTP for email:', email)

  // Clean up old OTPs for this email
  const { error: deleteError } = await supabase
    .from('auth_tokens')
    .delete()
    .eq('email', email)
    .eq('type', 'otp')

  if (deleteError) {
    console.error('Error deleting old OTPs:', deleteError)
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
    console.error('Error creating OTP in auth_tokens:', error)
    throw error
  }

  console.log('OTP created successfully:', otp)
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
export async function sendCustomOTP(email: string) {
  const otp = await createCustomOTP(email)
  
  await sendEmail({
    to: email,
    subject: 'Your OneDesigner verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Your verification code</h2>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000; font-family: monospace;">
            ${otp}
          </div>
        </div>
        <p style="color: #666; text-align: center;">
          This code will expire in 10 minutes.
        </p>
        <p style="color: #666; text-align: center; font-size: 14px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
  })
  
  return otp
}