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
      logger.error('Error fetching match:', error)
      return apiResponse.notFound('Match')
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

    return apiResponse.success({
      success: true,
      match
    })
  } catch (error) {
    return handleApiError(error, 'client/matches/[id]')
  }
}