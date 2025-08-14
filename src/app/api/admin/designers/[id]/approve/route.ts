import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(AUTH_COOKIES.ADMIN)
    
    if (!sessionCookie) {
      return apiResponse.unauthorized()
    }

    const session = JSON.parse(sessionCookie.value)
    const supabase = createServiceClient()
    
    logger.info(`=== APPROVING DESIGNER ${params.id} ===`)
    
    // Update designer approval status
    const { data: designer, error } = await supabase
      .from('designers')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: session.adminId,
        last_approved_at: new Date().toISOString(),
        edited_after_approval: false // Reset the edit flag when approving
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !designer) {
      logger.error('Error approving designer:', error)
      logger.error('Designer ID:', params.id)
      logger.error('Admin ID:', session.adminId)
      return apiResponse.serverError('Failed to approve designer', error)
    }

    logger.info(`✅ Designer approved successfully:`, designer.id)
    logger.info(`   Name: ${designer.first_name} ${designer.last_name}`)
    logger.info(`   Email: ${designer.email}`)
    logger.info(`   is_approved: ${designer.is_approved}`)

    // Send approval email to designer (will use "Hala from OneDesigner" automatically)
    try {
      await sendEmail({
        to: designer.email,
        subject: 'Welcome to OneDesigner! Your application has been approved',
        html: `
          <h2>Congratulations ${designer.first_name}!</h2>
          <p>Your application to join OneDesigner has been approved.</p>
          <p>You can now:</p>
          <ul>
            <li>Log in to your dashboard</li>
            <li>Receive match requests from clients</li>
            <li>Update your profile</li>
          </ul>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/designer/login" 
               style="background: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          <p>Best regards,<br>Hala from OneDesigner</p>
        `,
        text: `Congratulations ${designer.first_name}! Your application to join OneDesigner has been approved. You can now log in to your dashboard at ${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/designer/login`
      })
    } catch (emailError) {
      logger.error('Failed to send approval email:', emailError)
      // Don't fail the approval if email fails
    }

    return apiResponse.success({
      success: true,
      designer: {
        id: designer.id,
        email: designer.email,
        name: `${designer.first_name} ${designer.last_name}`
      }
    })
  } catch (error) {
    return handleApiError(error, 'admin/designers/approve')
  }
}