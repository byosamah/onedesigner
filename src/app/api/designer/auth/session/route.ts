import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('designer-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { designerId } = session
    if (!designerId) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }

    // Fetch designer data from database
    const supabase = createServiceClient()
    const { data: designer, error } = await supabase
      .from('designers')
      .select('*')
      .eq('id', designerId)
      .single()

    if (error || !designer) {
      console.error('Error fetching designer:', error)
      return NextResponse.json(
        { error: 'Designer not found' },
        { status: 404 }
      )
    }

    // Try to fetch related data separately (in case tables don't exist yet)
    let styles = []
    let projectTypes = []
    let industries = []
    
    try {
      const { data: stylesData } = await supabase
        .from('designer_styles')
        .select('style')
        .eq('designer_id', designerId)
      styles = stylesData?.map(s => s.style) || []
    } catch (e) {
      console.log('Designer styles table not found, using empty array')
    }
    
    try {
      const { data: projectTypesData } = await supabase
        .from('designer_project_types')
        .select('project_type')
        .eq('designer_id', designerId)
      projectTypes = projectTypesData?.map(pt => pt.project_type) || []
    } catch (e) {
      console.log('Designer project types table not found, using empty array')
    }
    
    try {
      const { data: industriesData } = await supabase
        .from('designer_industries')
        .select('industry')
        .eq('designer_id', designerId)
      industries = industriesData?.map(i => i.industry) || []
    } catch (e) {
      console.log('Designer industries table not found, using empty array')
    }
    
    // Transform the data
    const transformedDesigner = {
      ...designer,
      styles,
      project_types: projectTypes,
      industries
    }

    return NextResponse.json({
      designer: transformedDesigner,
      session: {
        designerId,
        email: designer.email,
        name: `${designer.first_name} ${designer.last_name}`
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}