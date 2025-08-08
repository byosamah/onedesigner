import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'

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
      .eq('email', email)
      .single()

    if (error || !designer) {
      return apiResponse.notFound('Not a registered designer. Please apply first.')
    }

    if (!designer.is_verified) {
      return apiResponse.forbidden('Your account is pending verification')
    }

    if (!designer.is_approved) {
      return apiResponse.forbidden('Your application is under review. We\'ll notify you once approved.')
    }

    // Set designer session cookie
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
      success: true,
      designer: {
        id: designer.id,
        email: designer.email,
        firstName: designer.first_name
      }
    })
  } catch (error) {
    return handleApiError(error, 'designer/login')
  }
}