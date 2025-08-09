import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { AUTH_COOKIES } from '@/lib/constants'
import { apiResponse } from '@/lib/api/responses'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return apiResponse.error('Email is required')
    }

    const supabase = createServiceClient()

    // Check if designer exists
    const { data: designer, error } = await supabase
      .from('designers')
      .select('id, email, first_name, last_name, is_verified, is_approved')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !designer) {
      return apiResponse.success({ exists: false })
    }

    // Set session cookie for designer
    const cookieStore = cookies()
    cookieStore.set(AUTH_COOKIES.DESIGNER, JSON.stringify({
      email: designer.email,
      designerId: designer.id,
      authenticatedAt: new Date().toISOString()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return apiResponse.success({ 
      exists: true, 
      designer: {
        id: designer.id,
        email: designer.email,
        firstName: designer.first_name,
        lastName: designer.last_name,
        isVerified: designer.is_verified,
        isApproved: designer.is_approved
      }
    })
  } catch (error) {
    console.error('Error checking designer:', error)
    return apiResponse.serverError('Failed to check designer')
  }
}