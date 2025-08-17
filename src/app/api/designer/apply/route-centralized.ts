import { NextRequest, NextResponse } from 'next/server'
import { designerService } from '@/lib/database/designer-service'
import { logger } from '@/lib/core/logging-service'
import { validateSession } from '@/lib/auth/session-handlers'
import { 
  DESIGNER_FIELDS,
  getFieldsForContext,
  validateField 
} from '@/lib/config/designer-fields'
import { transformDesignerApiToUI } from '@/lib/utils/designer-data-transformer'

export async function POST(request: NextRequest) {
  try {
    // First, validate the designer session
    const sessionResult = await validateSession('DESIGNER')
    if (!sessionResult.valid || !sessionResult.user) {
      logger.warn('Unauthorized designer apply attempt - no valid session')
      return NextResponse.json(
        { error: 'Please log in as a designer to submit an application' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const designerEmail = sessionResult.user.email || sessionResult.session?.email
    
    logger.info('Received designer application from authenticated user:', {
      email: designerEmail,
      userId: sessionResult.user?.id
    })
    
    // Validate input using centralized field configuration
    const applicationFields = getFieldsForContext('application')
    const errors: Array<{ field: string; message: string }> = []
    
    // Validate each field using centralized validation
    applicationFields.forEach(field => {
      const value = body[field.key]
      const validation = validateField(field.key, value)
      
      if (!validation.valid) {
        errors.push({
          field: field.key,
          message: validation.error || `${field.label} is invalid`
        })
      }
    })
    
    if (errors.length > 0) {
      logger.error('Validation errors:', errors)
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: errors
        },
        { status: 400 }
      )
    }
    
    // Ensure email matches authenticated user
    if (designerEmail && body.email && body.email !== designerEmail) {
      logger.warn('Email mismatch in application:', {
        sessionEmail: designerEmail,
        submittedEmail: body.email
      })
      return NextResponse.json(
        { error: 'Email mismatch. Please use your registered email.' },
        { status: 400 }
      )
    }
    
    // Use session email if not provided in body
    const finalEmail = body.email || designerEmail
    
    // Format URLs properly (add https:// if missing)
    const formatUrl = (url: string | null | undefined) => {
      if (!url || url === '') return null
      if (!url.match(/^https?:\/\//i)) {
        return `https://${url}`
      }
      return url
    }
    
    // Prepare data for database (already in snake_case from transformer)
    const designerData = {
      ...body,
      email: finalEmail,
      portfolio_url: formatUrl(body.portfolio_url),
      dribbble_url: formatUrl(body.dribbble_url),
      behance_url: formatUrl(body.behance_url),
      linkedin_url: formatUrl(body.linkedin_url),
      website_url: formatUrl(body.website_url),
      // Map availability value if needed
      availability: body.availability === '1_week' ? '1-2weeks' :
                    body.availability === '2_weeks' ? '2-4weeks' :
                    body.availability === '1_month' ? '1-2months' :
                    body.availability === 'not_available' ? 'unavailable' :
                    body.availability,
      // Set additional fields
      is_verified: true, // Already verified via OTP
      is_approved: false, // Needs admin approval
      last_initial: body.last_name ? body.last_name[0].toUpperCase() : '',
      // Handle profile picture/avatar
      avatar_url: body.avatar_url || body.profile_picture || null,
      // Add rating and stats with defaults
      rating: 0,
      total_projects: 0,
      // Handle years experience - convert from range to number
      years_experience: body.years_experience === '0-2' ? 1 :
                       body.years_experience === '2-5' ? 3 :
                       body.years_experience === '5-8' ? 6 :
                       body.years_experience === '8-12' ? 10 :
                       body.years_experience === '12+' ? 15 : 0,
    }
    
    // Create or update designer profile
    const designer = await designerService.createOrUpdateDesigner(designerData)
    
    if (!designer) {
      throw new Error('Failed to create designer profile')
    }
    
    logger.info('Designer application submitted successfully:', {
      designerId: designer.id,
      email: designer.email
    })
    
    // Transform response to UI format
    const uiResponse = transformDesignerApiToUI(designer)
    
    return NextResponse.json({ 
      success: true, 
      designer: uiResponse,
      message: 'Application submitted successfully! Our team will review it shortly.' 
    })
    
  } catch (error) {
    logger.error('Designer apply error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to submit application',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}