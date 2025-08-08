import { createServiceClient } from '@/lib/supabase/server'
import { OTP_CONFIG } from '@/lib/constants'

export async function generateOTP(length: number = OTP_CONFIG.LENGTH): Promise<string> {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }
  return otp
}

export async function createOTPToken(email: string): Promise<{ token: string; expiresAt: Date }> {
  const supabase = createServiceClient()
  const token = await generateOTP()
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_TIME) // 10 minutes

  // Clean up old tokens for this email
  await supabase
    .from('auth_tokens')
    .delete()
    .eq('email', email)
    .eq('type', 'otp')
    .lt('expires_at', new Date().toISOString())

  // Create new token
  const { error } = await supabase
    .from('auth_tokens')
    .insert({
      email,
      token,
      type: 'otp',
      expires_at: expiresAt.toISOString(),
    })

  if (error) {
    throw new Error('Failed to create OTP token')
  }

  return { token, expiresAt }
}

export async function verifyOTPToken(email: string, token: string): Promise<boolean> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('email', email)
    .eq('token', token)
    .eq('type', 'otp')
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return false
  }

  // Mark token as used
  await supabase
    .from('auth_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id)

  return true
}

export async function findOrCreateClient(email: string) {
  const supabase = createServiceClient()

  // Check if client exists
  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .single()

  if (existingClient) {
    return existingClient
  }

  // Create new client
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({ email })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create client')
  }

  return newClient
}