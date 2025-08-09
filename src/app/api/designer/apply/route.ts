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
    
    // Check if designer already exists
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('id')
      .eq('email', validatedData.email)
      .single()
      
    if (existingDesigner) {
      return NextResponse.json(
        { error: 'Designer with this email already exists' },
        { status: 400 }
      )
    }
    
    // Generate and store OTP
    const otp = await createCustomOTP(validatedData.email)
    
    // Send OTP email
    const { subject, html, text } = otpEmailTemplate({
      otp,
      name: validatedData.firstName,
      action: 'verify your designer application'
    })
    
    try {
      await sendEmail({
        to: validatedData.email,
        subject,
        html,
        text
      })
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      requiresVerification: true
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