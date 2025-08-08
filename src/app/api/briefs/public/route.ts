import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const briefData = await request.json()
    console.log('Public enhanced brief submission:', briefData)

    // Validate required fields
    const requiredFields = ['design_category', 'project_description', 'timeline_type', 'budget_range']
    for (const field of requiredFields) {
      if (!briefData[field]) {
        return apiResponse.validationError(`${field} is required`)
      }
    }

    const supabase = createServiceClient()

    // Create a temporary client ID for anonymous submissions
    const tempClientId = uuidv4()

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

    // Create brief record with only fields that exist in the original schema
    const briefInsert: any = {
      client_id: tempClientId,
      project_type: briefData.design_category || 'web-mobile',
      industry: briefData.target_audience || briefData.industry_sector || 'General',
      timeline: briefData.timeline_type || 'standard',
      budget: briefData.budget_range || 'mid',
      styles: briefData.design_style_keywords || [],
      inspiration: briefData.design_examples?.join(', ') || '',
      requirements: briefData.project_description || '',
      communication: briefData.communication_channels || ['email'],
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
      console.error('Error creating brief:', error)
      return apiResponse.serverError('Failed to create brief', error)
    }

    console.log('✅ Public enhanced brief created:', brief.id)

    return apiResponse.success({
      brief: {
        id: brief.id,
        design_category: brief.design_category,
        timeline_type: brief.timeline_type,
        budget_range: brief.budget_range,
        created_at: brief.created_at
      },
      message: 'Brief submitted successfully',
      tempClientId // Return this so the frontend knows it's a temporary submission
    })

  } catch (error) {
    return handleApiError(error, 'briefs/public')
  }
}