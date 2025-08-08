import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

const designerApplicationSchema = z.object({
  // Step 1: Basic Info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  
  // Step 2: Professional Info
  title: z.string().min(1),
  yearsExperience: z.string().min(1),
  websiteUrl: z.string().url(),
  hourlyRate: z.string().min(1),
  
  // Step 3: Location & Availability
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().min(1),
  availability: z.string().min(1),
  
  // Step 4: Style & Expertise
  styles: z.array(z.string()).min(1),
  projectTypes: z.array(z.string()).min(1),
  industries: z.array(z.string()).min(1).max(5),
  bio: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedCode = await bcrypt.hash(verificationCode, 10)
    
    // Create designer record
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        title: validatedData.title,
        years_experience: validatedData.yearsExperience,
        website_url: validatedData.websiteUrl,
        hourly_rate: parseFloat(validatedData.hourlyRate),
        city: validatedData.city,
        country: validatedData.country,
        timezone: validatedData.timezone,
        availability: validatedData.availability,
        styles: validatedData.styles,
        project_types: validatedData.projectTypes,
        industries: validatedData.industries,
        bio: validatedData.bio,
        verification_code: hashedCode,
        verification_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        is_verified: false,
        is_approved: false
      })
      .select()
      .single()
      
    if (designerError) {
      console.error('Error creating designer:', designerError)
      return NextResponse.json(
        { error: 'Failed to create designer application' },
        { status: 500 }
      )
    }
    
    // Send verification email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/designer/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: validatedData.email,
        code: verificationCode,
        firstName: validatedData.firstName
      })
    })
    
    if (!emailResponse.ok) {
      console.error('Failed to send verification email')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      requiresVerification: true
    })
    
  } catch (error) {
    console.error('Designer apply error:', error)
    
    if (error instanceof z.ZodError) {
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