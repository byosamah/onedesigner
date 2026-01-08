import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api/responses'
import { emailService } from '@/lib/core/email-service'
import { Features } from '@/lib/features'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    logger.info('Testing EmailService functionality')
    
    // Get configuration
    const config = emailService.getConfig()
    
    // Get queue status
    const queueStatus = emailService.getQueueStatus()
    
    // Get available templates
    const templates = [
      'otp',
      'welcome',
      'designer-approved',
      'designer-rejected',
      'match-found',
      'designer-request'
    ]
    
    return apiResponse.success({
      message: 'EmailService test completed',
      featureEnabled: Features.USE_EMAIL_SERVICE || false,
      config: {
        from: config.from,
        rateLimit: config.rateLimit,
        maxRetries: config.maxRetries,
        queueEnabled: config.queueEnabled
      },
      queueStatus,
      templates,
      tests: {
        configLoaded: true,
        templatesInitialized: templates.length,
        queueActive: config.queueEnabled
      }
    })
  } catch (error) {
    logger.error('EmailService test failed', error)
    return apiResponse.error('Failed to test EmailService')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, to, template, variables, subject, html, text } = await request.json()
    
    if (!Features.USE_EMAIL_SERVICE) {
      return apiResponse.error('EmailService not enabled')
    }
    
    logger.info('Testing EmailService action', { action, to, template })
    
    switch (action) {
      case 'send-template': {
        if (!to || !template) {
          return apiResponse.error('Missing required fields: to, template')
        }
        
        const result = await emailService.sendTemplatedEmail(template, {
          to,
          variables: variables || {}
        })
        
        return apiResponse.success({
          message: result.success ? 'Email sent successfully' : 'Failed to send email',
          result
        })
      }
      
      case 'send-direct': {
        if (!to || !subject || (!html && !text)) {
          return apiResponse.error('Missing required fields: to, subject, html or text')
        }
        
        const result = await emailService.sendEmail({
          to,
          subject,
          html,
          text
        })
        
        return apiResponse.success({
          message: result.success ? 'Email sent successfully' : 'Failed to send email',
          result
        })
      }
      
      case 'send-otp': {
        if (!to) {
          return apiResponse.error('Missing required field: to')
        }
        
        // Generate test OTP code
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        
        const result = await emailService.sendOTPEmail(
          to,
          code,
          'client',
          'login'
        )
        
        return apiResponse.success({
          message: result.success ? 'OTP email sent' : 'Failed to send OTP',
          code, // Only for testing
          result
        })
      }
      
      case 'send-welcome': {
        if (!to) {
          return apiResponse.error('Missing required field: to')
        }
        
        const result = await emailService.sendWelcomeEmail(
          to,
          variables?.name || 'Test User',
          'client',
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        )
        
        return apiResponse.success({
          message: result.success ? 'Welcome email sent' : 'Failed to send welcome email',
          result
        })
      }
      
      case 'send-approval': {
        if (!to) {
          return apiResponse.error('Missing required field: to')
        }
        
        const approved = variables?.approved !== false
        
        const result = await emailService.sendDesignerApprovalEmail(
          to,
          variables?.name || 'Test Designer',
          approved,
          variables?.reason
        )
        
        return apiResponse.success({
          message: result.success ? 'Approval email sent' : 'Failed to send approval email',
          result
        })
      }
      
      case 'queue-status': {
        const status = emailService.getQueueStatus()
        
        return apiResponse.success({
          message: 'Queue status retrieved',
          queueStatus: status
        })
      }
      
      case 'clear-queue': {
        emailService.clearQueue()
        
        return apiResponse.success({
          message: 'Email queue cleared'
        })
      }
      
      case 'register-template': {
        if (!template || !variables?.subject) {
          return apiResponse.error('Missing required fields: template name and subject')
        }
        
        emailService.registerTemplate(template, {
          subject: variables.subject,
          html: variables.html,
          text: variables.text
        })
        
        return apiResponse.success({
          message: 'Template registered successfully',
          template
        })
      }
      
      default:
        return apiResponse.error('Unknown action', 400)
    }
    
  } catch (error) {
    logger.error('EmailService test error', error)
    return apiResponse.error('Failed to test EmailService action')
  }
}