import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

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
      logger.error('Error fetching designers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch designers' },
        { status: 500 }
      )
    }

    // Map database fields to frontend format (matching actual application fields)
    const designersWithDetails = designers.map((designer) => {
      return {
        // Basic info (from application form)
        id: designer.id,
        firstName: designer.first_name,
        lastName: designer.last_name,
        email: designer.email,
        phone: designer.phone,
        avatar: designer.avatar_url, // This is profilePicture in the application
        
        // Professional info (from application form)
        title: designer.title,
        portfolioUrl: designer.portfolio_url || designer.website_url,
        dribbbleUrl: designer.dribbble_url,
        behanceUrl: designer.behance_url,
        linkedinUrl: designer.linkedin_url,
        
        // Location (from application form)
        city: designer.city,
        country: designer.country,
        
        // Availability (from application form)
        availability: designer.availability,
        
        // Bio (from application form)
        bio: designer.bio,
        
        // Status (internal admin fields)
        isVerified: designer.is_verified,
        isApproved: designer.is_approved,
        rejectionReason: designer.rejection_reason || null,
        
        // Metadata (internal admin fields)
        createdAt: designer.created_at,
        updatedAt: designer.updated_at,
        editedAfterApproval: designer.edited_after_approval || false,
        
        // Portfolio images - stored in tools array field (temporary storage)
        portfolio_images: Array.isArray(designer.tools) ? designer.tools : [],
        
        // Fields for backward compatibility (not in application)
        yearsExperience: designer.years_experience || '',
        websiteUrl: designer.website_url,
        projectTypes: designer.project_types || [],
        styles: designer.styles || [],
        industries: designer.industries || [],
        specializations: [],
        softwareSkills: []
      }
    })

    return NextResponse.json({
      designers: designersWithDetails,
      total: designersWithDetails.length,
    })
  } catch (error) {
    logger.error('Error in admin designers route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designers' },
      { status: 500 }
    )
  }
}