import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get client session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(AUTH_COOKIES.CLIENT)
    
    if (!sessionCookie) {
      return apiResponse.unauthorized()
    }

    const session = JSON.parse(sessionCookie.value)
    const { clientId } = session

    if (!clientId) {
      return apiResponse.error('Client ID not found')
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
      .eq('id', params.id)
      .eq('client_id', clientId)
      .single()

    // Fetch designer's actual portfolio images
    let portfolioImages = []
    if (match && match.designer) {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('designer_portfolio_images')
        .select('image_url, project_title, project_description, display_order')
        .eq('designer_id', match.designer.id)
        .order('display_order', { ascending: true })
        .limit(3)

      if (!portfolioError && portfolioData) {
        portfolioImages = portfolioData
      }
    }

    if (error || !match) {
      logger.error('Error fetching match:', error)
      return apiResponse.notFound('Match')
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

    // Hide contact info for locked matches
    if (match.status === 'pending' || match.status === 'declined') {
      const { email, phone, website, ...safeDesigner } = match.designer
      match.designer = {
        ...safeDesigner,
        email: '***',
        phone: '***', 
        website: '***'
      }
    }

    // Get client credits
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('match_credits')
      .eq('id', clientId)
      .single()

    const credits = client?.match_credits || 0

    return apiResponse.success({
      success: true,
      match,
      credits
    })
  } catch (error) {
    return handleApiError(error, 'client/matches/[id]')
  }
}