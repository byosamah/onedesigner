/**
 * Phase 8: Centralized Email Service
 * 
 * Consolidates 12 different email sending implementations into a single service
 * Features: Templates, queuing, retry logic, tracking, rate limiting
 */

import { Resend } from 'resend'
import { logger } from '@/lib/core/logging-service'
import { ErrorManager } from '@/lib/core/error-manager'
import { otpService } from '@/lib/core/otp-service'
import { Features } from '@/lib/features'
import { EMAIL_TIMING, timeUtils } from '@/lib/constants'
import { 
  createWelcomeClientEmailMarcStyle,
  createDesignerApprovalEmailMarcStyle,
  createOTPEmailMarcStyle,
  createProjectRequestEmailMarcStyle
} from '@/lib/email/templates/marc-lou-style'

export interface EmailConfig {
  from: string
  fromName?: string // Optional sender name override
  replyTo?: string
  apiKey: string
  maxRetries: number
  retryDelay: number // milliseconds
  rateLimit: number // emails per minute
  queueEnabled: boolean
  trackingEnabled: boolean
}

export interface EmailTemplate {
  subject: string
  html?: string
  text?: string
  react?: React.ReactElement
}

export interface EmailOptions {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  fromName?: string // Override sender name for specific emails
  template?: string
  variables?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  tags?: Record<string, string>
  priority?: 'high' | 'normal' | 'low'
  scheduledAt?: Date
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  retries?: number
  queueId?: string
}

export interface EmailQueueItem {
  id: string
  template: string
  options: EmailOptions
  status: 'pending' | 'sending' | 'sent' | 'failed'
  attempts: number
  error?: string
  createdAt: Date
  scheduledAt?: Date
  sentAt?: Date
}

/**
 * Centralized Email Service for all email operations
 * Replaces multiple email implementations with a single, feature-rich service
 */
export class EmailService {
  private static instance: EmailService
  private resend: Resend
  private config: EmailConfig
  private queue: EmailQueueItem[] = []
  private rateLimitCounter: Map<string, number> = new Map()
  private templates: Map<string, EmailTemplate> = new Map()
  private processingQueue = false

  private constructor() {
    // Initialize Resend client
    const apiKey = process.env.RESEND_API_KEY || ''
    this.resend = new Resend(apiKey)

    // Default configuration using centralized timing
    this.config = {
      from: process.env.EMAIL_FROM || 'OneDesigner <hello@onedesigner.app>',
      fromName: 'OneDesigner', // Default sender name
      replyTo: process.env.EMAIL_REPLY_TO,
      apiKey,
      maxRetries: EMAIL_TIMING.MAX_RETRIES,
      retryDelay: EMAIL_TIMING.RETRY_DELAY_MS,
      rateLimit: EMAIL_TIMING.RATE_LIMIT_PER_MINUTE,
      queueEnabled: true,
      trackingEnabled: true
    }

    // Load configuration
    this.loadConfiguration()
    
    // Initialize default templates
    this.initializeTemplates()

    // Start queue processor if enabled
    if (this.config.queueEnabled) {
      this.startQueueProcessor()
    }
  }

  static getInstance(): EmailService {
    if (!this.instance) {
      this.instance = new EmailService()
    }
    return this.instance
  }

  /**
   * Load configuration from environment or ConfigManager
   */
  private loadConfiguration(): void {
    try {
      if (Features.USE_CONFIG_MANAGER) {
        const { getOneDesignerConfig } = require('@/lib/config/init')
        
        this.config = {
          from: getOneDesignerConfig('email.from', this.config.from),
          replyTo: getOneDesignerConfig('email.replyTo', this.config.replyTo),
          apiKey: getOneDesignerConfig('email.apiKey', this.config.apiKey),
          maxRetries: getOneDesignerConfig('email.maxRetries', 3),
          retryDelay: getOneDesignerConfig('email.retryDelay', 5000),
          rateLimit: getOneDesignerConfig('email.rateLimit', 60),
          queueEnabled: getOneDesignerConfig('email.queueEnabled', true),
          trackingEnabled: getOneDesignerConfig('email.trackingEnabled', true)
        }
      }
    } catch (error) {
      logger.warn('Failed to load email configuration, using defaults', { error })
    }
  }

