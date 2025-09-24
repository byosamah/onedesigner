import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'
import { getDesignerSessionCookie, parseSessionCookie } from '@/lib/auth/cookie-utils'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get designer session from cookie with backward compatibility
    const sessionCookie = getDesignerSessionCookie()
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = parseSessionCookie(sessionCookie.value)

    if (!session || !session.designerId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { designerId } = session

    const supabase = createServiceClient()

    // Get designer requests with related data
    const { data: requests, error } = await supabase
      .from('project_requests')
      .select(`
        id,
        status,
        sent_at,
        viewed_at,
        responded_at,
        expires_at,
        matches (
          id,
          score,
          personalized_reasons,
          briefs (
            project_type,
            industry,
            timeline,
            budget,
            styles,
            inspiration,
            requirements
          ),
          clients (
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
        .from('project_requests')
        .update({ viewed_at: new Date().toISOString() })
        .in('id', pendingIds)
    }

    // Format the response
    const formattedRequests = requests?.map(request => ({
      id: request.id,
      matchId: request.matches?.id,
      status: request.status,
      sentAt: request.sent_at,
      viewedAt: request.viewed_at,
      respondedAt: request.responded_at,
      expiresAt: request.expires_at,
      brief: {
        designCategory: request.matches?.briefs?.project_type || '',
        projectDescription: request.matches?.briefs?.requirements || '',
        timeline: request.matches?.briefs?.timeline || '',
        budget: request.matches?.briefs?.budget || '',
        targetAudience: request.matches?.briefs?.industry || '',
        projectGoal: request.matches?.briefs?.inspiration || '',
        styleKeywords: request.matches?.briefs?.styles || []
      },
      client: {
        email: request.matches?.clients?.email || '',
        name: request.matches?.clients?.name,
        company: request.matches?.clients?.company,
      },
      match: {
        score: request.matches?.score || 0,
        personalizedReasons: request.matches?.personalized_reasons || [],
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