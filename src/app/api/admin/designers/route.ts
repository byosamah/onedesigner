import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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
    
    // Fetch all designers
    const { data: designers, error } = await supabase
      .from('designers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching designers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch designers' },
        { status: 500 }
      )
    }

    // Try to fetch related data for each designer
    const designersWithDetails = await Promise.all(
      designers.map(async (designer) => {
        try {
          // Fetch styles
          const { data: styles } = await supabase
            .from('designer_styles')
            .select('style')
            .eq('designer_id', designer.id)
          
          // Fetch project types
          const { data: projectTypes } = await supabase
            .from('designer_project_types')
            .select('project_type')
            .eq('designer_id', designer.id)
          
          return {
            ...designer,
            styles: styles?.map(s => s.style) || [],
            project_types: projectTypes?.map(pt => pt.project_type) || []
          }
        } catch (e) {
          // If tables don't exist, return designer without extra details
          return designer
        }
      })
    )

    return NextResponse.json({
      designers: designersWithDetails
    })
  } catch (error) {
    console.error('Error in admin designers route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}