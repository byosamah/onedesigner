import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { OTP_CONFIG } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'
import { emailService } from '@/lib/core/email-service'
import { Features } from '@/lib/features'

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
  
  // Use centralized email service with the Marc Lou style template if enabled
  if (Features.USE_EMAIL_SERVICE) {
    await emailService.sendOTPEmail(email, otp, userType, purpose)
  } else {
    // Fallback to direct email sending with improved template
    await sendEmail({
      to: email,
      subject: `${otp} is your OneDesigner code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #F3F4F6; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">⚡</span>
              <span style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">OneDesigner</span>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">Quick verification 👇</div>
            
            <!-- OTP Container -->
            <div style="background: #F9FAFB; border: 2px dashed #E5E7EB; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;">
                ${otp}
              </div>
              <div style="font-size: 14px; color: #6B7280; margin-top: 12px;">Expires in 10 minutes</div>
            </div>
            
            <p style="font-size: 16px; line-height: 1.7; color: #4B5563;">
              Just copy and paste this code to continue.
            </p>
            
            <p style="font-size: 14px; color: #9CA3AF; font-style: italic; margin-top: 24px;">
              (If you didn't request this, just ignore this email)
            </p>
          </div>
          
          <!-- Footer -->
          <div style="padding: 24px 32px; border-top: 1px solid #F3F4F6; background: #F9FAFB;">
            <div style="font-size: 16px; color: #111827; font-weight: 600;">— OneDesigner Security</div>
            <div style="font-size: 14px; color: #6B7280; margin-top: 8px;">We keep your account secure</div>
          </div>
        </div>
      `,
      text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    })
  }
  
  return otp
}