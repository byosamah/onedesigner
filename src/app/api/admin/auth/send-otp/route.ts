import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendCustomOTP } from '@/lib/auth/custom-otp'
import { isAdminEmail } from '@/lib/admin/config'

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

    // Check if admin exists - bypass RLS by using service role
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('email, is_active')
      .eq('email', email)
      .maybeSingle()

    // Check if email is in admin list
    if (!isAdminEmail(email)) {
      // If not in hardcoded list, check database
      if (error || !admin) {
        console.error('Not an authorized admin email:', email)
        return NextResponse.json(
          { error: 'Not authorized. This email is not registered as an admin.' },
          { status: 403 }
        )
      }
      
      if (admin && !admin.is_active) {
        return NextResponse.json(
          { error: 'Account is deactivated' },
          { status: 403 }
        )
      }
    }

    // Send OTP
    await sendCustomOTP(email)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending admin OTP:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}