import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function PUT(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const profileData = await request.json()
    logger.info('Profile update data:', profileData)

    const supabase = createServiceClient()

    // Update basic designer profile fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
      // Mark designer as unapproved when they edit their profile
      is_approved: false,
      // Mark that they edited after approval
      edited_after_approval: true
    }

    // Map camelCase fields to snake_case database columns
    if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName
    if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName
    if (profileData.lastName !== undefined) updateData.last_initial = profileData.lastName.charAt(0).toUpperCase()
    if (profileData.title !== undefined) updateData.title = profileData.title
    if (profileData.phone !== undefined) updateData.phone = profileData.phone || null
    if (profileData.bio !== undefined) updateData.bio = profileData.bio
    if (profileData.city !== undefined) updateData.city = profileData.city
    if (profileData.country !== undefined) updateData.country = profileData.country
    if (profileData.timezone !== undefined) updateData.timezone = profileData.timezone
    if (profileData.yearsExperience !== undefined) updateData.years_experience = profileData.yearsExperience
    if (profileData.availability !== undefined) updateData.availability = profileData.availability
    if (profileData.websiteUrl !== undefined) updateData.website_url = profileData.websiteUrl
    if (profileData.portfolioUrl !== undefined) updateData.portfolio_url = profileData.portfolioUrl || null
    if (profileData.dribbbleUrl !== undefined) updateData.dribbble_url = profileData.dribbbleUrl || null
    if (profileData.behanceUrl !== undefined) updateData.behance_url = profileData.behanceUrl || null
    if (profileData.linkedinUrl !== undefined) updateData.linkedin_url = profileData.linkedinUrl || null
    if (profileData.projectPriceFrom !== undefined) updateData.project_price_from = profileData.projectPriceFrom
    if (profileData.projectPriceTo !== undefined) updateData.project_price_to = profileData.projectPriceTo
    if (profileData.previousClients !== undefined) updateData.previous_clients = profileData.previousClients || null
    if (profileData.projectPreferences !== undefined) updateData.project_preferences = profileData.projectPreferences
    if (profileData.workingStyle !== undefined) updateData.working_style = profileData.workingStyle
    if (profileData.communicationStyle !== undefined) updateData.communication_style = profileData.communicationStyle
    if (profileData.remoteExperience !== undefined) updateData.remote_experience = profileData.remoteExperience
    if (profileData.teamCollaboration !== undefined) updateData.team_collaboration = profileData.teamCollaboration || null

    // Update designer profile
    const { data: designer, error } = await supabase
      .from('designers')
      .update(updateData)
      .eq('id', session.designerId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating designer profile:', error)
      return apiResponse.serverError('Failed to update profile', error)
    }

    // Handle related tables updates
    if (profileData.styles !== undefined) {
      // Delete existing styles
      await supabase.from('designer_styles').delete().eq('designer_id', session.designerId)
      
      // Insert new styles (using style IDs from constants)
      if (profileData.styles.length > 0) {
        const styleRecords = profileData.styles.map((style: string) => ({
          designer_id: session.designerId,
          style
        }))
        await supabase.from('designer_styles').insert(styleRecords)
      }
    }

    if (profileData.projectTypes !== undefined) {
      // Delete existing project types
      await supabase.from('designer_project_types').delete().eq('designer_id', session.designerId)
      
      // Insert new project types (using type IDs from constants)
      if (profileData.projectTypes.length > 0) {
        const projectTypeRecords = profileData.projectTypes.map((projectType: string) => ({
          designer_id: session.designerId,
          project_type: projectType
        }))
        await supabase.from('designer_project_types').insert(projectTypeRecords)
      }
    }

    if (profileData.industries !== undefined) {
      // Delete existing industries
      await supabase.from('designer_industries').delete().eq('designer_id', session.designerId)
      
      // Insert new industries
      if (profileData.industries.length > 0) {
        const industryRecords = profileData.industries.map((industry: string) => ({
          designer_id: session.designerId,
          industry
        }))
        await supabase.from('designer_industries').insert(industryRecords)
      }
    }

    if (profileData.softwareSkills !== undefined) {
      // Delete existing software skills
      await supabase.from('designer_software_skills').delete().eq('designer_id', session.designerId)
      
      // Insert new software skills
      if (profileData.softwareSkills.length > 0) {
        const softwareRecords = profileData.softwareSkills.map((software: string) => ({
          designer_id: session.designerId,
          software
        }))
        await supabase.from('designer_software_skills').insert(softwareRecords)
      }
    }
    
    if (profileData.specializations !== undefined) {
      // Delete existing specializations
      await supabase.from('designer_specializations').delete().eq('designer_id', session.designerId)
      
      // Insert new specializations
      if (profileData.specializations.length > 0) {
        const specializationRecords = profileData.specializations.map((specialization: string) => ({
          designer_id: session.designerId,
          specialization
        }))
        await supabase.from('designer_specializations').insert(specializationRecords)
      }
    }

    // Fetch the updated profile with related data
    const { data: updatedProfile } = await supabase
      .from('designers')
      .select('*')
      .eq('id', session.designerId)
      .single()

    const { data: styles } = await supabase
      .from('designer_styles')
      .select('style')
      .eq('designer_id', session.designerId)

    const { data: projectTypes } = await supabase
      .from('designer_project_types')
      .select('project_type')
      .eq('designer_id', session.designerId)

    const { data: industries } = await supabase
      .from('designer_industries')
      .select('industry')
      .eq('designer_id', session.designerId)

    const { data: softwareSkills } = await supabase
      .from('designer_software_skills')
      .select('software')
      .eq('designer_id', session.designerId)
      
    const { data: specializations } = await supabase
      .from('designer_specializations')
      .select('specialization')
      .eq('designer_id', session.designerId)

    logger.info('✅ Designer profile updated:', designer.id)
    logger.info('⚠️ Designer marked as unapproved after edit')

    return apiResponse.success({
      designer: {
        id: updatedProfile.id,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        title: updatedProfile.title,
        bio: updatedProfile.bio,
        city: updatedProfile.city,
        country: updatedProfile.country,
        timezone: updatedProfile.timezone,
        yearsExperience: updatedProfile.years_experience,
        availability: updatedProfile.availability,
        websiteUrl: updatedProfile.website_url,
        portfolioUrl: updatedProfile.portfolio_url,
        dribbbleUrl: updatedProfile.dribbble_url,
        behanceUrl: updatedProfile.behance_url,
        linkedinUrl: updatedProfile.linkedin_url,
        projectPriceFrom: updatedProfile.project_price_from,
        projectPriceTo: updatedProfile.project_price_to,
        previousClients: updatedProfile.previous_clients,
        projectPreferences: updatedProfile.project_preferences,
        workingStyle: updatedProfile.working_style,
        communicationStyle: updatedProfile.communication_style,
        remoteExperience: updatedProfile.remote_experience,
        teamCollaboration: updatedProfile.team_collaboration,
        isApproved: updatedProfile.is_approved,
        isVerified: updatedProfile.is_verified,
        styles: styles?.map(s => s.style) || [],
        projectTypes: projectTypes?.map(pt => pt.project_type) || [],
        industries: industries?.map(i => i.industry) || [],
        softwareSkills: softwareSkills?.map(s => s.software) || [],
        specializations: specializations?.map(s => s.specialization) || []
      },
      message: 'Profile updated successfully'
    })

  } catch (error) {
    return handleApiError(error, 'designer/profile')
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

    // Get designer profile with all basic fields
    const { data: designer, error } = await supabase
      .from('designers')
      .select('*')
      .eq('id', session.designerId)
      .single()

    if (error || !designer) {
      logger.error('Error fetching designer profile:', error)
      return apiResponse.notFound('Designer profile')
    }
    
    logger.info('Designer data from DB:', {
      id: designer.id,
      country: designer.country,
      city: designer.city,
      availability: designer.availability,
      timezone: designer.timezone,
      communicationStyle: designer.communication_style,
      bio: designer.bio,
      projectPreferences: designer.project_preferences,
      workingStyle: designer.working_style,
      remoteExperience: designer.remote_experience,
      allFields: Object.keys(designer).filter(key => designer[key] !== null && designer[key] !== '')
    })

    // Get related data from junction tables
    const [stylesResult, projectTypesResult, industriesResult, softwareResult, specializationsResult] = await Promise.all([
      supabase.from('designer_styles').select('style').eq('designer_id', session.designerId),
      supabase.from('designer_project_types').select('project_type').eq('designer_id', session.designerId),
      supabase.from('designer_industries').select('industry').eq('designer_id', session.designerId),
      supabase.from('designer_software_skills').select('software').eq('designer_id', session.designerId),
      supabase.from('designer_specializations').select('specialization').eq('designer_id', session.designerId)
    ])

    return apiResponse.success({
      designer: {
        id: designer.id,
        firstName: designer.first_name,
        lastName: designer.last_name,
        email: designer.email,
        phone: designer.phone,
        title: designer.title,
        bio: designer.bio,
        city: designer.city,
        country: designer.country,
        timezone: designer.timezone,
        yearsExperience: designer.years_experience,
        availability: designer.availability,
        websiteUrl: designer.website_url,
        portfolioUrl: designer.portfolio_url,
        dribbbleUrl: designer.dribbble_url,
        behanceUrl: designer.behance_url,
        linkedinUrl: designer.linkedin_url,
        projectPriceFrom: designer.project_price_from,
        projectPriceTo: designer.project_price_to,
        previousClients: designer.previous_clients,
        projectPreferences: designer.project_preferences,
        workingStyle: designer.working_style,
        communicationStyle: designer.communication_style,
        remoteExperience: designer.remote_experience,
        teamCollaboration: designer.team_collaboration,
        isApproved: designer.is_approved,
        isVerified: designer.is_verified,
        styles: stylesResult.data?.map(s => s.style) || [],
        projectTypes: projectTypesResult.data?.map(pt => pt.project_type) || [],
        industries: industriesResult.data?.map(i => i.industry) || [],
        softwareSkills: softwareResult.data?.map(s => s.software) || [],
        specializations: specializationsResult.data?.map(s => s.specialization) || []
      }
    })

  } catch (error) {
    return handleApiError(error, 'designer/profile GET')
  }
}