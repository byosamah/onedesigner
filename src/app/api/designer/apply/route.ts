import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
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
    
    // Check if this is an update submission (has designerId)
    const isUpdate = body.designerId && body.updateToken
    logger.info('Validated application data successfully')
    
    // Use service client for database operations to avoid permission issues
    const supabase = createServiceClient()
    
    // Get the designer using the authenticated user's email (from session)
    const designerEmail = sessionResult.user.email || sessionResult.session?.email
    
    logger.info('Looking for designer with email:', designerEmail)
    
    // First, let's make sure we have a valid email
    if (!designerEmail) {
      logger.error('No email found in session:', sessionResult)
      return NextResponse.json(
        { error: 'Session email not found. Please log in again.' },
        { status: 401 }
      )
    }
    
    const { data: existingDesigner, error: findError } = await supabase
      .from('designers')
      .select('id, email')
      .eq('email', designerEmail)
      .single()
      
    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
      logger.error('Error finding designer:', {
        error: findError,
        errorCode: findError.code,
        errorMessage: findError.message,
        email: designerEmail
      })
    }
    
    logger.info('Designer lookup result:', {
      found: !!existingDesigner,
      designerId: existingDesigner?.id,
      email: designerEmail
    })
      
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
          title: validatedData.title || '', // Add required field
          city: validatedData.city || '', // Add required field
          country: validatedData.country || '', // Add required field
          years_experience: validatedData.yearsExperience || '', // Add required field
          is_approved: false,
          is_verified: true, // They're already authenticated
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()
      
      if (createError) {
        logger.error('Failed to create designer record:', {
          error: createError,
          errorMessage: createError.message,
          errorCode: createError.code,
          errorDetails: createError.details,
          attemptedData: {
            email: designerEmail,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName
          }
        })
        return NextResponse.json(
          { 
            error: 'Failed to create designer account',
            details: createError.message || 'Database error',
            code: createError.code
          },
          { status: 500 }
        )
      }
      
      logger.info('Created new designer record for authenticated user with ID:', newDesigner.id)
      designerId = newDesigner.id
    } else {
      designerId = existingDesigner.id
    }
    
    // If this is an update submission from rejection, use the provided designer ID
    if (isUpdate && body.designerId) {
      designerId = body.designerId
      logger.info('Updating application for rejected designer:', designerId)
    }
    
    // Update the designer record with all the application data
    // Note: Some fields like project_types, specializations, software_skills are stored in normalized tables
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
      // PostgreSQL array fields that DO exist in the designers table
      styles: Array.isArray(validatedData.styles) ? validatedData.styles : [],
      industries: Array.isArray(validatedData.industries) ? validatedData.industries : [],
      bio: validatedData.bio,
      portfolio_url: validatedData.portfolioUrl || null,
      dribbble_url: validatedData.dribbbleUrl || null,
      behance_url: validatedData.behanceUrl || null,
      linkedin_url: validatedData.linkedinUrl || null,
      previous_clients: validatedData.previousClients || null,
      project_preferences: validatedData.projectPreferences,
      working_style: validatedData.workingStyle,
      communication_style: validatedData.communicationStyle,
      remote_experience: validatedData.remoteExperience,
      team_collaboration: validatedData.teamCollaboration || null,
      is_approved: false, // Reset approval status since they updated their profile
      updated_at: new Date().toISOString(),
      // Clear update token if this is an update submission
      ...(isUpdate ? { 
        update_token: null, 
        update_token_expires: null,
        rejection_reason: null 
      } : {})
    }
    
    // Note: We'll handle project_types, specializations, and software_skills in normalized tables after updating the main record
    
    // Handle profile picture if provided - store in avatar_url for now
    if (validatedData.profilePicture) {
      logger.info('Profile picture provided, storing as base64 data in avatar_url')
      updateData.avatar_url = validatedData.profilePicture // Store base64 directly in existing column
    }
    
    // Store portfolio images in the portfolio_image_1, portfolio_image_2, portfolio_image_3 columns
    if (validatedData.portfolioImages && validatedData.portfolioImages.length > 0) {
      logger.info(`Portfolio images provided: ${validatedData.portfolioImages.length} images`)
      
      // Add portfolio images to the update data (up to 3 images)
      if (validatedData.portfolioImages[0]) {
        updateData.portfolio_image_1 = validatedData.portfolioImages[0]
      }
      if (validatedData.portfolioImages[1]) {
        updateData.portfolio_image_2 = validatedData.portfolioImages[1]
      }
      if (validatedData.portfolioImages[2]) {
        updateData.portfolio_image_3 = validatedData.portfolioImages[2]
      }
      
      logger.info('Portfolio images will be stored in database columns')
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
    
    // Now handle the normalized tables for project_types, specializations, and software_skills
    // First, delete existing records to replace them with new ones
    logger.info('Updating normalized tables for designer skills and preferences')
    
    // Delete existing project types
    await supabase
      .from('designer_project_types')
      .delete()
      .eq('designer_id', designerId)
    
    // Insert new project types
    if (validatedData.projectTypes && validatedData.projectTypes.length > 0) {
      const projectTypeRecords = validatedData.projectTypes.map(type => ({
        designer_id: designerId,
        project_type: type
      }))
      
      const { error: projectTypesError } = await supabase
        .from('designer_project_types')
        .insert(projectTypeRecords)
      
      if (projectTypesError) {
        logger.warn('Failed to insert project types:', projectTypesError)
      }
    }
    
    // Delete existing specializations
    await supabase
      .from('designer_specializations')
      .delete()
      .eq('designer_id', designerId)
    
    // Insert new specializations
    if (validatedData.specializations && validatedData.specializations.length > 0) {
      const specializationRecords = validatedData.specializations.map(spec => ({
        designer_id: designerId,
        specialization: spec
      }))
      
      const { error: specializationsError } = await supabase
        .from('designer_specializations')
        .insert(specializationRecords)
      
      if (specializationsError) {
        logger.warn('Failed to insert specializations:', specializationsError)
      }
    }
    
    // Delete existing software skills
    await supabase
      .from('designer_software_skills')
      .delete()
      .eq('designer_id', designerId)
    
    // Insert new software skills
    if (validatedData.softwareSkills && validatedData.softwareSkills.length > 0) {
      const softwareRecords = validatedData.softwareSkills.map(software => ({
        designer_id: designerId,
        software: software
      }))
      
      const { error: softwareError } = await supabase
        .from('designer_software_skills')
        .insert(softwareRecords)
      
      if (softwareError) {
        logger.warn('Failed to insert software skills:', softwareError)
      }
    }
    
    // Also update designer_styles table (even though styles array exists)
    await supabase
      .from('designer_styles')
      .delete()
      .eq('designer_id', designerId)
    
    if (validatedData.styles && validatedData.styles.length > 0) {
      const styleRecords = validatedData.styles.map(style => ({
        designer_id: designerId,
        style: style
      }))
      
      const { error: stylesError } = await supabase
        .from('designer_styles')
        .insert(styleRecords)
      
      if (stylesError) {
        logger.warn('Failed to insert styles in normalized table:', stylesError)
      }
    }
    
    // Update designer_industries table
    await supabase
      .from('designer_industries')
      .delete()
      .eq('designer_id', designerId)
    
    if (validatedData.industries && validatedData.industries.length > 0) {
      const industryRecords = validatedData.industries.map(industry => ({
        designer_id: designerId,
        industry: industry
      }))
      
      const { error: industriesError } = await supabase
        .from('designer_industries')
        .insert(industryRecords)
      
      if (industriesError) {
        logger.warn('Failed to insert industries in normalized table:', industriesError)
      }
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