import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if designer exists
    const { data: designer, error } = await supabase
      .from('designers')
      .select('id, email, first_name, last_name, is_verified, is_approved')
      .eq('email', email)
      .single()

    if (error || !designer) {
      return NextResponse.json(
        { error: 'Not a registered designer. Please apply first.' },
        { status: 404 }
      )
    }

    if (!designer.is_verified) {
      return NextResponse.json(
        { error: 'Your account is pending verification' },
        { status: 403 }
      )
    }

    if (!designer.is_approved) {
      return NextResponse.json(
        { error: 'Your application is under review. We\'ll notify you once approved.' },
        { status: 403 }
      )
    }

    // Set designer session cookie
    const cookieStore = cookies()
    cookieStore.set('designer-session', JSON.stringify({
      email: designer.email,
      designerId: designer.id,
      authenticatedAt: new Date().toISOString()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return NextResponse.json({ 
      success: true,
      designer: {
        id: designer.id,
        email: designer.email,
        firstName: designer.first_name
      }
    })
  } catch (error) {
    console.error('Error in designer login:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to login' },
      { status: 500 }
    )
  }
}