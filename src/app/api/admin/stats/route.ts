import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('admin-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    
    // Fetch all stats in parallel
    const [
      { count: totalDesigners },
      { count: pendingApproval },
      { count: approvedDesigners },
      { count: totalClients },
      { count: totalMatches }
    ] = await Promise.all([
      supabase.from('designers').select('*', { count: 'exact', head: true }),
      supabase.from('designers').select('*', { count: 'exact', head: true })
        .eq('is_verified', true)
        .eq('is_approved', false),
      supabase.from('designers').select('*', { count: 'exact', head: true })
        .eq('is_approved', true),
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true })
    ])

    return NextResponse.json({
      totalDesigners: totalDesigners || 0,
      pendingApproval: pendingApproval || 0,
      approvedDesigners: approvedDesigners || 0,
      totalClients: totalClients || 0,
      totalMatches: totalMatches || 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}