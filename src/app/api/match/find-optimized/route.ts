import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OptimizedMatcher } from '@/lib/matching/optimized-matcher'
import { cookies } from 'next/headers'
import { logger } from '@/lib/core/logging-service'

// GET endpoint for Server-Sent Events streaming
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const briefId = searchParams.get('briefId')
  
  if (!briefId) {
    return NextResponse.json(
      { error: 'Brief ID is required' },
      { status: 400 }
    )
  }

  // Set up SSE headers
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabase = createClient()
        
        // Verify session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Unauthorized' })}\n\n`))
          controller.close()
          return
        }

        // Get brief
        const { data: brief } = await supabase
          .from('briefs')
          .select('*')
          .eq('id', briefId)
          .eq('client_id', session.user.id)
          .single()

        if (!brief) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Brief not found' })}\n\n`))
          controller.close()
          return
        }

        // Get excluded designers
        const { data: previousMatches } = await supabase
          .from('matches')
          .select('designer_id')
          .eq('client_id', brief.client_id)
        
        const excludedDesignerIds = previousMatches?.map(m => m.designer_id) || []

        // Initialize optimized matcher
        const matcher = new OptimizedMatcher()
        
        // Listen for progressive match updates
        matcher.on('match', async (result) => {
          try {
            const data = {
              phase: result.phase,
              match: await formatMatchForResponse(result.match, supabase),
              confidence: result.confidence,
              elapsed: result.elapsed,
              alternatives: result.alternatives ? 
                await Promise.all(result.alternatives.map(alt => formatMatchForResponse(alt, supabase))) : []
            }

            // Send SSE event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

            // If final match, create match record
            if (result.phase === 'final') {
              await createMatchRecord(supabase, brief, result.match)
            }
          } catch (error) {
            logger.error('[SSE] Streaming error:', error)
          }
        })

        // Start matching process
        await matcher.findMatch({ ...brief, excludedDesignerIds })
        
        // Send completion signal
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
        
      } catch (error) {
        logger.error('[SSE] Error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          error: 'Failed to find match',
          message: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

// POST endpoint for non-streaming requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { briefId } = body

    if (!briefId) {
      return NextResponse.json(
        { error: 'Brief ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get the brief
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single()

    if (briefError || !brief) {
      return NextResponse.json(
        { error: 'Brief not found' },
        { status: 404 }
      )
    }

    // Get all previously matched designers for exclusion
    const { data: previousMatches } = await supabase
      .from('matches')
      .select('designer_id')
      .eq('client_id', brief.client_id)
    
    const excludedDesignerIds = previousMatches?.map(m => m.designer_id) || []

    // Check if streaming is requested
    const acceptsEventStream = request.headers.get('accept')?.includes('text/event-stream')

    if (acceptsEventStream) {
      // Create streaming response
      const encoder = new TextEncoder()
      let controller: ReadableStreamDefaultController

      const stream = new ReadableStream({
        start(c) {
          controller = c
        }
      })

      // Initialize optimized matcher
      const matcher = new OptimizedMatcher()

      // Set up event listeners for progressive updates
      matcher.on('match', async (result) => {
        try {
          const data = {
            phase: result.phase,
            match: await formatMatchForResponse(result.match, supabase),
            confidence: result.confidence,
            elapsed: result.elapsed,
            alternatives: result.alternatives ? 
              await Promise.all(result.alternatives.map(alt => formatMatchForResponse(alt, supabase))) : []
          }

          // Send SSE event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

          // If final match, create match record and close stream
          if (result.phase === 'final') {
            await createMatchRecord(supabase, brief, result.match)
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          }
        } catch (error) {
          logger.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Processing error' })}\n\n`))
          controller.close()
        }
      })

      // Start matching process
      matcher.findMatch({ ...brief, excludedDesignerIds }).catch((error) => {
        logger.error('Matching error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
        controller.close()
      })

      // Return streaming response
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response - return best match quickly
      const matcher = new OptimizedMatcher()
      const instantMatch = await matcher.getInstantMatch({ ...brief, excludedDesignerIds })

      if (!instantMatch.topMatch) {
        return NextResponse.json(
          { 
            error: 'NO_SUITABLE_MATCHES',
            message: 'No suitable designers found for your requirements'
          },
          { status: 404 }
        )
      }

      // Create match record
      const match = await createMatchRecord(supabase, brief, instantMatch.topMatch)

      // Format response
      const formattedMatch = await formatMatchForResponse(instantMatch.topMatch, supabase)

      return NextResponse.json({
        success: true,
        match: {
          id: match.id,
          ...formattedMatch,
          confidence: 'low',
          phase: 'instant'
        }
      })
    }
  } catch (error) {
    logger.error('Error in optimized match API:', error)
    return NextResponse.json(
      { error: 'Failed to find match' },
      { status: 500 }
    )
  }
}

// Format match data for response
async function formatMatchForResponse(matchData: any, supabase: any) {
  const designer = matchData.designer

  return {
    score: matchData.score,
    confidence: matchData.confidence,
    reasons: matchData.reasons || [],
    personalizedReasons: matchData.personalizedReasons || matchData.strengths || [],
    matchExplanation: matchData.explanation,
    keyStrengths: matchData.strengths,
    quickStats: matchData.quickStats,
    uniqueValue: matchData.uniqueValue,
    designer: {
      id: designer.id,
      firstName: designer.first_name,
      lastName: designer.last_name,
      lastInitial: designer.last_initial || (designer.last_name ? designer.last_name.charAt(0).toUpperCase() : ''),
      title: designer.title || 'Designer',
      city: designer.city || 'Unknown',
      country: designer.country || '',
      yearsExperience: designer.years_experience || 0,
      rating: designer.rating || designer.quickStats?.avg_rating || 4.5,
      totalProjects: designer.total_projects || designer.quickStats?.total_projects || 0,
      avatarUrl: designer.avatar_url,
      styles: designer.styles || [],
      industries: designer.industries || [],
      specializations: designer.specializations || [],
      communicationStyle: designer.communication_style,
      teamSize: designer.team_size,
      avgClientSatisfaction: designer.avg_client_satisfaction,
      onTimeDeliveryRate: designer.on_time_delivery_rate,
      projectCompletionRate: designer.project_completion_rate
    }
  }
}

// Create match record in database
async function createMatchRecord(supabase: any, brief: any, matchData: any) {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      brief_id: brief.id,
      designer_id: matchData.designer.id,
      client_id: brief.client_id,
      score: matchData.score,
      reasons: matchData.reasons || [],
      personalized_reasons: matchData.personalizedReasons || matchData.strengths || [],
      status: 'pending'
    })
    .select()
    .single()

  if (matchError) {
    logger.error('Error creating match:', matchError)
    
    // Check if it's a duplicate match
    if (matchError.code === '23505') {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('brief_id', brief.id)
        .eq('designer_id', matchData.designer.id)
        .single()
        
      if (existingMatch) {
        return existingMatch
      }
    }
    
    throw matchError
  }

  // Create designer request
  if (match) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    await supabase
      .from('designer_requests')
      .insert({
        match_id: match.id,
        designer_id: matchData.designer.id,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
  }

  // Create match analytics record
  if (match?.id) {
    await supabase
      .from('match_analytics')
      .insert({
        match_id: match.id,
        client_id: brief.client_id,
        designer_id: matchData.designer.id,
        match_score: matchData.score,
        ai_confidence: matchData.confidence || 'low',
        match_reasons: matchData.personalizedReasons || matchData.reasons || []
      })
  }

  return match
}