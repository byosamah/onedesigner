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
        subject: 'Your OneDesigner verification code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #f0ad4e; font-size: 24px; font-weight: 700;">OneDesigner</span>
            </div>
            <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center;">
              <h2 style="color: #333; margin-bottom: 20px;">Verification Code</h2>
              <div style="background: white; border: 2px solid #f0ad4e; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
                ${otp}
              </div>
              <p style="color: #666; margin-top: 20px;">This code will expire in 10 minutes.</p>
            </div>
            <p style="color: #999; text-align: center; margin-top: 30px; font-size: 14px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        `,
        text: `Your OneDesigner verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
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