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

    // Profile data is already in snake_case from the frontend
    // Only include fields that are actually editable
    const editableFields = [
      'first_name', 'last_name', 'title', 'phone', 'bio', 
      'city', 'country', 'timezone', 'years_experience', 'availability',
      'website_url', 'portfolio_url', 'dribbble_url', 'behance_url', 'linkedin_url',
      'project_price_from', 'project_price_to', 'previous_clients',
      'project_preferences', 'working_style', 'communication_style',
      'remote_experience', 'team_collaboration',
      'avatar_url', // Allow avatar updates
      'tools' // Portfolio images stored in tools array
    ]
    
    editableFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field] || null
      }
    })
    
    // Update last_initial if last_name changed
    if (profileData.last_name !== undefined) {
      updateData.last_initial = profileData.last_name.charAt(0).toUpperCase()
    }

    // Also update array columns in designers table for styles and industries
    if (profileData.styles !== undefined) {
      updateData.styles = profileData.styles || []
    }
    if (profileData.industries !== undefined) {
      updateData.industries = profileData.industries || []
    }

    // Update designer profile with all data including array columns
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

    // Return snake_case to match what profile page expects
    return apiResponse.success({
      designer: {
        ...updatedProfile, // Include all fields in snake_case
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
      yearsExperience: designer.years_experience,
      title: designer.title,
      firstName: designer.first_name,
      lastName: designer.last_name,
      styles: designer.styles,
      industries: designer.industries,
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

    // Use normalized tables data, but fallback to array columns if normalized tables are empty
    const styles = stylesResult.data?.map(s => s.style) || designer.styles || []
    const projectTypes = projectTypesResult.data?.map(pt => pt.project_type) || []
    const industries = industriesResult.data?.map(i => i.industry) || designer.industries || []
    const softwareSkills = softwareResult.data?.map(s => s.software) || []
    const specializations = specializationsResult.data?.map(s => s.specialization) || []

    logger.info('Profile data being sent:', {
      hasStyles: styles.length > 0,
      hasProjectTypes: projectTypes.length > 0,
      hasIndustries: industries.length > 0,
      hasSoftwareSkills: softwareSkills.length > 0,
      hasSpecializations: specializations.length > 0,
      styles,
      projectTypes,
      industries,
      softwareSkills,
      specializations
    })

    // Return snake_case to match what profile page expects
    return apiResponse.success({
      designer: {
        ...designer, // Include all original fields in snake_case
        // Add the normalized table data (overrides array columns if they exist)
        styles,
        projectTypes,
        industries,
        softwareSkills,
        specializations
      }
    })

  } catch (error) {
    return handleApiError(error, 'designer/profile GET')
  }
}