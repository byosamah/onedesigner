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
    logger.info('Received designer application from authenticated user:', sessionResult.user.email)
    
    // Validate input
    const validatedData = designerApplicationSchema.parse(body)
    
    const supabase = createClient()
    
    // Get the designer using the authenticated user's email (from session)
    const designerEmail = sessionResult.user.email || sessionResult.session?.email
    
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('id, email')
      .eq('email', designerEmail)
      .single()
      
    let designerId: string
    
    if (!existingDesigner) {
      logger.error('Designer not found for authenticated email:', designerEmail)
      
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
    const updateData = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      last_initial: validatedData.lastName.charAt(0).toUpperCase(),
      phone: validatedData.phone || '',
      title: validatedData.title,
      years_experience: validatedData.yearsExperience,
      website_url: validatedData.websiteUrl,
      project_price_from: parseInt(validatedData.projectPriceFrom),
      project_price_to: parseInt(validatedData.projectPriceTo),
      city: validatedData.city,
      country: validatedData.country,
      timezone: validatedData.timezone,
      availability: validatedData.availability,
      styles: validatedData.styles,
      project_types: validatedData.projectTypes,
      industries: validatedData.industries,
      bio: validatedData.bio,
      portfolio_url: validatedData.portfolioUrl || '',
      dribbble_url: validatedData.dribbbleUrl || '',
      behance_url: validatedData.behanceUrl || '',
      linkedin_url: validatedData.linkedinUrl || '',
      specializations: validatedData.specializations,
      software_skills: validatedData.softwareSkills,
      previous_clients: validatedData.previousClients || '',
      project_preferences: validatedData.projectPreferences,
      working_style: validatedData.workingStyle,
      communication_style: validatedData.communicationStyle,
      remote_experience: validatedData.remoteExperience,
      team_collaboration: validatedData.teamCollaboration || '',
      is_approved: false, // Reset approval status since they updated their profile
      updated_at: new Date().toISOString()
    }
    
    logger.info('📝 Updating designer with data:', updateData)
    
    const { error: updateError } = await supabase
      .from('designers')
      .update(updateData)
      .eq('id', designerId)
    
    if (updateError) {
      logger.error('Failed to update designer profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to save application data' },
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