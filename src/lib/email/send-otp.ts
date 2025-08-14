import { API_ENDPOINTS } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

export async function sendOTPEmail(email: string, otp: string) {
  logger.info('Attempting to send OTP email to:', email)
  logger.info('Using EMAIL_FROM:', process.env.EMAIL_FROM || 'OneDesigner <team@onedesigner.app>')
  logger.info('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  
  try {
    const response = await fetch(API_ENDPOINTS.RESEND, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'OneDesigner <team@onedesigner.app>',
        to: email,
        subject: `${otp} is your OneDesigner code`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; padding: 32px; border-bottom: 1px solid #F3F4F6;">
              <span style="font-size: 24px; font-weight: 700; color: #f0ad4e; letter-spacing: -0.02em;">OneDesigner</span>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Quick verification 👇</h2>
              <div style="background: #F9FAFB; border: 2px dashed #E5E7EB; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: monospace;">${otp}</div>
                <div style="font-size: 14px; color: #6B7280; margin-top: 12px;">Expires in 10 minutes</div>
              </div>
              <p style="color: #4B5563; margin: 0;">Just copy and paste this code to continue.</p>
              <p style="color: #9CA3AF; font-size: 14px; margin: 16px 0 0 0; font-style: italic;">(If you didn't request this, just ignore this email)</p>
            </div>
            <div style="padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #F3F4F6;">
              <p style="margin: 0; font-weight: 600; color: #111827;">— OneDesigner Security</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6B7280;">Connecting great clients with amazing designers</p>
            </div>
          </div>
        `,
        text: `${otp} is your OneDesigner code\n\nJust copy and paste this code to continue.\n\nExpires in 10 minutes.\n\n— OneDesigner Security`,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Resend API error response:', response.status, errorText)
      
      try {
        const error = JSON.parse(errorText)
        logger.error('Parsed error:', error)
        throw new Error(error.message || error.error || 'Failed to send email')
      } catch (e) {
        throw new Error(`Resend API error (${response.status}): ${errorText}`)
      }
    }

    const data = await response.json()
    logger.info('OTP email sent successfully:', data.id)
    return true
  } catch (error) {
    logger.error('Failed to send OTP email:', error)
    
    // In development, still log the OTP for testing
    if (process.env.NODE_ENV === 'development') {
      logger.info('\n' + '='.repeat(50))
      logger.info('🎨 OneDesigner OTP Code (Email failed, showing for testing)')
      logger.info('='.repeat(50))
      logger.info(`Email: ${email}`)
      logger.info(`Code: ${otp}`)
      logger.info('='.repeat(50) + '\n')
    }
    
    return false
  }
}