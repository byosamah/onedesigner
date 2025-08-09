import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('admin-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    
    // Get filter from query params
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'
    
    // Build query
    let query = supabase
      .from('designers')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (filter === 'pending') {
      query = query.eq('is_approved', false)
    } else if (filter === 'approved') {
      query = query.eq('is_approved', true)
    }

    const { data: designers, error } = await query

    if (error) {
      console.error('Error fetching designers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch designers' },
        { status: 500 }
      )
    }

    // Fetch all related data for each designer
    const designersWithDetails = await Promise.all(
      designers.map(async (designer) => {
        try {
          // Fetch styles
          const { data: styles } = await supabase
            .from('designer_styles')
            .select('style')
            .eq('designer_id', designer.id)
          
          // Fetch project types
          const { data: projectTypes } = await supabase
            .from('designer_project_types')
            .select('project_type')
            .eq('designer_id', designer.id)
          
          // Fetch industries
          const { data: industries } = await supabase
            .from('designer_industries')
            .select('industry')
            .eq('designer_id', designer.id)
          
          // Fetch specializations
          const { data: specializations } = await supabase
            .from('designer_specializations')
            .select('specialization')
            .eq('designer_id', designer.id)
          
          // Fetch software skills
          const { data: softwareSkills } = await supabase
            .from('designer_software_skills')
            .select('software')
            .eq('designer_id', designer.id)
          
          return {
            // Basic info
            id: designer.id,
            firstName: designer.first_name,
            lastName: designer.last_name,
            email: designer.email,
            phone: designer.phone,
            
            // Professional info
            title: designer.title,
            yearsExperience: designer.years_experience,
            websiteUrl: designer.website_url,
            portfolioUrl: designer.portfolio_url,
            projectPriceFrom: designer.project_price_from,
            projectPriceTo: designer.project_price_to,
            
            // Location & Availability
            city: designer.city,
            country: designer.country,
            timezone: designer.timezone,
            availability: designer.availability,
            
            // Bio
            bio: designer.bio,
            
            // Portfolio links
            dribbbleUrl: designer.dribbble_url,
            behanceUrl: designer.behance_url,
            linkedinUrl: designer.linkedin_url,
            
            // Experience & Preferences
            previousClients: designer.previous_clients,
            projectPreferences: designer.project_preferences,
            workingStyle: designer.working_style,
            communicationStyle: designer.communication_style,
            remoteExperience: designer.remote_experience,
            teamCollaboration: designer.team_collaboration,
            
            // Arrays from related tables
            styles: styles?.map(s => s.style) || designer.styles || [],
            projectTypes: projectTypes?.map(pt => pt.project_type) || designer.project_types || [],
            industries: industries?.map(i => i.industry) || designer.industries || [],
            specializations: specializations?.map(s => s.specialization) || [],
            softwareSkills: softwareSkills?.map(s => s.software) || [],
            
            // Status
            isVerified: designer.is_verified,
            isApproved: designer.is_approved,
            isAvailable: designer.is_available,
            
            // Metadata
            rating: designer.rating,
            totalProjects: designer.total_projects,
            createdAt: designer.created_at,
            updatedAt: designer.updated_at,
            editedAfterApproval: designer.edited_after_approval || false
          }
        } catch (e) {
          // If tables don't exist, return designer with arrays from main table
          return {
            ...designer,
            firstName: designer.first_name,
            lastName: designer.last_name,
            yearsExperience: designer.years_experience,
            websiteUrl: designer.website_url,
            portfolioUrl: designer.portfolio_url,
            projectPriceFrom: designer.project_price_from,
            projectPriceTo: designer.project_price_to,
            dribbbleUrl: designer.dribbble_url,
            behanceUrl: designer.behance_url,
            linkedinUrl: designer.linkedin_url,
            previousClients: designer.previous_clients,
            projectPreferences: designer.project_preferences,
            workingStyle: designer.working_style,
            communicationStyle: designer.communication_style,
            remoteExperience: designer.remote_experience,
            teamCollaboration: designer.team_collaboration,
            styles: designer.styles || [],
            projectTypes: designer.project_types || [],
            industries: designer.industries || [],
            specializations: [],
            softwareSkills: [],
            isVerified: designer.is_verified,
            isApproved: designer.is_approved,
            isAvailable: designer.is_available,
            totalProjects: designer.total_projects,
            createdAt: designer.created_at,
            updatedAt: designer.updated_at
          }
        }
      })
    )

    return NextResponse.json({
      designers: designersWithDetails,
      total: designersWithDetails.length,
      pending: designersWithDetails.filter(d => !d.isApproved).length,
      approved: designersWithDetails.filter(d => d.isApproved).length
    })
  } catch (error) {
    console.error('Error in admin designers route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}