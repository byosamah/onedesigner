import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Temporary test endpoint to bypass auth and test match data
export async function GET() {
  try {
    const supabase = createServiceClient()
    const matchId = 'd4a262ed-7dff-47e0-92ba-7a3be2cd8236'
    const clientId = '52cc18a2-8aaf-40c6-971a-4a4f876e1ff5'

    console.log('🔍 Testing match fetch with known good IDs')
    console.log('Match ID:', matchId)
    console.log('Client ID:', clientId)

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
          industries,
          avatar_url
        ),
        brief:briefs!matches_brief_id_fkey(
          project_type,
          company_name,
          budget,
          timeline,
          details
        )
      `)
      .eq('id', matchId)
      .eq('client_id', clientId)
      .single()

    console.log('🔍 Match query result:', { match, error })

    if (error || !match) {
      console.error('❌ Error fetching match:', error)
      return NextResponse.json({ 
        success: false, 
        error: error?.message || 'Match not found',
        debug: {
          matchId,
          clientId,
          queryError: error
        }
      })
    }

    // Fetch designer's actual portfolio images
    let portfolioImages = []
    if (match && match.designer) {
      console.log('🔍 Fetching portfolio for designer:', match.designer.id)
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('designer_portfolio_images')
        .select('image_url, project_title, project_description, display_order')
        .eq('designer_id', match.designer.id)
        .order('display_order', { ascending: true })
        .limit(3)

      console.log('🔍 Portfolio query result:', { portfolioData, portfolioError })

      if (!portfolioError && portfolioData) {
        portfolioImages = portfolioData
      }
    }

    // Map database field names to frontend expectations
    if (match.designer) {
      const designer = match.designer
      match.designer = {
        ...designer,
        firstName: designer.first_name,
        lastName: designer.last_name || designer.last_initial,
        yearsExperience: designer.years_experience,
        totalProjects: designer.total_projects,
        portfolioImages: portfolioImages
      }
    }

    console.log('✅ Successfully fetched match data')
    console.log('🔍 Designer data:', {
      firstName: match.designer.firstName,
      lastName: match.designer.lastName,
      avatar_url: match.designer.avatar_url,
      portfolioCount: portfolioImages.length
    })

    return NextResponse.json({
      success: true,
      match,
      debug: {
        matchId,
        clientId,
        designerName: `${match.designer.firstName} ${match.designer.lastName}`,
        avatarUrl: match.designer.avatar_url,
        portfolioCount: portfolioImages.length,
        portfolioImages: portfolioImages.map(img => img.image_url)
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    })
  }
}