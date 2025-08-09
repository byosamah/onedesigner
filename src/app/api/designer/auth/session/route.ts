import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Use centralized session validation
    const result = await validateSession('DESIGNER')
    
    if (!result.valid || !result.session || !result.user) {
      return apiResponse.unauthorized('No valid session found')
    }

    const designer = result.user
    const { designerId } = result.session as any

    // Fetch designer data is already done by validateSession
    const supabase = createServiceClient()

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

    return apiResponse.success({
      designer: {
        id: designer.id,
        firstName: designer.first_name,
        lastName: designer.last_name,
        email: designer.email,
        title: designer.title,
        isApproved: designer.is_approved,
        isVerified: designer.is_verified,
        yearsExperience: designer.years_experience,
        bio: designer.bio,
        city: designer.city,
        country: designer.country,
        primaryCategories: projectTypes,
        designPhilosophy: designer.bio || '',
        styles,
        industries
      },
      session: {
        designerId: designer.id,
        email: designer.email,
        name: `${designer.first_name} ${designer.last_name}`
      }
    })
  } catch (error) {
    return handleApiError(error, 'designer/auth/session')
  }
}