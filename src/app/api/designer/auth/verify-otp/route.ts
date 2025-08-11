import { NextRequest, NextResponse } from 'next/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createSession } from '@/lib/auth/session-handlers'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { AUTH_COOKIES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { email, token, isSignup = false } = await request.json()

    if (!email || !token) {
      return apiResponse.error('Email and token are required')
    }

    // Verify OTP using our custom system
    const isValid = await verifyCustomOTP(email, token)

    if (!isValid) {
      return apiResponse.unauthorized('Invalid or expired code')
    }

    // Check if designer exists
    const supabase = createServiceClient()
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('id, email, first_name, last_name, is_approved, is_verified')
      .eq('email', email)
      .single()

    let designerId = existingDesigner?.id

    // Handle login vs signup logic
    if (!existingDesigner) {
      // No designer exists
      if (!isSignup) {
        // This is a login attempt but no account exists
        console.log('Login attempt for non-existent designer:', email)
        return apiResponse.unauthorized('No designer account found with this email. Please sign up first.')
      }
      
      // This is a signup - create new designer
      const { data: newDesigner, error: createError } = await supabase
        .from('designers')
        .insert({
          email,
          first_name: '', // Will be filled in application form
          last_name: '',  // Will be filled in application form
          last_initial: '', // Required field - will be set when last_name is provided
          title: '', // Professional title - will be filled in application form
          city: '', // Location - will be filled in application form
          country: '', // Location - will be filled in application form
          years_experience: '', // Experience - will be filled in application form
          is_verified: true,
          is_approved: false,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating designer:', createError)
        return apiResponse.error('Failed to create designer account')
      }

      designerId = newDesigner.id
    } else {
      // Designer exists
      if (isSignup) {
        // This is a signup attempt but account already exists
        return apiResponse.error('An account with this email already exists. Please log in instead.')
      }
      
      // This is a login - check if verified and approved
      if (!existingDesigner.is_verified) {
        return apiResponse.forbidden('Your account is pending verification')
      }
    }

    // Create designer session
    console.log('📝 Creating designer session for:', email, 'with ID:', designerId)
    
    // Set the cookie directly to ensure it's properly created
    const cookieStore = cookies()
    const sessionData = {
      email,
      userId: designerId,
      designerId,
      userType: 'designer',
      authenticatedAt: new Date().toISOString()
    }
    
    cookieStore.set(AUTH_COOKIES.DESIGNER, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    console.log('✅ Designer session created successfully with cookie:', AUTH_COOKIES.DESIGNER)

    // Return success
    return apiResponse.success({ 
      success: true,
      message: 'OTP verified successfully',
      designer: {
        id: designerId,
        email,
        isExisting: !!existingDesigner
      }
    })
  } catch (error) {
    console.error('Error verifying designer OTP:', error)
    return handleApiError(error, 'designer/auth/verify-otp')
  }
}