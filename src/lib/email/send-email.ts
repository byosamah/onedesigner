import { API_ENDPOINTS } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Always use personalized sender for all emails
    const defaultSender = 'Hala from OneDesigner <team@onedesigner.app>'
    
    // Use Resend API if available
    if (process.env.RESEND_API_KEY) {
      const response = await fetch(API_ENDPOINTS.RESEND, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || defaultSender,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ''),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email via Resend')
      }
      
      return { success: true }
    } else {
      // Development mode - log email instead of sending
      logger.info('📧 Email would be sent:')
      logger.info('To:', to)
      logger.info('Subject:', subject)
      logger.info('Content preview:', (text || html).substring(0, 200) + '...')
      
      return { success: true }
    }
  } catch (error) {
    logger.error('Email sending error:', error)
    return { success: false, error }
  }
}