import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    // Validate client session
    const { valid, session } = await validateSession('CLIENT')
    if (!valid || !session?.clientId) {
      return apiResponse.unauthorized('Please log in to submit a brief')
    }

    const briefData = await request.json()
    logger.info('Enhanced brief submission:', briefData)

    // Validate required fields
    const requiredFields = ['design_category', 'project_description', 'timeline_type', 'budget_range']
    for (const field of requiredFields) {
      if (!briefData[field]) {
        return apiResponse.validationError(`${field} is required`)
      }
    }

    const supabase = createServiceClient()

    // Create basic brief record with only essential and existing fields
    // Use same structure as the working legacy endpoint to ensure compatibility
    const briefInsert: any = {
      client_id: session.clientId,
      project_type: briefData.design_category,
      industry: briefData.target_audience || 'General',
      timeline: briefData.timeline_type,
      budget: briefData.budget_range,
      styles: briefData.design_style_keywords || [],
      inspiration: briefData.design_examples?.[0] || briefData.avoid_colors_styles,
      requirements: briefData.project_description,
      timezone: null, // Default value
      communication: ['email'], // Default communication method
      status: 'active'
    }

    // Remove undefined fields to avoid database issues
    Object.keys(briefInsert).forEach(key => {
      if (briefInsert[key] === undefined) {
        delete briefInsert[key]
      }
    })

    const { data: brief, error } = await supabase
      .from('briefs')
      .insert(briefInsert)
      .select()
      .single()

    if (error) {
      logger.error('Error creating brief:', error)
      logger.error('Brief data that failed:', briefInsert)
      // Return more detailed error in development/production for debugging
      return apiResponse.serverError(
        `Failed to create brief: ${error.message || error.code || 'Unknown error'}`,
        process.env.NODE_ENV === 'development' ? error : undefined
      )
    }

    logger.info('✅ Enhanced brief created:', brief.id)

    return apiResponse.success({
      brief: {
        id: brief.id,
        project_type: brief.project_type,
        timeline: brief.timeline,
        budget: brief.budget,
        created_at: brief.created_at
      },
      message: 'Brief submitted successfully'
    })

  } catch (error) {
    return handleApiError(error, 'briefs/enhanced')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate client session
    const { valid, session } = await validateSession('CLIENT')
    if (!valid || !session?.clientId) {
      return apiResponse.unauthorized('Please log in to view briefs')
    }

    const supabase = createServiceClient()

    // Get client's briefs with enhanced data
    const { data: briefs, error } = await supabase
      .from('briefs')
      .select(`
        id, design_category, project_description, timeline_type, budget_range,
        deliverables, target_audience, project_goal, design_style_keywords,
        design_examples, avoid_colors_styles, involvement_level,
        communication_preference, previous_designer_experience,
        has_brand_guidelines, created_at, updated_at
      `)
      .eq('client_id', session.clientId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching briefs:', error)
      return apiResponse.serverError('Failed to fetch briefs', error)
    }

    return apiResponse.success({
      briefs: briefs || [],
      count: briefs?.length || 0
    })

  } catch (error) {
    return handleApiError(error, 'briefs/enhanced GET')
  }
}