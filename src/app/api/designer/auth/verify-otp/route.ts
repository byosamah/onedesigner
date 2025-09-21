import { NextRequest, NextResponse } from 'next/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createSession } from '@/lib/auth/session-handlers'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return apiResponse.error('Email and token are required')
    }

    // Verify OTP using our custom system
    const isValid = await verifyCustomOTP(email, token)

    if (!isValid) {
      return apiResponse.unauthorized('Invalid or expired code')
    }

    // Check if designer exists or create a new one
    const supabase = createServiceClient()
    const { data: existingDesigner } = await supabase
      .from('designers')
      .select('*')
      .eq('email', email)
      .single()

    let designerId = existingDesigner?.id
    let designerStatus = 'new' // 'new', 'incomplete', 'pending', 'approved'
    
    if (!existingDesigner) {
      // Create a new designer record with all required fields
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
          years_experience: 0, // Experience - will be filled in application form
          is_verified: true,
          is_approved: false,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (createError) {
        logger.error('Error creating designer:', createError)
        return apiResponse.error('Failed to create designer account')
      }

      designerId = newDesigner.id
      designerStatus = 'new'
    } else {
      // Determine designer status based on their profile
      if (existingDesigner.is_approved) {
        designerStatus = 'approved'
      } else if (existingDesigner.rejection_reason) {
        // Designer has been rejected
        designerStatus = 'rejected'
      } else if (existingDesigner.first_name && existingDesigner.last_name && existingDesigner.title && existingDesigner.bio) {
        // Has filled out application but not approved (bio is required, portfolio_url is optional)
        designerStatus = 'pending'
      } else {
        // Has account but incomplete profile
        designerStatus = 'incomplete'
      }
    }

    // Create designer session
    logger.info('📝 Creating designer session for:', email, 'with ID:', designerId)
    
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
    
    logger.info('✅ Designer session created successfully with cookie:', AUTH_COOKIES.DESIGNER)

    // Return success with status
    return apiResponse.success({ 
      success: true,
      message: 'OTP verified successfully',
      designer: {
        id: designerId,
        email,
        isExisting: !!existingDesigner,
        status: designerStatus,
        isApproved: existingDesigner?.is_approved || false,
        firstName: existingDesigner?.first_name || '',
        lastName: existingDesigner?.last_name || '',
        rejectionReason: existingDesigner?.rejection_reason || null,
        rejectionSeen: existingDesigner?.rejection_seen || false
      }
    })
  } catch (error) {
    logger.error('Error verifying designer OTP:', error)
    return handleApiError(error, 'designer/auth/verify-otp')
  }
}