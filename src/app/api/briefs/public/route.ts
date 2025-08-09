import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const briefData = await request.json()
    console.log('Public enhanced brief submission:', briefData)

    // Validate required fields based on step
    const requiredFields = [
      // Step 1: Project Basics
      'design_category', 
      'project_description', 
      'timeline_type', 
      'budget_range',
      // Step 3: Working Preferences
      'involvement_level',
      'update_frequency',
      'communication_channels',
      'feedback_style',
      'change_flexibility'
    ]
    
    for (const field of requiredFields) {
      if (!briefData[field]) {
        return apiResponse.validationError(`${field} is required`)
      }
    }
    
    // Validate category-specific required fields
    const category = briefData.design_category
    if (category) {
      switch (category) {
        case 'branding-logo':
          if (!briefData.brand_identity_type || !briefData.brand_deliverables?.length || !briefData.industry_sector) {
            return apiResponse.validationError('All branding fields are required')
          }
          break
        case 'web-mobile':
          if (!briefData.digital_product_type || !briefData.number_of_screens) {
            return apiResponse.validationError('All web/mobile fields are required')
          }
          break
        case 'social-media':
          if (!briefData.social_platforms?.length || !briefData.social_content_types?.length || !briefData.social_quantity) {
            return apiResponse.validationError('All social media fields are required')
          }
          break
        case 'motion-graphics':
          if (!briefData.motion_type || !briefData.video_length || !briefData.animation_style) {
            return apiResponse.validationError('All motion graphics fields are required')
          }
          break
        case 'photography-video':
          if (!briefData.visual_content_type?.length || !briefData.asset_quantity || !briefData.usage_rights) {
            return apiResponse.validationError('All photography/video fields are required')
          }
          break
        case 'presentations':
          if (!briefData.presentation_type || !briefData.slide_count || !briefData.content_status) {
            return apiResponse.validationError('All presentation fields are required')
          }
          break
      }
    }

    const supabase = createServiceClient()
    let clientId: string

    // Check if a client_email is provided (from OTP flow)
    if (briefData.client_email) {
      console.log('📧 Client email provided, creating/finding client:', briefData.client_email)
      
      // Check if client already exists
      let { data: existingClient, error: findError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', briefData.client_email)
        .single()

      if (existingClient) {
        clientId = existingClient.id
        console.log('✅ Using existing client:', clientId)
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            email: briefData.client_email,
            match_credits: 3 // Give new clients 3 free matches
          })
          .select()
          .single()

        if (clientError) {
          console.error('Error creating client:', clientError)
          return apiResponse.serverError('Failed to create client', clientError)
        }

        clientId = newClient.id
        console.log('✅ Created new client:', clientId)
      }
    } else {
      // Create a temporary client ID for anonymous submissions
      const tempClientId = uuidv4()
      console.log('👤 Creating temporary client for anonymous submission')

      // First create a temporary client record
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          id: tempClientId,
          email: `temp_${Date.now()}@temp.com`,
          match_credits: 1 // Give them 1 free match for testing
        })
        .select()
        .single()

      if (clientError) {
        console.error('Error creating temp client:', clientError)
        return apiResponse.serverError('Failed to create temporary client', clientError)
      }

      clientId = tempClientId
    }

    // Create brief record with all enhanced fields
    const briefInsert: any = {
      client_id: clientId,
      // Original fields for backward compatibility
      project_type: briefData.design_category || 'web-mobile',
      industry: briefData.target_audience || briefData.industry_sector || 'General',
      timeline: briefData.timeline_type || 'standard',
      budget: briefData.budget_range || 'mid',
      styles: briefData.design_style_keywords || [],
      inspiration: briefData.design_examples?.join(', ') || '',
      requirements: briefData.project_description || '',
      communication: briefData.communication_channels || ['email'],
      status: 'active',
      
      // Enhanced fields from migration
      design_category: briefData.design_category,
      project_description: briefData.project_description,
      timeline_type: briefData.timeline_type,
      budget_range: briefData.budget_range,
      deliverables: briefData.deliverables || [],
      target_audience: briefData.target_audience || '',
      project_goal: briefData.project_goal || '',
      design_style_keywords: briefData.design_style_keywords || [],
      design_examples: briefData.design_examples || [],
      avoid_colors_styles: briefData.avoid_colors_styles || '',
      involvement_level: briefData.involvement_level,
      communication_preference: briefData.communication_preference || '',
      previous_designer_experience: briefData.previous_designer_experience || '',
      has_brand_guidelines: briefData.has_brand_guidelines || false,
      
      // Working preferences as columns for better querying
      update_frequency: briefData.update_frequency,
      feedback_style: briefData.feedback_style,
      change_flexibility: briefData.change_flexibility,
      
      // Store all category-specific data in JSONB
      enhanced_data: {
        // Working preferences
        update_frequency: briefData.update_frequency,
        involvement_preferences: briefData.involvement_preferences,
        communication_channels: briefData.communication_channels,
        project_management_tools: briefData.project_management_tools || [],
        feedback_style: briefData.feedback_style,
        change_flexibility: briefData.change_flexibility,
        
        // Category-specific fields
        ...(briefData.design_category === 'branding-logo' && {
          brand_identity_type: briefData.brand_identity_type,
          brand_deliverables: briefData.brand_deliverables,
          industry_sector: briefData.industry_sector,
          brand_values: briefData.brand_values,
          target_market: briefData.target_market,
          brand_personality: briefData.brand_personality,
          logo_style_preference: briefData.logo_style_preference,
          color_preferences: briefData.color_preferences,
          brand_assets_status: briefData.brand_assets_status,
          existing_brand_elements: briefData.existing_brand_elements,
          logo_usage: briefData.logo_usage
        }),
        ...(briefData.design_category === 'web-mobile' && {
          digital_product_type: briefData.digital_product_type,
          number_of_screens: briefData.number_of_screens,
          key_features: briefData.key_features,
          design_inspiration: briefData.design_inspiration,
          technical_requirements: briefData.technical_requirements,
          accessibility_requirements: briefData.accessibility_requirements,
          content_strategy: briefData.content_strategy,
          integration_needs: briefData.integration_needs,
          user_research_needed: briefData.user_research_needed,
          development_status: briefData.development_status,
          design_deliverables: briefData.design_deliverables
        }),
        ...(briefData.design_category === 'social-media' && {
          social_platforms: briefData.social_platforms,
          social_content_types: briefData.social_content_types,
          social_quantity: briefData.social_quantity,
          social_post_count: briefData.social_post_count,
          social_brand_guidelines: briefData.social_brand_guidelines,
          social_frequency: briefData.social_frequency
        }),
        ...(briefData.design_category === 'motion-graphics' && {
          motion_type: briefData.motion_type,
          video_length: briefData.video_length,
          animation_style: briefData.animation_style,
          motion_needs: briefData.motion_needs,
          motion_usage: briefData.motion_usage
        }),
        ...(briefData.design_category === 'photography-video' && {
          visual_content_type: briefData.visual_content_type,
          asset_quantity: briefData.asset_quantity,
          production_requirements: briefData.production_requirements,
          usage_rights: briefData.usage_rights,
          delivery_formats: briefData.delivery_formats
        }),
        ...(briefData.design_category === 'presentations' && {
          presentation_type: briefData.presentation_type,
          slide_count: briefData.slide_count,
          presentation_requirements: briefData.presentation_requirements,
          content_status: briefData.content_status,
          software_preference: briefData.software_preference
        })
      }
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

    console.log('✅ Public enhanced brief created:', brief.id)

    return apiResponse.success({
      brief: {
        id: brief.id,
        client_id: brief.client_id,
        design_category: brief.project_type,
        timeline_type: brief.timeline,
        budget_range: brief.budget,
        created_at: brief.created_at
      },
      message: 'Brief submitted successfully',
      clientId: clientId,
      briefId: brief.id // Make sure briefId is included
    })

  } catch (error) {
    return handleApiError(error, 'briefs/public')
  }
}