import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyCustomOTP } from '@/lib/auth/custom-otp'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email/send-email'
import { welcomeDesignerEmail } from '@/lib/email/templates/welcome-designer'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

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

    // Create designer profile with all application data
    const { data: designer, error } = await supabase
      .from('designers')
      .insert({
        // Basic Info
        first_name: applicationData.firstName,
        last_name: applicationData.lastName,
        last_initial: applicationData.lastName ? applicationData.lastName.charAt(0).toUpperCase() : '',
        email: applicationData.email,
        phone: applicationData.phone || null,
        
        // Professional Info
        title: applicationData.title,
        years_experience: applicationData.yearsExperience, // This will store as string (e.g., "3-5")
        website_url: applicationData.websiteUrl,
        portfolio_url: applicationData.portfolioUrl || null,
        project_price_from: parseFloat(applicationData.projectPriceFrom),
        project_price_to: parseFloat(applicationData.projectPriceTo),
        
        // Location & Availability
        city: applicationData.city,
        country: applicationData.country,
        timezone: applicationData.timezone,
        availability: applicationData.availability,
        
        // Style & Expertise
        bio: applicationData.bio,
        
        // Enhanced Portfolio
        dribbble_url: applicationData.dribbbleUrl || null,
        behance_url: applicationData.behanceUrl || null,
        linkedin_url: applicationData.linkedinUrl || null,
        
        // Experience & Preferences
        previous_clients: applicationData.previousClients || null,
        project_preferences: applicationData.projectPreferences,
        working_style: applicationData.workingStyle,
        communication_style: applicationData.communicationStyle,
        remote_experience: applicationData.remoteExperience,
        team_collaboration: applicationData.teamCollaboration || null,
        
        // Status flags
        is_verified: true, // Email verified
        is_approved: false, // Needs admin approval
        is_available: true,
        
        // Defaults
        rating: 0, // No rating yet
        total_projects: 0,
        subscription_tier: 'free'
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating designer:', error)
      return apiResponse.serverError('Failed to create designer profile', error)
    }

    // Insert styles
    if (applicationData.styles && applicationData.styles.length > 0) {
      const styleRecords = applicationData.styles.map((style: string) => ({
        designer_id: designer.id,
        style
      }))
      await supabase.from('designer_styles').insert(styleRecords)
    }

    // Insert project types
    if (applicationData.projectTypes && applicationData.projectTypes.length > 0) {
      const projectTypeRecords = applicationData.projectTypes.map((projectType: string) => ({
        designer_id: designer.id,
        project_type: projectType
      }))
      await supabase.from('designer_project_types').insert(projectTypeRecords)
    }

    // Insert industries
    if (applicationData.industries && applicationData.industries.length > 0) {
      const industryRecords = applicationData.industries.map((industry: string) => ({
        designer_id: designer.id,
        industry
      }))
      await supabase.from('designer_industries').insert(industryRecords)
    }

    // Insert specializations
    if (applicationData.specializations && applicationData.specializations.length > 0) {
      const specializationRecords = applicationData.specializations.map((specialization: string) => ({
        designer_id: designer.id,
        specialization
      }))
      await supabase.from('designer_specializations').insert(specializationRecords)
    }

    // Insert software skills
    if (applicationData.softwareSkills && applicationData.softwareSkills.length > 0) {
      const softwareRecords = applicationData.softwareSkills.map((software: string) => ({
        designer_id: designer.id,
        software
      }))
      await supabase.from('designer_software_skills').insert(softwareRecords)
    }

    // Send welcome email to new designer
    const { subject, html, text } = welcomeDesignerEmail({
      designerName: designer.first_name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/designer/dashboard`
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
        lastName: designer.last_name,
        isApproved: designer.is_approved
      }
    })
  } catch (error) {
    return handleApiError(error, 'designer/verify')
  }
}