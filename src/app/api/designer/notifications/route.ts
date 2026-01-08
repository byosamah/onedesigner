import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const supabase = createServiceClient()

    // Fetch notifications for the designer
    const { data: notifications, error } = await supabase
      .from('designer_notifications')
      .select('*')
      .eq('designer_id', session.designerId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      logger.error('Error fetching notifications:', error)
      return apiResponse.serverError('Failed to fetch notifications')
    }

    // Count unread notifications
    const unreadCount = notifications?.filter(n => !n.read).length || 0

    return apiResponse.success({
      notifications: notifications || [],
      unreadCount,
      total: notifications?.length || 0
    })

  } catch (error) {
    return handleApiError(error, 'designer/notifications')
  }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const { notificationIds } = await request.json()
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return apiResponse.badRequest('Notification IDs are required')
    }

    const supabase = createServiceClient()

    // Mark notifications as read
    const { error } = await supabase
      .from('designer_notifications')
      .update({ read: true })
      .eq('designer_id', session.designerId)
      .in('id', notificationIds)

    if (error) {
      logger.error('Error updating notifications:', error)
      return apiResponse.serverError('Failed to update notifications')
    }

    return apiResponse.success({
      message: 'Notifications marked as read'
    })

  } catch (error) {
    return handleApiError(error, 'designer/notifications')
  }
}