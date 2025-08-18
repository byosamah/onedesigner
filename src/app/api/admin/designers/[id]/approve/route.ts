import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { emailService } from '@/lib/core/email-service'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'
import { createDesignerApprovalEmailMarcStyle } from '@/lib/email/templates/marc-lou-style'

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

    // Send approval email using centralized EmailService
    try {
      await emailService.sendDesignerApprovalEmail(
        designer.email,
        designer.first_name,
        true // approved
      )
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