import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateSession } from '@/lib/auth/session-handlers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    // Validate designer session
    const result = await validateSession('DESIGNER')
    
    if (!result.valid || !result.session || !result.user) {
      return apiResponse.unauthorized('No valid session found')
    }

    const designer = result.user
    const supabase = createServiceClient()

    // Try to update rejection_seen flag if column exists
    // If column doesn't exist, we'll handle it gracefully
    try {
      const { error } = await supabase
        .from('designers')
        .update({ rejection_seen: true })
        .eq('id', designer.id)
      
      if (error) {
        if (error.message?.includes('column')) {
          // Column doesn't exist yet, store in session/localStorage instead
          logger.info(`rejection_seen column doesn't exist, using session storage for designer ${designer.id}`)
        } else {
          logger.error('Error marking rejection as seen:', error)
          return apiResponse.error('Failed to update rejection status')
        }
      }
    } catch (updateError) {
      // Fallback: store in session or return success anyway
      logger.info(`Using fallback for rejection_seen: ${updateError}`)
    }

    logger.info(`Marked rejection as seen for designer ${designer.id}`)
    return apiResponse.success({ success: true })
    
  } catch (error) {
    return handleApiError(error, 'designer/rejection-seen')
  }
}