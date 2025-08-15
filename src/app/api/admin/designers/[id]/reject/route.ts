import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { logger } from '@/lib/core/logging-service'
import { createDesignerRejectionEmailMarcStyle } from '@/lib/email/templates/marc-lou-style'
import crypto from 'crypto'

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
    
    // Generate a unique token for the update application link
    const updateToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    
    // Update designer with rejection and store update token
    const { data: designer, error } = await supabase
      .from('designers')
      .update({
        is_approved: false,
        rejection_reason: reason,
        update_token: updateToken,
        update_token_expires: tokenExpiry.toISOString()
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

    // Generate the update application URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'
    const updateApplicationUrl = `${baseUrl}/designer/update-application?token=${updateToken}`

    // Send rejection email to designer with Marc Lou style template
    try {
      const emailTemplate = createDesignerRejectionEmailMarcStyle({
        designerName: designer.first_name,
        rejectionReason: reason,
        updateApplicationUrl
      })
      
      await sendEmail({
        to: designer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      })
      
      logger.info(`Rejection email sent to designer ${designer.id} with update link`)
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