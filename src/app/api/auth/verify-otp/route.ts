import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { emailService } from '@/lib/core/email-service'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createSession } from '@/lib/auth/session-handlers'
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
      logger.error('Error creating client:', error)
    }
    
    // Send welcome email for new users using centralized EmailService
    if (isNewUser && client) {
      await emailService.sendWelcomeEmail(
        email,
        client.name || 'there',
        'client',
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/client/dashboard`
      )
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
    logger.error('Error verifying OTP:', error)
    if (error instanceof Error) {
      return apiResponse.serverError(error.message)
    }
    return handleApiError(error, 'auth/verify-otp')
  }
}