import { createServiceClient } from '@/lib/supabase/server'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const supabase = createServiceClient()
  
  try {
    const { error } = await supabase.auth.admin.inviteUserByEmail(to, {
      data: { 
        email_subject: subject,
        email_content: html,
        skip_invitation: true
      }
    })

    if (error) {
      console.error('Failed to send email via Supabase:', error)
      
      // Fallback: Use Resend API if available
      if (process.env.RESEND_API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
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
      } else {
        console.log('Email would be sent to:', to)
        console.log('Subject:', subject)
        console.log('Content:', text || html)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}