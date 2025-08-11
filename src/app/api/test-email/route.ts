import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/send-email'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production' && !request.headers.get('x-test-key')) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  const email = request.nextUrl.searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }

  logger.info('Test email endpoint called')
  logger.info('EMAIL_FROM:', process.env.EMAIL_FROM)
  logger.info('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  logger.info('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length)
  logger.info('RESEND_API_KEY starts with:', process.env.RESEND_API_KEY?.substring(0, 10))

  try {
    // Test direct Resend API call
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'OneDesigner <magic@onedesigner.app>',
        to: email,
        subject: 'Test Email from OneDesigner',
        html: '<h1>Test Email</h1><p>If you receive this, email sending is working!</p>',
        text: 'Test Email - If you receive this, email sending is working!'
      }),
    })

    const responseText = await response.text()
    logger.info('Resend response status:', response.status)
    logger.info('Resend response:', responseText)

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Resend API error',
        status: response.status,
        details: responseText 
      }, { status: response.status })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent',
      response: JSON.parse(responseText)
    })
  } catch (error) {
    logger.error('Test email error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send test email',
      details: error
    }, { status: 500 })
  }
}