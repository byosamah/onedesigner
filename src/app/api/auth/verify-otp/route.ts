import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { sendEmail } from '@/lib/email/send-email'
import { welcomeClientEmail } from '@/lib/email/templates/welcome-client'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createSession } from '@/lib/auth/session-handlers'

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

    // Set session using centralized handler
    await createSession('CLIENT', {
      email,
      userId: client?.id,
      clientId: client?.id,
      userType: 'client'
    })

    return apiResponse.success({ 
      success: true, 
      user: {
        id: client?.id,
        email: email,
      },
      client
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    if (error instanceof Error) {
      return apiResponse.serverError(error.message)
    }
    return handleApiError(error, 'auth/verify-otp')
  }
}