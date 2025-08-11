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

    // Check if client already exists
    const supabase = createServiceClient()
    
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingClient) {
      // Client already exists - they should login instead
      return apiResponse.error('An account with this email already exists. Please log in instead.')
    }
    
    // Create new client account
    const { data: client, error } = await supabase
      .from('clients')
      .insert({ 
        email,
        match_credits: 1, // Give new users 1 free credit to try
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return apiResponse.error('Failed to create account. Please try again.')
    }
    
    // Send welcome email
    if (client) {
      const { subject, html, text } = welcomeClientEmail({
        clientName: client.name || 'there',
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/client/dashboard`
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
    console.error('Error verifying signup OTP:', error)
    if (error instanceof Error) {
      return apiResponse.serverError(error.message)
    }
    return handleApiError(error, 'auth/signup/verify-otp')
  }
}