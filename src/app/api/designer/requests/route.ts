import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get designer session from cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('designer-session')
    
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
      console.error('Error fetching requests:', error)
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
        projectType: request.match?.brief?.project_type,
        industry: request.match?.brief?.industry,
        timeline: request.match?.brief?.timeline,
        budget: request.match?.brief?.budget,
        styles: request.match?.brief?.styles,
        inspiration: request.match?.brief?.inspiration,
        requirements: request.match?.brief?.requirements,
      },
      client: {
        email: request.match?.client?.email,
        name: request.match?.client?.name,
        company: request.match?.client?.company,
      },
      match: {
        score: request.match?.score,
        personalizedReasons: request.match?.personalized_reasons,
      }
    })) || []

    return NextResponse.json({
      success: true,
      requests: formattedRequests
    })
  } catch (error) {
    console.error('Error in designer requests:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}