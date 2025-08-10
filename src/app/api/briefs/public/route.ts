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

    // Create brief record - ONLY using columns that actually exist in database
    // Based on actual schema from migrations/001_initial_schema.sql
    const briefInsert: any = {
      client_id: clientId,
      
      // Map enhanced form fields to existing database columns
      project_type: briefData.design_category || 'web-mobile',
      industry: briefData.target_audience || briefData.industry_sector || 'General',
      timeline: briefData.timeline_type || 'standard',
      budget: briefData.budget_range || 'mid',
      styles: briefData.design_style_keywords || [],
      inspiration: briefData.design_examples?.join(', ') || '',
      requirements: briefData.project_description || '',
      timezone: 'UTC', // Default timezone
      communication: briefData.communication_channels || ['email'],
      status: 'active'
      
      // NOTE: enhanced_data column doesn't exist, so we can't store extra data
      // All enhanced form data is mapped to existing columns above
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