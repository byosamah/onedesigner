import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { logger } from '@/lib/core/logging-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('admin-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()
    
    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    
    // Update designer with rejection
    const { data: designer, error } = await supabase
      .from('designers')
      .update({
        is_approved: false,
        rejection_reason: reason
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !designer) {
      logger.error('Error rejecting designer:', error)
      return NextResponse.json(
        { error: 'Failed to reject designer' },
        { status: 500 }
      )
    }

    // Send rejection email to designer
    try {
      await sendEmail({
        to: designer.email,
        subject: 'Your OneDesigner Application Update',
        html: `
          <h2>Hello ${designer.first_name},</h2>
          <p>Thank you for your interest in joining OneDesigner.</p>
          <p>After careful review, we're unable to approve your application at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>We encourage you to address the feedback and reapply in the future.</p>
          <p>Best regards,<br>The OneDesigner Team</p>
        `,
        text: `Hello ${designer.first_name}, Thank you for your interest in joining OneDesigner. After careful review, we're unable to approve your application at this time. Reason: ${reason}. We encourage you to address the feedback and reapply in the future.`
      })
    } catch (emailError) {
      logger.error('Failed to send rejection email:', emailError)
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    logger.error('Error in reject route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}