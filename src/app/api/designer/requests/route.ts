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
        *,
        brief_snapshot,
        response_deadline,
        viewed_at,
        matches (
          id,
          score,
          reasons,
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
            id,
            email,
            name,
            company
          )
        )
      `)
      .eq('designer_id', designerId)
      .order('created_at', { ascending: false })

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

    // Format the response to match the expected frontend structure
    const formattedRequests = requests?.map(request => ({
      id: request.id,
      matchId: request.match_id,
      status: request.status,
      sentAt: request.created_at,
      viewedAt: request.viewed_at,
      respondedAt: request.approved_at || request.rejected_at,
      expiresAt: request.response_deadline,

      // Use brief_snapshot if available, otherwise fall back to matches.briefs
      brief: request.brief_snapshot ? {
        designCategory: request.brief_snapshot.project_type || '',
        projectDescription: request.brief_snapshot.requirements || request.brief_snapshot.project_description || '',
        timeline: request.brief_snapshot.timeline || '',
        budget: request.brief_snapshot.budget || '',
        targetAudience: request.brief_snapshot.industry || '',
        projectGoal: request.brief_snapshot.inspiration || '',
        styleKeywords: request.brief_snapshot.styles || []
      } : {
        designCategory: request.matches?.briefs?.project_type || '',
        projectDescription: request.matches?.briefs?.requirements || '',
        timeline: request.matches?.briefs?.timeline || '',
        budget: request.matches?.briefs?.budget || '',
        targetAudience: request.matches?.briefs?.industry || '',
        projectGoal: request.matches?.briefs?.inspiration || '',
        styleKeywords: request.matches?.briefs?.styles || []
      },

      client: {
        id: request.clients?.id || request.matches?.clients?.id,
        email: request.clients?.email || request.matches?.clients?.email || '',
        name: request.clients?.name || request.matches?.clients?.name,
        company: request.clients?.company || request.matches?.clients?.company,
      },

      match: {
        score: request.matches?.score || request.brief_snapshot?.match_score || 0,
        personalizedReasons: request.matches?.reasons || request.brief_snapshot?.match_reasons || [],
        confidence: 'High',
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