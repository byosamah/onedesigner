import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  try {
    // Check designer session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('designer-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { designerId } = session
    if (!designerId) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }

    // Get the updated profile data
    const profileData = await request.json()
    
    // Extract arrays for separate tables
    const { styles, project_types, industries, ...designerData } = profileData

    const supabase = createServiceClient()
    
    // Start a transaction by updating the designer first
    const { error: updateError } = await supabase
      .from('designers')
      .update({
        first_name: designerData.first_name,
        last_name: designerData.last_name,
        last_initial: designerData.last_name?.charAt(0).toUpperCase(),
        email: designerData.email,
        phone: designerData.phone,
        title: designerData.title,
        years_experience: designerData.years_experience,
        website_url: designerData.website_url,
        hourly_rate: designerData.hourly_rate,
        city: designerData.city,
        country: designerData.country,
        timezone: designerData.timezone,
        bio: designerData.bio,
        is_available: designerData.is_available,
        calendly_url: designerData.calendly_url,
        linkedin_url: designerData.linkedin_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', designerId)

    if (updateError) {
      console.error('Error updating designer:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Update styles
    if (styles) {
      // Delete existing styles
      await supabase
        .from('designer_styles')
        .delete()
        .eq('designer_id', designerId)

      // Insert new styles
      if (styles.length > 0) {
        const styleRecords = styles.map(style => ({
          designer_id: designerId,
          style
        }))
        
        await supabase
          .from('designer_styles')
          .insert(styleRecords)
      }
    }

    // Update project types
    if (project_types) {
      // Delete existing project types
      await supabase
        .from('designer_project_types')
        .delete()
        .eq('designer_id', designerId)

      // Insert new project types
      if (project_types.length > 0) {
        const projectTypeRecords = project_types.map(project_type => ({
          designer_id: designerId,
          project_type
        }))
        
        await supabase
          .from('designer_project_types')
          .insert(projectTypeRecords)
      }
    }

    // Update industries
    if (industries) {
      // Delete existing industries
      await supabase
        .from('designer_industries')
        .delete()
        .eq('designer_id', designerId)

      // Insert new industries
      if (industries.length > 0) {
        const industryRecords = industries.map(industry => ({
          designer_id: designerId,
          industry
        }))
        
        await supabase
          .from('designer_industries')
          .insert(industryRecords)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}