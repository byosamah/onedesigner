import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { emailService } from '@/lib/core/email-service'
import { logger } from '@/lib/core/logging-service'
import { createDesignerRejectionEmailMarcStyle } from '@/lib/email/templates/marc-lou-style'

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
    
    // Update designer with rejection status (using existing columns)
    // Note: status, rejection_seen, rejection_count, last_rejection_at columns
    // may not exist yet, so we only update what's available
    const updateData: any = {
      is_approved: false,
      rejection_reason: reason,
      updated_at: new Date().toISOString()
    }
    
    // Try to update with new columns if they exist
    // This will be ignored if columns don't exist
    const { data: designer, error } = await supabase
      .from('designers')
      .update(updateData)
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

    // Send rejection email to designer using centralized EmailService
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'
      const loginUrl = `${baseUrl}/designer/login`
      
      const emailTemplate = createDesignerRejectionEmailMarcStyle({
        designerName: designer.first_name,
        rejectionReason: reason,
        loginUrl
      })
      
      await emailService.sendEmail({
        to: designer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        tags: {
          type: 'designer-rejection',
          designerId: designer.id
        }
      })
      
      logger.info(`Rejection email sent to designer ${designer.id} - they can login to update their profile`)
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