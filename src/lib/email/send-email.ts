import { API_ENDPOINTS } from '@/lib/constants'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Use Resend API if available
    if (process.env.RESEND_API_KEY) {
      const response = await fetch(API_ENDPOINTS.RESEND, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'OneDesigner <magic@onedesigner.app>',
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
      console.log('📧 Email would be sent:')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('Content preview:', (text || html).substring(0, 200) + '...')
      
      return { success: true }
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}