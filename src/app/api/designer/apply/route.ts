import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { otpEmailTemplate } from '@/lib/email/templates/otp'
import { createCustomOTP } from '@/lib/auth/custom-otp'
import { logger } from '@/lib/core/logging-service'
import { validateSession } from '@/lib/auth/session-handlers'

const designerApplicationSchema = z.object({
  // Step 1: Basic Info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  profilePicture: z.string().optional(), // Base64 image data
  
  // Step 2: Professional Info
  title: z.string().min(1),
  yearsExperience: z.string().min(1),
  websiteUrl: z.string().transform((url) => {
    // Add https:// if no protocol is provided
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }).refine((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid URL format' }),
  projectPriceFrom: z.string().min(1),
  projectPriceTo: z.string().min(1),
  
  // Step 3: Location & Availability
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().min(1),
  availability: z.string().min(1),
  
  // Step 4: Style & Expertise
  styles: z.array(z.string()).min(1),
  projectTypes: z.array(z.string()).min(1),
  industries: z.array(z.string()).min(1).max(5),
  bio: z.string().min(100).max(500),

  // Step 5: Enhanced Portfolio & Skills
  portfolioUrl: z.string().optional().transform(val => {
    if (!val || val === '') return '';
    return val;
  }).refine(val => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL format'
  }),
  dribbbleUrl: z.string().optional().transform(val => {
    if (!val || val === '') return '';
    return val;
  }).refine(val => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL format'
  }),
  behanceUrl: z.string().optional().transform(val => {
    if (!val || val === '') return '';
    return val;
  }).refine(val => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL format'
  }),
  linkedinUrl: z.string().optional().transform(val => {
    if (!val || val === '') return '';
    return val;
  }).refine(val => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL format'
  }),
  specializations: z.array(z.string()).min(1),
  softwareSkills: z.array(z.string()).min(1),
  
  // Step 6: Experience & Preferences
  previousClients: z.string().optional(),
  projectPreferences: z.string().min(1),
  workingStyle: z.string().min(1),
  communicationStyle: z.string().min(1),
  remoteExperience: z.string().min(1),
  teamCollaboration: z.string().optional(),
  
  // Additional fields that might be sent but not stored directly
  portfolioImages: z.array(z.string()).optional(), // Base64 images array
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
    logger.info('Received designer application from authenticated user:', {
      email: sessionResult.user?.email,
      userId: sessionResult.user?.id,
      sessionEmail: sessionResult.session?.email
    })
    
    // Validate input
    const validatedData = designerApplicationSchema.parse(body)
    logger.info('Validated application data successfully')
    
    const supabase = createClient()
    
    // Get the designer using the authenticated user's email (from session)
    const designerEmail = sessionResult.user.email || sessionResult.session?.email
    
    logger.info('Looking for designer with email:', designerEmail)
    
    const { data: existingDesigner, error: findError } = await supabase
      .from('designers')
      .select('id, email')
      .eq('email', designerEmail)
      .single()
      
    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
      logger.error('Error finding designer:', {
        error: findError,
        email: designerEmail
      })
    }
      
    let designerId: string
    
    if (!existingDesigner) {
      logger.warn('Designer not found for authenticated email:', designerEmail)
      
      // This shouldn't happen since they're authenticated, but let's create the designer record if needed
      const { data: newDesigner, error: createError } = await supabase
        .from('designers')
        .insert({
          email: designerEmail,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          last_initial: validatedData.lastName.charAt(0).toUpperCase(),
          is_approved: false,
          is_verified: true // They're already authenticated
        })
        .select('id')
        .single()
      
      if (createError) {
        logger.error('Failed to create designer record:', createError)
        return NextResponse.json(
          { error: 'Failed to create designer account' },
          { status: 500 }
        )
      }
      
      logger.info('Created new designer record for authenticated user with ID:', newDesigner.id)
      designerId = newDesigner.id
    } else {
      designerId = existingDesigner.id
    }
    
    // Update the designer record with all the application data
    // Ensure arrays are properly formatted for PostgreSQL
    // Note: profilePicture is handled separately as it's base64 data
    const updateData: any = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      last_initial: validatedData.lastName.charAt(0).toUpperCase(),
      phone: validatedData.phone || null,
      title: validatedData.title,
      years_experience: validatedData.yearsExperience,
      website_url: validatedData.websiteUrl,
      project_price_from: parseInt(validatedData.projectPriceFrom.toString().replace(/[^0-9]/g, '')) || 0,
      project_price_to: parseInt(validatedData.projectPriceTo.toString().replace(/[^0-9]/g, '')) || 0,
      city: validatedData.city,
      country: validatedData.country,
      timezone: validatedData.timezone,
      availability: validatedData.availability,
      // PostgreSQL array fields - wrap in {} format if needed
      styles: Array.isArray(validatedData.styles) ? validatedData.styles : [],
      project_types: Array.isArray(validatedData.projectTypes) ? validatedData.projectTypes : [],
      industries: Array.isArray(validatedData.industries) ? validatedData.industries : [],
      bio: validatedData.bio,
      portfolio_url: validatedData.portfolioUrl || null,
      dribbble_url: validatedData.dribbbleUrl || null,
      behance_url: validatedData.behanceUrl || null,
      linkedin_url: validatedData.linkedinUrl || null,
      specializations: Array.isArray(validatedData.specializations) ? validatedData.specializations : [],
      software_skills: Array.isArray(validatedData.softwareSkills) ? validatedData.softwareSkills : [],
      previous_clients: validatedData.previousClients || null,
      project_preferences: validatedData.projectPreferences,
      working_style: validatedData.workingStyle,
      communication_style: validatedData.communicationStyle,
      remote_experience: validatedData.remoteExperience,
      team_collaboration: validatedData.teamCollaboration || null,
      is_approved: false, // Reset approval status since they updated their profile
      updated_at: new Date().toISOString()
    }
    
    // Handle profile picture if provided (for now, we'll skip it as we need proper image handling)
    // TODO: Implement proper image upload to storage service
    if (validatedData.profilePicture) {
      logger.info('Profile picture provided but skipped - needs proper storage implementation')
      // In the future, upload to Supabase Storage or similar service
      // updateData.profile_picture_url = uploadedImageUrl
    }
    
    logger.info('📝 Updating designer with ID:', designerId)
    logger.info('Update data:', JSON.stringify(updateData, null, 2))
    
    const { data: updatedDesigner, error: updateError } = await supabase
      .from('designers')
      .update(updateData)
      .eq('id', designerId)
      .select()
      .single()
    
    if (updateError) {
      logger.error('Failed to update designer profile:', {
        error: updateError,
        designerId,
        email: designerEmail,
        errorMessage: updateError.message,
        errorCode: updateError.code,
        errorDetails: updateError.details,
        errorHint: updateError.hint,
        updateData: JSON.stringify(updateData)
      })
      
      // More specific error messages based on error code
      let errorMessage = 'Failed to save application data'
      if (updateError.code === '22P02') {
        errorMessage = 'Invalid data format. Please check your input and try again.'
      } else if (updateError.code === '23502') {
        errorMessage = 'Missing required fields. Please complete all required information.'
      } else if (updateError.message?.includes('array')) {
        errorMessage = 'Invalid selection format. Please refresh and try again.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: updateError.message || 'Database update failed',
          code: updateError.code,
          hint: updateError.hint
        },
        { status: 500 }
      )
    }
    
    if (!updatedDesigner) {
      logger.error('Designer update succeeded but no data returned', { designerId })
      return NextResponse.json(
        { error: 'Update succeeded but could not verify the changes' },
        { status: 500 }
      )
    }
    
    logger.info('✅ Designer profile updated successfully for:', validatedData.email)
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      requiresVerification: false
    })
    
  } catch (error) {
    logger.error('Designer apply error:', error)
    
    if (error instanceof z.ZodError) {
      logger.error('Validation errors:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}