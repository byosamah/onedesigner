import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email/send-email'
import { welcomeClientEmail } from '@/lib/email/templates/welcome-client'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      )
    }

    // Verify OTP using our custom system
    const isValid = await verifyCustomOTP(email, token)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      )
    }

    // Create or update client record
    const supabase = createServiceClient()
    
    // Check if this is a new user
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single()
    
    const isNewUser = !existingClient
    
    const { data: client, error } = await supabase
      .from('clients')
      .upsert({ 
        email,
      }, { 
        onConflict: 'email',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
    }
    
    // Send welcome email for new users
    if (isNewUser && client) {
      const { subject, html, text } = welcomeClientEmail({
        clientName: client.name || 'there',
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/client/dashboard`
      })
      
      await sendEmail({ to: email, subject, html, text })
    }

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set('client-session', JSON.stringify({
      email,
      clientId: client?.id,
      authenticatedAt: new Date().toISOString()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: client?.id,
        email: email,
      },
      client
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}