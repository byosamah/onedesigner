import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { isAdminEmail } from '@/lib/admin/config'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      )
    }

    // Verify OTP
    const isValid = await verifyCustomOTP(email, token)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      )
    }

    // Verify admin email is authorized
    if (!isAdminEmail(email)) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Set admin session cookie with hardcoded admin data
    const cookieStore = cookies()
    cookieStore.set('admin-session', JSON.stringify({
      email: email,
      adminId: 'admin', // Static ID for hardcoded admin
      role: 'admin',
      authenticatedAt: new Date().toISOString()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours for admin sessions
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: 'admin',
        email: email,
        name: 'Admin',
        role: 'admin'
      }
    })
  } catch (error) {
    logger.error('Error verifying admin:', error)
    return NextResponse.json(
      { error: 'Failed to verify' },
      { status: 500 }
    )
  }
}