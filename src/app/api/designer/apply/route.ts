import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createCustomOTP } from '@/lib/auth/custom-otp'
import { sendOTPEmail } from '@/lib/email/send-otp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'title', 'yearsExperience', 'city', 'country', 'timezone', 'styles', 'projectTypes', 'bio']
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const supabase = createServiceClient()

    // Check if designer already exists
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('id, email')
      .eq('email', formData.email)
      .single()

    if (existingDesigner) {
      return NextResponse.json(
        { error: 'A designer with this email already exists' },
        { status: 409 }
      )
    }

    // Store application data in session storage (will save after verification)
    // For now, we'll send OTP for verification
    const otp = await createCustomOTP(formData.email)
    await sendOTPEmail(formData.email, otp)

    // Store application temporarily (you might want to use Redis or a temporary table)
    // For simplicity, we'll return the data to be stored client-side
    return NextResponse.json({ 
      success: true,
      message: 'Please check your email for verification code',
      applicationData: {
        ...formData,
        pendingVerification: true
      }
    })
  } catch (error) {
    console.error('Error in designer application:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    )
  }
}