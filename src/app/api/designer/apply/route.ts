import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { otpEmailTemplate } from '@/lib/email/templates/otp'
import { createCustomOTP } from '@/lib/auth/custom-otp'

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
    const body = await request.json()
    console.log('Received designer application:', body)
    
    // Validate input
    const validatedData = designerApplicationSchema.parse(body)
    
    const supabase = createClient()
    
    // Check if designer exists (they should, since they're authenticated)
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('id')
      .eq('email', validatedData.email)
      .single()
      
    if (!existingDesigner) {
      console.error('Designer not found for authenticated user:', validatedData.email)
      return NextResponse.json(
        { error: 'Designer account not found. Please sign up first.' },
        { status: 400 }
      )
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
    
    console.log('📝 Updating designer with data:', updateData)
    
    const { error: updateError } = await supabase
      .from('designers')
      .update(updateData)
      .eq('id', existingDesigner.id)
    
    if (updateError) {
      console.error('Failed to update designer profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to save application data' },
        { status: 500 }
      )
    }
    
    console.log('✅ Designer profile updated successfully for:', validatedData.email)
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      requiresVerification: false
    })
    
  } catch (error) {
    console.error('Designer apply error:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
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