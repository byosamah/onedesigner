import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'

export async function PUT(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const profileData = await request.json()
    console.log('Enhanced profile update:', profileData)

    const supabase = createServiceClient()

    // Update designer profile with enhanced fields
    const { data: designer, error } = await supabase
      .from('designers')
      .update({
        design_philosophy: profileData.design_philosophy,
        primary_categories: profileData.primary_categories || [],
        secondary_categories: profileData.secondary_categories || [],
        style_keywords: profileData.style_keywords || [],
        preferred_industries: profileData.preferred_industries || [],
        preferred_project_sizes: profileData.preferred_project_sizes || [],
        expert_tools: profileData.expert_tools || [],
        special_skills: profileData.special_skills || [],
        turnaround_times: profileData.turnaround_times || {},
        revision_rounds_included: profileData.revision_rounds_included || 3,
        collaboration_style: profileData.collaboration_style,
        current_availability: profileData.current_availability,
        ideal_client_types: profileData.ideal_client_types || [],
        dream_project_description: profileData.dream_project_description,
        portfolio_link: profileData.portfolio_link,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.designerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating designer profile:', error)
      return apiResponse.serverError('Failed to update profile', error)
    }

    console.log('✅ Designer profile updated:', designer.id)

    return apiResponse.success({
      designer: {
        id: designer.id,
        design_philosophy: designer.design_philosophy,
        primary_categories: designer.primary_categories,
        secondary_categories: designer.secondary_categories,
        style_keywords: designer.style_keywords,
        preferred_industries: designer.preferred_industries,
        preferred_project_sizes: designer.preferred_project_sizes,
        expert_tools: designer.expert_tools,
        special_skills: designer.special_skills,
        turnaround_times: designer.turnaround_times,
        revision_rounds_included: designer.revision_rounds_included,
        collaboration_style: designer.collaboration_style,
        current_availability: designer.current_availability,
        ideal_client_types: designer.ideal_client_types,
        dream_project_description: designer.dream_project_description,
        portfolio_link: designer.portfolio_link,
        updated_at: designer.updated_at
      },
      message: 'Profile updated successfully'
    })

  } catch (error) {
    return handleApiError(error, 'designer/profile/enhanced')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const supabase = createServiceClient()

    // Get enhanced designer profile
    const { data: designer, error } = await supabase
      .from('designers')
      .select(`
        id, first_name, last_name, email, title, city, country,
        years_experience, design_philosophy, primary_categories,
        secondary_categories, style_keywords, preferred_industries,
        preferred_project_sizes, expert_tools, special_skills,
        turnaround_times, revision_rounds_included, collaboration_style,
        current_availability, ideal_client_types, dream_project_description,
        portfolio_link, is_approved, is_verified, created_at, updated_at
      `)
      .eq('id', session.designerId)
      .single()

    if (error || !designer) {
      console.error('Error fetching designer profile:', error)
      return apiResponse.notFound('Designer profile')
    }

    // Get portfolio images
    const { data: portfolioImages } = await supabase
      .from('designer_portfolio_images')
      .select('*')
      .eq('designer_id', session.designerId)
      .order('display_order', { ascending: true })

    return apiResponse.success({
      designer: {
        id: designer.id,
        firstName: designer.first_name,
        lastName: designer.last_name,
        email: designer.email,
        title: designer.title,
        city: designer.city,
        country: designer.country,
        yearsExperience: designer.years_experience,
        designPhilosophy: designer.design_philosophy,
        primaryCategories: designer.primary_categories,
        secondaryCategories: designer.secondary_categories,
        styleKeywords: designer.style_keywords,
        preferredIndustries: designer.preferred_industries,
        preferredProjectSizes: designer.preferred_project_sizes,
        expertTools: designer.expert_tools,
        specialSkills: designer.special_skills,
        turnaroundTimes: designer.turnaround_times,
        revisionRoundsIncluded: designer.revision_rounds_included,
        collaborationStyle: designer.collaboration_style,
        currentAvailability: designer.current_availability,
        idealClientTypes: designer.ideal_client_types,
        dreamProjectDescription: designer.dream_project_description,
        portfolioLink: designer.portfolio_link,
        isApproved: designer.is_approved,
        isVerified: designer.is_verified,
        createdAt: designer.created_at,
        updatedAt: designer.updated_at
      },
      portfolioImages: portfolioImages || []
    })

  } catch (error) {
    return handleApiError(error, 'designer/profile/enhanced GET')
  }
}