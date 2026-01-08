import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { emailService } from '@/lib/core/email-service'
import { createProjectRequestReminderMarcStyle } from '@/lib/email/templates/marc-lou-style'
import { logger } from '@/lib/core/logging-service'

/**
 * Cron job to send reminder emails for pending project requests
 * Runs daily to check for requests that are:
 * - 4 days old (3 days remaining) - First reminder
 * - 6 days old (1 day remaining) - Final reminder
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job attempt for reminders')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('🔔 Starting project request reminder job')
    
    const supabase = createServiceClient()
    const now = new Date()
    
    // Get all pending project requests with their details
    const { data: pendingRequests, error } = await supabase
      .from('project_requests')
      .select(`
        *,
        designers (
          id,
          email,
          first_name,
          last_name
        ),
        matches (
          briefs (
            project_type,
            timeline,
            budget
          )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching pending requests:', error)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    if (!pendingRequests || pendingRequests.length === 0) {
      logger.info('No pending project requests to process')
      return NextResponse.json({ message: 'No pending requests', processed: 0 })
    }

    let remindersSent = 0
    const remindersToSend = []

    for (const request of pendingRequests) {
      const createdAt = new Date(request.created_at)
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = 7 - daysSinceCreation

      // Skip if no designer data
      if (!request.designers?.email) {
        logger.warn(`No designer email for request ${request.id}`)
        continue
      }

      // Determine if we should send a reminder
      let shouldSendReminder = false
      let reminderType = ''

      // First reminder at day 4 (3 days remaining)
      if (daysSinceCreation === 4 && (!request.first_reminder_sent_at)) {
        shouldSendReminder = true
        reminderType = 'first'
      }
      // Final reminder at day 6 (1 day remaining)
      else if (daysSinceCreation === 6 && (!request.final_reminder_sent_at)) {
        shouldSendReminder = true
        reminderType = 'final'
      }

      if (shouldSendReminder && daysRemaining > 0) {
        remindersToSend.push({
          request,
          daysRemaining,
          reminderType
        })
      }

      // Auto-expire requests that are 7+ days old
      if (daysSinceCreation >= 7) {
        await supabase
          .from('project_requests')
          .update({ 
            status: 'expired',
            expired_at: now.toISOString()
          })
          .eq('id', request.id)
        
        logger.info(`Expired project request ${request.id} after 7 days`)
      }
    }

    // Send all reminder emails
    for (const reminder of remindersToSend) {
      const { request, daysRemaining, reminderType } = reminder
      
      try {
        // Create the reminder email using Marc Lou style
        const emailContent = createProjectRequestReminderMarcStyle({
          designerName: request.designers.first_name,
          daysRemaining,
          projectType: request.matches?.briefs?.project_type,
          clientMessage: request.message,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
        })

        // Send the email
        const result = await emailService.sendEmail({
          to: request.designers.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          tags: {
            type: 'project-request-reminder',
            reminderType,
            requestId: request.id
          }
        })

        if (result.success) {
          // Update the reminder sent timestamp
          const updateData = reminderType === 'first' 
            ? { first_reminder_sent_at: now.toISOString() }
            : { final_reminder_sent_at: now.toISOString() }

          await supabase
            .from('project_requests')
            .update(updateData)
            .eq('id', request.id)

          remindersSent++
          logger.info(`Sent ${reminderType} reminder for request ${request.id} to ${request.designers.email}`)
        } else {
          logger.error(`Failed to send reminder for request ${request.id}:`, result.error)
        }
      } catch (error) {
        logger.error(`Error sending reminder for request ${request.id}:`, error)
      }
    }

    logger.info(`✅ Reminder job completed: ${remindersSent} reminders sent`)

    return NextResponse.json({
      success: true,
      message: 'Reminder job completed',
      processed: pendingRequests.length,
      remindersSent,
      timestamp: now.toISOString()
    })

  } catch (error) {
    logger.error('Error in reminder cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering in development
export async function POST(request: NextRequest) {
  return GET(request)
}