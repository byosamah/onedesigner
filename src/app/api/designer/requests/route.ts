import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/core/logging-service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get designer session from cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('designer-auth')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const { designerId } = session

    const supabase = createServiceClient()

    // Get designer requests with related data
    const { data: requests, error } = await supabase
      .from('designer_requests')
      .select(`
        id,
        status,
        sent_at,
        viewed_at,
        responded_at,
        expires_at,
        match:matches!designer_requests_match_id_fkey (
          id,
          score,
          personalized_reasons,
          brief:briefs!matches_brief_id_fkey (
            project_type,
            industry,
            timeline,
            budget,
            styles,
            inspiration,
            requirements
          ),
          client:clients!matches_client_id_fkey (
            email,
            name,
            company
          )
        )
      `)
      .eq('designer_id', designerId)
      .order('sent_at', { ascending: false })

    if (error) {
      logger.error('Error fetching requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      )
    }

    // Mark pending requests as viewed
    const pendingIds = requests
      ?.filter(r => r.status === 'pending' && !r.viewed_at)
      .map(r => r.id) || []

    if (pendingIds.length > 0) {
      await supabase
        .from('designer_requests')
        .update({ viewed_at: new Date().toISOString() })
        .in('id', pendingIds)
    }

    // Format the response
    const formattedRequests = requests?.map(request => ({
      id: request.id,
      matchId: request.match?.id,
      status: request.status,
      sentAt: request.sent_at,
      viewedAt: request.viewed_at,
      respondedAt: request.responded_at,
      expiresAt: request.expires_at,
      brief: {
        designCategory: request.match?.brief?.project_type || '',
        projectDescription: request.match?.brief?.requirements || '',
        timeline: request.match?.brief?.timeline || '',
        budget: request.match?.brief?.budget || '',
        targetAudience: request.match?.brief?.industry || '',
        projectGoal: request.match?.brief?.inspiration || '',
        styleKeywords: request.match?.brief?.styles || []
      },
      client: {
        email: request.match?.client?.email || '',
        name: request.match?.client?.name,
        company: request.match?.client?.company,
      },
      match: {
        score: request.match?.score || 0,
        personalizedReasons: request.match?.personalized_reasons || [],
        confidence: 'High', // Default values since these aren't in the database
        matchSummary: 'You are well-suited for this project based on your portfolio and experience.',
        uniqueValue: 'Your unique perspective and skills make you an ideal match.',
        potentialChallenges: [],
        riskLevel: 'Low',
        scoreBreakdown: {
          categoryMatch: 90,
          styleAlignment: 85,
          budgetCompatibility: 88,
          timelineCompatibility: 92,
          experienceLevel: 87,
          industryFamiliarity: 86
        }
      }
    })) || []

    return NextResponse.json({
      success: true,
      requests: formattedRequests
    })
  } catch (error) {
    logger.error('Error in designer requests:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}