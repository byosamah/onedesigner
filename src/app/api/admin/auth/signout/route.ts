import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/core/logging-service'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // Delete the admin session cookie
    cookieStore.delete('admin-session')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Signout error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}