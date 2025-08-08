import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

const enhancedDesignerSchema = z.object({
  // Basic Info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  
  // Professional Identity
  title: z.string().min(1),
  yearsExperience: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().optional(),
  portfolioLink: z.string().url(),
  
  // Design Philosophy & Expertise
  designPhilosophy: z.string().min(10),
  primaryCategories: z.array(z.string()).min(1).max(3),
  secondaryCategories: z.array(z.string()).optional(),
  styleKeywords: z.array(z.string()).min(3).max(5),
  
  // Work Preferences
  preferredIndustries: z.array(z.string()).min(1),
  preferredProjectSizes: z.array(z.string()).min(1),
  turnaroundTimes: z.object({
    logo: z.number(),
    website: z.number(),
    branding: z.number()
  }),
  revisionRoundsIncluded: z.number(),
  
  // Tools & Skills
  expertTools: z.array(z.string()).min(1),
  specialSkills: z.string().optional(),
  
  // Collaboration & Availability
  collaborationStyle: z.string(),
  currentAvailability: z.string(),
  idealClientTypes: z.array(z.string()),
  dreamProjectDescription: z.string().min(10)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Enhanced designer application:', body)

    // Validate input
    const validatedData = enhancedDesignerSchema.parse(body)

    const supabase = createClient()

    // Check if designer already exists
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingDesigner) {
      return NextResponse.json(
        { error: 'A designer with this email already exists' },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedCode = await bcrypt.hash(verificationCode, 10)

    // Create designer with enhanced profile
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        title: validatedData.title,
        years_experience: parseInt(validatedData.yearsExperience),
        city: validatedData.city,
        country: validatedData.country,
        timezone: validatedData.timezone || 'UTC',
        website_url: validatedData.portfolioLink,
        
        // Enhanced fields stored in JSONB
        design_philosophy: validatedData.designPhilosophy,
        primary_categories: validatedData.primaryCategories,
        secondary_categories: validatedData.secondaryCategories || [],
        style_keywords: validatedData.styleKeywords,
        preferred_industries: validatedData.preferredIndustries,
        preferred_project_sizes: validatedData.preferredProjectSizes,
        turnaround_times: validatedData.turnaroundTimes,
        revision_rounds_included: validatedData.revisionRoundsIncluded,
        expert_tools: validatedData.expertTools,
        special_skills: validatedData.specialSkills || '',
        collaboration_style: validatedData.collaborationStyle,
        current_availability: validatedData.currentAvailability,
        ideal_client_types: validatedData.idealClientTypes,
        dream_project_description: validatedData.dreamProjectDescription,
        
        // Default values
        is_verified: false,
        is_approved: false,
        verification_code: hashedCode,
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        hourly_rate: 0,
        minimum_project_size: 1000,
        rating: 5,
        total_projects: 0,
        response_time_hours: 24,
        on_time_delivery_rate: 100,
        client_satisfaction_rate: 100,
        repeat_client_rate: 0
      })
      .select()
      .single()

    if (designerError) {
      console.error('Designer creation error:', designerError)
      return NextResponse.json(
        { error: 'Failed to create designer profile' },
        { status: 500 }
      )
    }

    console.log('✅ Enhanced designer profile created:', designer.id)

    // Send verification email (in production, use email service)
    console.log(`📧 Verification code for ${validatedData.email}: ${verificationCode}`)
    
    // TODO: Send actual email with Resend
    // await sendVerificationEmail(validatedData.email, verificationCode)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. Check your email for verification code.',
      designer: {
        id: designer.id,
        email: designer.email,
        firstName: designer.first_name,
        lastName: designer.last_name
      }
    })

  } catch (error) {
    console.error('Enhanced designer application error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}