import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { AUTH_COOKIES } from '@/lib/constants'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(AUTH_COOKIES.CLIENT)
    
    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        client: null
      })
    }

    const session = JSON.parse(sessionCookie.value)
    const { email, clientId } = session

    // Get client data from database
    const supabase = createServiceClient()
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (error || !client) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        client: null,
        error: 'Client not found'
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: client.id,
        email: client.email,
      },
      client,
      session
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      client: null,
      error: 'Failed to get session'
    })
  }
}