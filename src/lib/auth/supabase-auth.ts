import { createClient } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/server'

export async function sendOTP(email: string) {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    throw error
  }

  return { success: true }
}

export async function verifyOTP(email: string, token: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    throw error
  }

  // Create or update client record
  const serviceSupabase = createServiceClient()
  const { data: client } = await serviceSupabase
    .from('clients')
    .upsert({ 
      email,
      id: data.user?.id 
    }, { 
      onConflict: 'email',
      ignoreDuplicates: false 
    })
    .select()
    .single()

  return { 
    user: data.user, 
    session: data.session,
    client 
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}