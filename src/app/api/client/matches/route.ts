import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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
      logger.error('Error fetching matches:', error)
      return apiResponse.serverError('Failed to fetch matches', error)
    }

    // Fetch designers and briefs separately
    if (matches && matches.length > 0) {
      const designerIds = [...new Set(matches.map(m => m.designer_id))]
      const briefIds = [...new Set(matches.map(m => m.brief_id))]
      
      const { data: designers } = await supabase
        .from('designers')
        .select('id, first_name, last_name, last_initial, title, city, country, email, phone, website_url, portfolio_url, linkedin_url, dribbble_url, behance_url, years_experience, total_projects, rating, tools, avatar_url')
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
            portfolioUrl: designer.portfolio_url,
            linkedinUrl: designer.linkedin_url,
            dribbbleUrl: designer.dribbble_url,
            behanceUrl: designer.behance_url,
            yearsExperience: designer.years_experience,
            rating: designer.rating,
            totalProjects: designer.total_projects,
            avatarUrl: designer.avatar_url,
            portfolioImages: Array.isArray(designer.tools) ? designer.tools : []
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
              website: undefined,
              portfolioUrl: undefined,
              linkedinUrl: undefined,
              dribbbleUrl: undefined,
              behanceUrl: undefined
            } : null
          }
        }
        return match
      })
      
      return apiResponse.success({
        success: true,
        matches: finalMatches
      })
    }

    // No matches found
    return apiResponse.success({
      success: true,
      matches: []
    })
  } catch (error) {
    return handleApiError(error, 'client/matches')
  }
}