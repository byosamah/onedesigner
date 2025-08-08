import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'

export async function POST(request: NextRequest) {
  try {
    // Validate client session
    const { valid, session } = await validateSession('CLIENT')
    if (!valid || !session?.clientId) {
      return apiResponse.unauthorized('Please log in to submit a brief')
    }

    const briefData = await request.json()
    console.log('Enhanced brief submission:', briefData)

    // Validate required fields
    const requiredFields = ['design_category', 'project_description', 'timeline_type', 'budget_range']
    for (const field of requiredFields) {
      if (!briefData[field]) {
        return apiResponse.validationError(`${field} is required`)
      }
    }

    const supabase = createServiceClient()

    // Create enhanced brief record with all category-specific fields
    const briefInsert: any = {
      client_id: session.clientId,
      design_category: briefData.design_category,
      project_description: briefData.project_description,
      timeline_type: briefData.timeline_type,
      budget_range: briefData.budget_range,
      
      // Standard enhanced fields
      deliverables: briefData.deliverables || [],
      target_audience: briefData.target_audience,
      project_goal: briefData.project_goal,
      design_style_keywords: briefData.design_style_keywords || [],
      design_examples: briefData.design_examples || [],
      avoid_colors_styles: briefData.avoid_colors_styles,
      involvement_level: briefData.involvement_level,
      communication_preference: briefData.communication_preference,
      previous_designer_experience: briefData.previous_designer_experience,
      has_brand_guidelines: briefData.has_brand_guidelines || false,
      
      // Working Preferences
      update_frequency: briefData.update_frequency,
      involvement_preferences: briefData.involvement_preferences,
      communication_channels: briefData.communication_channels || [],
      project_management_tools: briefData.project_management_tools || [],
      feedback_style: briefData.feedback_style,
      change_flexibility: briefData.change_flexibility,
      
      // Category-specific fields - Branding/Logo
      brand_identity_type: briefData.brand_identity_type,
      brand_deliverables: briefData.brand_deliverables || [],
      industry_sector: briefData.industry_sector,
      brand_values: briefData.brand_values,
      target_market: briefData.target_market,
      brand_personality: briefData.brand_personality || [],
      logo_style_preference: briefData.logo_style_preference,
      color_preferences: briefData.color_preferences,
      brand_assets_status: briefData.brand_assets_status,
      
      // Category-specific fields - Web/Mobile
      digital_product_type: briefData.digital_product_type,
      number_of_screens: briefData.number_of_screens,
      key_features: briefData.key_features || [],
      design_inspiration: briefData.design_inspiration,
      technical_requirements: briefData.technical_requirements || [],
      accessibility_requirements: briefData.accessibility_requirements || [],
      content_strategy: briefData.content_strategy,
      integration_needs: briefData.integration_needs || [],
      
      // Category-specific fields - Print/Packaging
      print_product_type: briefData.print_product_type,
      print_quantity: briefData.print_quantity,
      print_dimensions: briefData.print_dimensions,
      print_budget: briefData.print_budget,
      print_timeline: briefData.print_timeline,
      printing_constraints: briefData.printing_constraints || [],
      distribution_channels: briefData.distribution_channels || [],
      
      // Legacy fields for backward compatibility
      project_type: briefData.design_category,
      industry: briefData.target_audience || briefData.industry_sector || 'General',
      timeline: briefData.timeline_type,
      styles: briefData.design_style_keywords || [],
      additional_info: briefData.project_description
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
      console.error('Error creating brief:', error)
      return apiResponse.serverError('Failed to create brief', error)
    }

    console.log('✅ Enhanced brief created:', brief.id)

    return apiResponse.success({
      brief: {
        id: brief.id,
        design_category: brief.design_category,
        timeline_type: brief.timeline_type,
        budget_range: brief.budget_range,
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
      console.error('Error fetching briefs:', error)
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