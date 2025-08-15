import { NextRequest, NextResponse } from 'next/server'
import { designerService } from '@/lib/database/designer-service'
import { logger } from '@/lib/core/logging-service'
import { validateSession } from '@/lib/auth/session-handlers'
import { z } from 'zod'

// Define the validation schema for the form
const designerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  profilePicture: z.string().min(1, 'Profile picture or logo is required'), // Now required
  title: z.string().min(1, 'Professional title is required'),
  portfolioUrl: z.string().min(1, 'Portfolio URL is required').refine((val) => {
    try {
      // Accept URLs with or without protocol
      const urlToTest = val.match(/^https?:\/\//i) ? val : `https://${val}`
      new URL(urlToTest)
      return true
    } catch {
      return false
    }
  }, 'Invalid URL format'),
  dribbbleUrl: z.string().optional().nullable().refine((val) => {
    if (!val || val === '') return true
    try {
      const urlToTest = val.match(/^https?:\/\//i) ? val : `https://${val}`
      new URL(urlToTest)
      return true
    } catch {
      return false
    }
  }, 'Invalid URL format'),
  behanceUrl: z.string().optional().nullable().refine((val) => {
    if (!val || val === '') return true
    try {
      const urlToTest = val.match(/^https?:\/\//i) ? val : `https://${val}`
      new URL(urlToTest)
      return true
    } catch {
      return false
    }
  }, 'Invalid URL format'),
  linkedinUrl: z.string().optional().nullable().refine((val) => {
    if (!val || val === '') return true
    try {
      const urlToTest = val.match(/^https?:\/\//i) ? val : `https://${val}`
      new URL(urlToTest)
      return true
    } catch {
      return false
    }
  }, 'Invalid URL format'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  availability: z.enum(['immediate', '1-2weeks', '2-4weeks', '1-2months', 'unavailable']),
  bio: z.string().min(500, 'Bio must be at least 500 characters').max(1000, 'Bio must be less than 1000 characters'), // Updated limits
  portfolioImages: z.array(z.string()).max(3, 'Maximum 3 portfolio images').optional(),
})

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
    
    // Validate input using centralized schema
    const validationResult = designerFormSchema.safeParse(body)
    if (!validationResult.success) {
      logger.error('Validation errors:', validationResult.error.errors)
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    
    const validatedData = validationResult.data
    
    // Ensure email matches authenticated user
    if (!designerEmail) {
      logger.error('No email found in session')
      return NextResponse.json(
        { error: 'Session email not found. Please log in again.' },
        { status: 401 }
      )
    }
    
    // Use centralized service to save designer data
    const result = await designerService.upsertDesignerFromForm(designerEmail, validatedData)
    
    if (!result.success) {
      logger.error('Failed to save designer data:', result.error)
      return NextResponse.json(
        { 
          error: result.error || 'Failed to save application data',
          details: 'Database operation failed'
        },
        { status: 500 }
      )
    }
    
    logger.info('✅ Designer application saved successfully:', {
      email: designerEmail,
      isUpdate: result.isUpdate
    })
    
    return NextResponse.json({
      success: true,
      message: result.isUpdate ? 'Application updated successfully' : 'Application submitted successfully',
      requiresVerification: false
    })
    
  } catch (error) {
    logger.error('Designer apply error:', error)
    
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}