  /**
   * Initialize default email templates
   */
  private initializeTemplates(): void {
    // OTP Template
    this.templates.set('otp', {
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Your verification code is:</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">{{code}}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in {{expiry}} minutes.</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      text: 'Your verification code is: {{code}}. This code will expire in {{expiry}} minutes.'
    })

    // Welcome Email Template
    this.templates.set('welcome', {
      subject: 'Welcome to OneDesigner!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Welcome to OneDesigner, {{name}}!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">We're excited to have you join our community of talented designers and innovative clients.</p>
          <div style="margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #f0ad4e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
      `,
      text: 'Welcome to OneDesigner, {{name}}! Visit your dashboard at {{dashboardUrl}}'
    })

    // Designer Approved Template
    this.templates.set('designer-approved', {
      subject: 'Your Designer Profile Has Been Approved!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations, {{name}}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Your designer profile has been approved. You can now start receiving project requests from clients.</p>
          <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #0c4a6e;">Next Steps:</p>
            <ul style="color: #666; margin-top: 10px;">
              <li>Complete your portfolio</li>
              <li>Set your availability</li>
              <li>Wait for matching requests</li>
            </ul>
          </div>
          <div style="margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
          </div>
        </div>
      `,
      text: 'Congratulations {{name}}! Your designer profile has been approved. Visit your dashboard at {{dashboardUrl}}'
    })

    // Designer Rejected Template
    this.templates.set('designer-rejected', {
      subject: 'Update on Your Designer Application',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Application Update</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Thank you for your interest in joining OneDesigner as a designer.</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">After reviewing your application, we've decided not to move forward at this time.</p>
          {{#if reason}}
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;">Feedback: {{reason}}</p>
          </div>
          {{/if}}
          <p style="color: #666; font-size: 14px; margin-top: 20px;">You're welcome to reapply in the future with an updated portfolio.</p>
        </div>
      `,
      text: 'Thank you for applying to OneDesigner. Unfortunately, we cannot approve your application at this time. {{reason}}'
    })

    // Match Found Template
    this.templates.set('match-found', {
      subject: 'New Designer Match Found!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">We Found Your Perfect Designer Match!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Based on your project requirements, we've found a designer with a {{score}}% match score.</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">{{designerName}}</h3>
            <p style="color: #666; margin: 10px 0;">{{designerTitle}}</p>
            <p style="color: #666; margin: 10px 0;">Experience: {{experience}}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="{{matchUrl}}" style="background: #f0ad4e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Match Details</a>
          </div>
        </div>
      `,
      text: 'We found your perfect designer match! {{designerName}} has a {{score}}% match score. View details at {{matchUrl}}'
    })

    // Designer Request Template
    this.templates.set('designer-request', {
      subject: 'New Project Request',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">You Have a New Project Request!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">A client is interested in working with you on their project.</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Project Details</h3>
            <p style="color: #666; margin: 10px 0;"><strong>Type:</strong> {{projectType}}</p>
            <p style="color: #666; margin: 10px 0;"><strong>Budget:</strong> {{budget}}</p>
            <p style="color: #666; margin: 10px 0;"><strong>Timeline:</strong> {{timeline}}</p>
          </div>
          <p style="color: #666; font-size: 14px;">You have 7 days to respond to this request.</p>
          <div style="margin: 30px 0;">
            <a href="{{requestUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Request</a>
          </div>
        </div>
      `,
      text: 'You have a new project request! Project type: {{projectType}}, Budget: {{budget}}. View at {{requestUrl}}'
    })
  }

  /**
   * Get the appropriate sender name based on email type
   */
  private getSenderName(templateName?: string, options?: EmailOptions): string {
    // If there's a specific override in options, use it
    if (options?.fromName) {
      return options.fromName
    }
    
    // Use "OneDesigner" for OTP emails, "Hala from OneDesigner" for all others
    // OTP emails need to be more official/security-focused
    const isOTPEmail = templateName === 'otp' || options?.tags?.type === 'otp'
    return isOTPEmail ? 'OneDesigner' : 'Hala from OneDesigner'
  }

  /**
   * Format the from address with the appropriate sender name
   */
  private formatFromAddress(templateName?: string, options?: EmailOptions): string {
    const senderName = this.getSenderName(templateName, options)
    const emailAddress = process.env.EMAIL_FROM_ADDRESS || 'hello@onedesigner.app'
    return `${senderName} <${emailAddress}>`
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now()
    const minute = Math.floor(now / 60000)
    const count = this.rateLimitCounter.get(minute.toString()) || 0
    
    if (count >= this.config.rateLimit) {
      logger.warn('Email rate limit exceeded', { count, limit: this.config.rateLimit })
      return false
    }
    
    this.rateLimitCounter.set(minute.toString(), count + 1)
    
    // Clean old entries
    for (const [key, _] of this.rateLimitCounter) {
      if (parseInt(key) < minute - 1) {
        this.rateLimitCounter.delete(key)
      }
    }
    
    return true
  }

  /**
   * Replace template variables
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    }
    
    // Handle conditionals (simple implementation)
    result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, key, content) => {
      return variables[key] ? content : ''
    })
    
    return result
  }

  /**
   * Get template by name
   */
  getTemplate(name: string): EmailTemplate | undefined {
    return this.templates.get(name)
  }

  /**
   * Register custom template
   */
  registerTemplate(name: string, template: EmailTemplate): void {
    this.templates.set(name, template)
    logger.info('Email template registered', { name })
  }

  /**
   * Send email using template
   */
  async sendTemplatedEmail(
    templateName: string,
    options: EmailOptions
  ): Promise<EmailResult> {
    try {
      const template = this.templates.get(templateName)
      
      if (!template) {
        throw new Error(`Template '${templateName}' not found`)
      }
      
      // Replace variables in template
      const variables = options.variables || {}
      const subject = this.replaceVariables(template.subject, variables)
      const html = template.html ? this.replaceVariables(template.html, variables) : undefined
      const text = template.text ? this.replaceVariables(template.text, variables) : undefined
      
      // Send email with template name for sender determination
      return this.sendEmail({
        ...options,
        subject,
        html,
        text,
        template: templateName
      })
      
    } catch (error) {
      logger.error('Failed to send templated email', error, { templateName })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send email directly
   */
  async sendEmail(
    options: EmailOptions & {
      subject: string
      html?: string
      text?: string
      react?: React.ReactElement
    }
  ): Promise<EmailResult> {
    try {
      logger.info('Sending email', { 
        to: options.to, 
        subject: options.subject,
        template: options.template 
      })
      
      // Check rate limit
      if (!this.checkRateLimit()) {
        if (this.config.queueEnabled) {
          return this.queueEmail(options)
        } else {
          throw new Error('Rate limit exceeded')
        }
      }
      
      // Determine the appropriate from address based on email type
      const fromAddress = this.formatFromAddress(options.template, options)
      
      // Send via Resend
      const result = await this.resend.emails.send({
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        react: options.react,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        replyTo: options.replyTo || this.config.replyTo,
        attachments: options.attachments,
        tags: options.tags,
        scheduledAt: options.scheduledAt?.toISOString()
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      logger.info('Email sent successfully', { 
        messageId: result.data?.id,
        to: options.to 
      })
      
      return {
        success: true,
        messageId: result.data?.id
      }
      
    } catch (error) {
      logger.error('Failed to send email', error, { to: options.to })
      
      if (Features.USE_ERROR_MANAGER) {
        const errorManager = ErrorManager.getInstance()
        await errorManager.handle(error, {
          operation: 'sendEmail',
          params: { to: options.to, subject: options.subject }
        })
      }
      
      // Retry logic
      if (this.config.queueEnabled) {
        return this.queueEmail(options)
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  /**
   * Queue email for later sending
   */
  private queueEmail(options: any): EmailResult {
    const queueItem: EmailQueueItem = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      template: options.template || 'direct',
      options,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      scheduledAt: options.scheduledAt
    }
    
    this.queue.push(queueItem)
    logger.info('Email queued', { queueId: queueItem.id, to: options.to })
    
    return {
      success: true,
      queueId: queueItem.id
    }
  }

  /**
   * Process email queue
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.queue.length === 0) {
      return
    }
    
    this.processingQueue = true
    
    try {
      const now = new Date()
      const readyItems = this.queue.filter(
        item => item.status === 'pending' && 
        (!item.scheduledAt || item.scheduledAt <= now)
      )
      
      for (const item of readyItems) {
        if (item.attempts >= this.config.maxRetries) {
          item.status = 'failed'
          item.error = 'Max retries exceeded'
          continue
        }
        
        item.status = 'sending'
        item.attempts++
        
        const result = await this.sendEmail(item.options)
        
        if (result.success) {
          item.status = 'sent'
          item.sentAt = new Date()
          
          // Remove from queue
          this.queue = this.queue.filter(i => i.id !== item.id)
        } else {
          item.status = 'pending'
          item.error = result.error
          
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, item.attempts - 1)
          item.scheduledAt = new Date(Date.now() + delay)
        }
      }
    } finally {
      this.processingQueue = false
    }
  }

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueue()
    }, EMAIL_TIMING.QUEUE_PROCESS_INTERVAL) // Process queue at configured interval
    
    logger.info('Email queue processor started')
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number
    sending: number
    sent: number
    failed: number
    total: number
  } {
    const status = {
      pending: 0,
      sending: 0,
      sent: 0,
      failed: 0,
      total: this.queue.length
    }
    
    for (const item of this.queue) {
      status[item.status]++
    }
    
    return status
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = []
    logger.info('Email queue cleared')
  }

  /**
   * Send OTP email with Marc Lou style
   */
  async sendOTPEmail(
    email: string,
    code: string,
    type: 'client' | 'designer' | 'admin',
    purpose: 'login' | 'signup' | 'reset' | 'verify'
  ): Promise<EmailResult> {
    // Use Marc Lou style OTP template
    const emailContent = createOTPEmailMarcStyle({
      otp: code,
      purpose: purpose === 'signup' ? 'sign up' : purpose === 'login' ? 'log in' : purpose
    })
    
    return this.sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: {
        type: 'otp',
        userType: type,
        purpose
      }
    })
  }

  /**
   * Send welcome email with Marc Lou style
   */
  async sendWelcomeEmail(
    email: string,
    name: string,
    userType: 'client' | 'designer',
    dashboardUrl: string
  ): Promise<EmailResult> {
    // Use Marc Lou style template for clients
    if (userType === 'client') {
      const emailContent = createWelcomeClientEmailMarcStyle({
        clientName: name,
        dashboardUrl
      })
      
      return this.sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        tags: {
          type: 'welcome',
          userType
        }
      })
    }
    
    // Use default template for designers (or could use Marc style too)
    return this.sendTemplatedEmail('welcome', {
      to: email,
      variables: {
        name,
        dashboardUrl
      },
      tags: {
        type: 'welcome',
        userType
      }
    })
  }

  /**
   * Send designer approval email with Marc Lou style
   */
  async sendDesignerApprovalEmail(
    email: string,
    name: string,
    approved: boolean,
    reason?: string
  ): Promise<EmailResult> {
    if (approved) {
      // Use Marc Lou style for approval
      const emailContent = createDesignerApprovalEmailMarcStyle({
        designerName: name,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
      })
      
      return this.sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        tags: {
          type: 'designer-decision',
          decision: 'approved'
        }
      })
    }
    
    // Use default template for rejection (can be updated to Marc style later)
    return this.sendTemplatedEmail('designer-rejected', {
      to: email,
      variables: {
        name,
        reason,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
      },
      tags: {
        type: 'designer-decision',
        decision: 'rejected'
      }
    })
  }

  /**
   * Get configuration
   */
  getConfig(): EmailConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...config }
    logger.info('Email configuration updated', { config: this.config })
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()

// Export convenience functions for migration
export const email = {
  send: (options: any) => emailService.sendEmail(options),
  
  sendTemplate: (template: string, options: EmailOptions) =>
    emailService.sendTemplatedEmail(template, options),
  
  sendOTP: (email: string, code: string, type: any, purpose: any) =>
    emailService.sendOTPEmail(email, code, type, purpose),
  
  sendWelcome: (email: string, name: string, type: any, url: string) =>
    emailService.sendWelcomeEmail(email, name, type, url),
  
  sendApproval: (email: string, name: string, approved: boolean, reason?: string) =>
    emailService.sendDesignerApprovalEmail(email, name, approved, reason),
  
  getQueueStatus: () => emailService.getQueueStatus(),
  
  registerTemplate: (name: string, template: EmailTemplate) =>
    emailService.registerTemplate(name, template)
}