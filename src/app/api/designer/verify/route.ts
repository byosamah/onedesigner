import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email/send-email'
import { welcomeDesignerEmail } from '@/lib/email/templates/welcome-designer'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { email, token, applicationData } = await request.json()

    if (!email || !token || !applicationData) {
      return apiResponse.error('Missing required fields')
    }

    // Verify OTP
    const isValid = await verifyCustomOTP(email, token)

    if (!isValid) {
      return apiResponse.unauthorized('Invalid or expired code')
    }

    const supabase = createServiceClient()

    // Create designer profile
    const { data: designer, error } = await supabase
      .from('designers')
      .insert({
        first_name: applicationData.firstName,
        last_initial: applicationData.lastName.charAt(0).toUpperCase(),
        last_name: applicationData.lastName,
        title: applicationData.title,
        email: applicationData.email,
        phone: applicationData.phone,
        city: applicationData.city,
        country: applicationData.country,
        years_experience: parseInt(applicationData.yearsExperience),
        bio: applicationData.bio,
        hourly_rate: applicationData.hourlyRate ? parseFloat(applicationData.hourlyRate) : null,
        timezone: applicationData.timezone,
        website_url: applicationData.websiteUrl,
        is_verified: true, // Verified through email
        is_available: applicationData.availability === 'available',
        subscription_tier: 'free',
        rating: 4.5, // Default rating
        total_projects: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating designer:', error)
      return apiResponse.serverError('Failed to create designer profile', error)
    }

    // Insert styles, project types, and industries into separate tables
    try {
      // Insert styles
      if (applicationData.styles && applicationData.styles.length > 0) {
        const styleRecords = applicationData.styles.map(style => ({
          designer_id: designer.id,
          style
        }))
        await supabase.from('designer_styles').insert(styleRecords)
      }

      // Insert project types
      if (applicationData.projectTypes && applicationData.projectTypes.length > 0) {
        const projectTypeRecords = applicationData.projectTypes.map(projectType => ({
          designer_id: designer.id,
          project_type: projectType
        }))
        await supabase.from('designer_project_types').insert(projectTypeRecords)
      }
    } catch (e) {
      console.log('Error inserting designer attributes, tables might not exist yet:', e)
    }

    // Send welcome email to new designer
    const { subject, html, text } = welcomeDesignerEmail({
      designerName: designer.first_name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/designer/dashboard`
    })
    
    await sendEmail({ to: email, subject, html, text })

    // Set session cookie for designer
    const cookieStore = cookies()
    cookieStore.set(AUTH_COOKIES.DESIGNER, JSON.stringify({
      email,
      designerId: designer.id,
      authenticatedAt: new Date().toISOString()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return apiResponse.success({ 
      success: true, 
      designer: {
        id: designer.id,
        email: designer.email,
        firstName: designer.first_name,
        lastName: designer.last_name
      }
    })
  } catch (error) {
    return handleApiError(error, 'designer/verify')
  }
}