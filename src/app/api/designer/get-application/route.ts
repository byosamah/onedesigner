import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Find designer by update token and check expiry
    const { data: designer, error } = await supabase
      .from('designers')
      .select('*')
      .eq('update_token', token)
      .single()
    
    if (error || !designer) {
      logger.error('Designer not found with token:', token)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      )
    }
    
    // Check if token has expired
    if (designer.update_token_expires) {
      const expiryDate = new Date(designer.update_token_expires)
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: 'This update link has expired. Please contact support.' },
          { status: 410 }
        )
      }
    }
    
    // Format the data to match the application form structure
    const applicationData = {
      // Step 1: Basic Info
      firstName: designer.first_name,
      lastName: designer.last_name,
      email: designer.email,
      phone: designer.phone || '',
      profilePicture: designer.avatar_url || '',
      
      // Step 2: Professional Info
      title: designer.title,
      yearsExperience: designer.years_experience,
      websiteUrl: designer.website_url || '',
      projectPriceFrom: designer.project_price_from?.toString() || '',
      projectPriceTo: designer.project_price_to?.toString() || '',
      
      // Step 3: Location & Availability
      city: designer.city,
      country: designer.country,
      timezone: designer.timezone || '',
      availability: designer.availability || '',
      
      // Step 4: Style & Expertise
      styles: designer.styles || [],
      projectTypes: designer.project_types || [],
      industries: designer.industries || [],
      bio: designer.bio || '',
      
      // Step 5: Portfolio & Skills
      portfolioUrl: designer.portfolio_url || '',
      dribbbleUrl: designer.dribbble_url || '',
      behanceUrl: designer.behance_url || '',
      linkedinUrl: designer.linkedin_url || '',
      specializations: designer.specializations || [],
      softwareSkills: designer.software_skills || [],
      portfolioImages: [
        designer.portfolio_image_1,
        designer.portfolio_image_2,
        designer.portfolio_image_3
      ].filter(Boolean),
      
      // Step 6: Experience & Preferences
      previousClients: designer.previous_clients || '',
      projectPreferences: designer.project_preferences || '',
      workingStyle: designer.working_style || '',
      communicationStyle: designer.communication_style || '',
      remoteExperience: designer.remote_experience || '',
      teamCollaboration: designer.team_collaboration || '',
      
      // Additional info
      rejectionReason: designer.rejection_reason,
      designerId: designer.id
    }
    
    return NextResponse.json({
      success: true,
      applicationData
    })
    
  } catch (error) {
    logger.error('Error fetching designer application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}