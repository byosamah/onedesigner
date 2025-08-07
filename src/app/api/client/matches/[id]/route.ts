import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch the specific match
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        id,
        score,
        status,
        reasons,
        personalized_reasons,
        created_at,
        designer:designers!matches_designer_id_fkey(
          id,
          first_name,
          last_initial,
          title,
          city,
          country,
          email,
          phone,
          website:website_url,
          bio,
          years_experience,
          rating,
          total_projects,
          styles,
          industries
        ),
        brief:briefs!matches_brief_id_fkey(
          project_type,
          company_name,
          budget,
          timeline,
          details
        )
      `)
      .eq('id', params.id)
      .eq('client_id', clientId)
      .single()

    if (error || !match) {
      console.error('Error fetching match:', error)
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Hide contact info for locked matches
    if (match.status === 'pending' || match.status === 'declined') {
      match.designer = {
        ...match.designer,
        email: undefined,
        phone: undefined,
        website: undefined
      }
    }

    return NextResponse.json({
      success: true,
      match
    })
  } catch (error) {
    console.error('Error in match detail API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch match' },
      { status: 500 }
    )
  }
}