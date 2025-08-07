import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get client session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('client-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const { clientId } = session

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID not found' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch all matches for this client
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        score,
        status,
        reasons,
        personalized_reasons,
        created_at,
        designer_id,
        brief_id
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching matches:', error)
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      )
    }

    // Fetch designers and briefs separately
    if (matches && matches.length > 0) {
      const designerIds = [...new Set(matches.map(m => m.designer_id))]
      const briefIds = [...new Set(matches.map(m => m.brief_id))]
      
      const { data: designers } = await supabase
        .from('designers')
        .select('id, first_name, last_name, last_initial, title, city, country, email, phone, website_url, years_experience, rating, total_projects')
        .in('id', designerIds)
      
      const { data: briefs } = await supabase
        .from('briefs')
        .select('id, project_type, company_name, budget')
        .in('id', briefIds)
      
      // Map designers and briefs to matches
      const processedMatches = matches.map(match => {
        const designer = designers?.find(d => d.id === match.designer_id)
        const brief = briefs?.find(b => b.id === match.brief_id)
        
        return {
          ...match,
          designer: designer ? {
            id: designer.id,
            firstName: designer.first_name,
            lastName: designer.last_name,
            lastInitial: designer.last_initial,
            title: designer.title,
            city: designer.city,
            country: designer.country,
            email: designer.email,
            phone: designer.phone,
            website: designer.website_url,
            yearsExperience: designer.years_experience,
            rating: designer.rating,
            totalProjects: designer.total_projects
          } : null,
          brief: brief || null
        }
      })
      
      // Hide contact info for locked matches
      const finalMatches = processedMatches.map(match => {
        if (match.status === 'pending' || match.status === 'declined') {
          return {
            ...match,
            designer: match.designer ? {
              ...match.designer,
              email: undefined,
              phone: undefined,
              website: undefined
            } : null
          }
        }
        return match
      })
      
      return NextResponse.json({
        success: true,
        matches: finalMatches
      })
    }

    // No matches found
    return NextResponse.json({
      success: true,
      matches: []
    })
  } catch (error) {
    console.error('Error in matches API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}