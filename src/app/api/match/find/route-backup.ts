import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createAIProvider } from '@/lib/ai'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    logger.info('Match API received:', body)
    
    const { briefId } = body

    if (!briefId) {
      logger.error('No briefId provided in request body')
      return NextResponse.json(
        { error: 'Brief ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get the brief
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single()

    if (briefError || !brief) {
      logger.error('Brief not found:', briefError)
      return NextResponse.json(
        { error: 'Brief not found' },
        { status: 404 }
      )
    }

    // For testing: Comment out this block to always create new matches
    // In production, uncomment to avoid duplicate matches
    /*
    const { data: existingMatches, error: existingMatchError } = await supabase
      .from('matches')
      .select(`
        *,
        designer:designers(*)
      `)
      .eq('brief_id', briefId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingMatches && existingMatches.length > 0 && !existingMatchError) {
      const existingMatch = existingMatches[0]
      logger.info('Match already exists for brief:', briefId)
      // Return the existing match
      return NextResponse.json({
        success: true,
        match: {
          id: existingMatch.id,
          score: existingMatch.score,
          reasons: existingMatch.reasons,
          personalizedReasons: existingMatch.personalized_reasons,
          designer: {
            id: existingMatch.designer.id,
            firstName: existingMatch.designer.first_name,
            lastInitial: existingMatch.designer.last_initial,
            title: existingMatch.designer.title,
            city: existingMatch.designer.city,
            country: existingMatch.designer.country,
            yearsExperience: existingMatch.designer.years_experience,
            rating: existingMatch.designer.rating || 4.5,
            totalProjects: existingMatch.designer.total_projects || 0,
            avatarUrl: existingMatch.designer.avatar_url,
            styles: existingMatch.designer.styles || [],
            industries: existingMatch.designer.industries || []
          }
        }
      })
    }
    */

    // Get all available designers
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('*')
      .eq('is_verified', true)
      .in('availability', ['available', 'busy'])

    if (designersError || !designers || designers.length === 0) {
      logger.error('No designers found:', designersError)
      return NextResponse.json(
        { error: 'No designers available' },
        { status: 404 }
      )
    }

    // Initialize AI provider
    let aiProvider
    try {
      aiProvider = createAIProvider()
    } catch (error) {
      logger.error('Failed to create AI provider:', error)
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      )
    }
    
    logger.info(`Analyzing ${designers.length} designers for brief ${briefId}`)
    
    // Limit the number of designers to analyze to avoid rate limits
    // Free tier allows 15 requests per minute, so we'll analyze top 10 designers
    const MAX_DESIGNERS_TO_ANALYZE = 10
    
    // Pre-filter designers based on basic criteria to get better matches
    let preFilteredDesigners = designers
      .filter(designer => {
        // Basic relevance check
        const hasMatchingStyle = designer.styles?.some(style => 
          brief.styles?.some(bs => bs.toLowerCase() === style.toLowerCase())
        )
        const hasMatchingIndustry = designer.industries?.some(ind => 
          ind.toLowerCase().includes(brief.industry?.toLowerCase()) ||
          brief.industry?.toLowerCase().includes(ind.toLowerCase())
        )
        return hasMatchingStyle || hasMatchingIndustry || designer.availability === 'available'
      })
    
    // If we don't have enough relevant designers, just take the first ones
    if (preFilteredDesigners.length < MAX_DESIGNERS_TO_ANALYZE) {
      preFilteredDesigners = designers.slice(0, MAX_DESIGNERS_TO_ANALYZE)
    } else {
      preFilteredDesigners = preFilteredDesigners.slice(0, MAX_DESIGNERS_TO_ANALYZE)
    }
    
    logger.info(`Pre-filtered to ${preFilteredDesigners.length} most relevant designers`)
    
    // Use AI to analyze matches
    let aiQuotaExceeded = false
    let aiServiceError = false
    
    const matchPromises = preFilteredDesigners.map(async (designer, index) => {
      try {
        // Add a small delay between requests to avoid rate limiting
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 100 * index))
        }
        
        logger.info(`Analyzing designer ${index + 1}/${preFilteredDesigners.length}: ${designer.first_name} ${designer.last_name}`)
        const matchResult = await aiProvider.analyzeMatch(designer, brief)
        logger.info(`Designer ${designer.id} scored: ${matchResult.score}`)
        return {
          designer,
          ...matchResult
        }
      } catch (error: any) {
        logger.error(`AI matching failed for designer ${designer.id}:`, error)
        
        // Check for specific AI errors
        if (error.message === 'AI_QUOTA_EXCEEDED') {
          aiQuotaExceeded = true
        } else if (error.message === 'AI_RATE_LIMITED') {
          // Don't treat rate limiting as a complete failure
          logger.info('Rate limited - will continue with matches we have')
        } else if (error.message === 'AI_SERVICE_ERROR') {
          aiServiceError = true
        }
        
        // Return null to filter out failed matches
        return null
      }
    })
    
    let scoredDesigners
    try {
      const results = await Promise.all(matchPromises)
      // Filter out null results (failed AI matches)
      scoredDesigners = results.filter(result => result !== null)
      logger.info(`Successfully scored ${scoredDesigners.length} out of ${designers.length} designers`)
      
      // If AI quota was exceeded (daily limit), return error
      if (aiQuotaExceeded) {
        return NextResponse.json(
          { 
            error: 'AI_QUOTA_EXCEEDED',
            message: "We're experiencing high demand. Our team is working on it and will resolve this soon.",
            userMessage: "There's a problem with our matching system. Our team will solve it soon. Please try again later."
          },
          { status: 503 }
        )
      }
      
      // If we got some matches despite rate limiting, continue
      if (scoredDesigners.length === 0) {
        return NextResponse.json(
          { 
            error: 'NO_MATCHES_FOUND',
            message: "Unable to find suitable designers",
            userMessage: "We couldn't find any designers matching your requirements. Please try adjusting your criteria."
          },
          { status: 404 }
        )
      }
      
      if (aiServiceError && scoredDesigners.length < designers.length / 2) {
        return NextResponse.json(
          { 
            error: 'AI_SERVICE_ERROR',
            message: 'AI service is temporarily unavailable',
            userMessage: "There's a problem with our matching system. Our team will solve it soon. Please try again later."
          },
          { status: 503 }
        )
      }
    } catch (error) {
      logger.error('Error scoring designers:', error)
      return NextResponse.json(
        { 
          error: 'MATCHING_ERROR',
          message: 'Failed to analyze designer matches',
          userMessage: "There's a problem with our matching system. Our team will solve it soon. Please try again later."
        },
        { status: 503 }
      )
    }

    // Sort by score and get the best match
    const sortedDesigners = scoredDesigners.sort((a, b) => b.score - a.score)
    
    if (sortedDesigners.length === 0) {
      logger.error('No designers scored')
      return NextResponse.json(
        { error: 'No suitable designers found' },
        { status: 404 }
      )
    }
    
    // Add some randomization to avoid always getting the same designer
    // Take top 5 designers and randomly pick one
    const topDesigners = sortedDesigners.slice(0, Math.min(5, sortedDesigners.length))
    const randomIndex = Math.floor(Math.random() * topDesigners.length)
    const bestMatch = topDesigners[randomIndex]
    
    if (!bestMatch || !bestMatch.designer) {
      logger.error('No best match found')
      return NextResponse.json(
        { error: 'Failed to find a suitable match' },
        { status: 500 }
      )
    }

    // Create match record
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        brief_id: briefId,
        designer_id: bestMatch.designer.id,
        client_id: brief.client_id,
        score: Math.round(bestMatch.score),
        reasons: [
          'Experienced designer',
          'Available for projects',
          'Great portfolio'
        ],
        personalized_reasons: [
          `${bestMatch.designer.years_experience} years of experience in ${
            bestMatch.designer.industries?.find(ind => 
              ind.toLowerCase().includes(brief.industry?.toLowerCase() || '') ||
              brief.industry?.toLowerCase().includes(ind.toLowerCase())
            ) || bestMatch.designer.industries?.[0] || 'design'
          }`,
          `Expert in ${
            bestMatch.designer.styles?.find(style => 
              brief.styles?.some(bs => bs.toLowerCase() === style.toLowerCase())
            ) || bestMatch.designer.styles?.[0] || 'modern'
          } design style which aligns perfectly with your vision`,
          bestMatch.designer.availability === 'available' 
            ? `Currently available and ready to start on your ${brief.project_type || 'project'}`
            : `Based in ${bestMatch.designer.city}, ${bestMatch.designer.country} with a strong portfolio`
        ],
        status: 'pending'
      })
      .select()
      .single()

    if (matchError) {
      logger.error('Error creating match:', matchError)
      logger.error('Match error details:', {
        code: matchError.code,
        message: matchError.message,
        details: matchError.details,
        hint: matchError.hint
      })
      
      // If it's a duplicate key error, try to get the existing match
      if (matchError.code === '23505') { // PostgreSQL unique violation
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('*, designer:designers(*)')
          .eq('brief_id', briefId)
          .single()
          
        if (existingMatch) {
          return NextResponse.json({
            success: true,
            match: {
              id: existingMatch.id,
              score: existingMatch.score,
              reasons: existingMatch.reasons,
              personalizedReasons: existingMatch.personalized_reasons,
              designer: {
                id: existingMatch.designer.id,
                firstName: existingMatch.designer.first_name,
                lastInitial: existingMatch.designer.last_initial,
                title: existingMatch.designer.title,
                city: existingMatch.designer.city,
                country: existingMatch.designer.country,
                yearsExperience: existingMatch.designer.years_experience,
                rating: existingMatch.designer.rating || 4.5,
                totalProjects: existingMatch.designer.total_projects || 0,
                avatarUrl: existingMatch.designer.avatar_url,
                styles: existingMatch.designer.styles || [],
                industries: existingMatch.designer.industries || []
              }
            }
          })
        }
      }
      
      throw matchError
    }

    // Create designer request
    const { error: requestError } = await supabase
      .from('designer_requests')
      .insert({
        match_id: match.id,
        designer_id: bestMatch.designer.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (requestError) {
      logger.error('Error creating designer request:', requestError)
    }

    // Return match with designer info
    return NextResponse.json({
      success: true,
      match: {
        id: match.id,
        score: match.score,
        reasons: match.reasons,
        personalizedReasons: match.personalized_reasons,
        designer: {
          id: bestMatch.designer.id,
          firstName: bestMatch.designer.first_name,
          lastInitial: bestMatch.designer.last_initial,
          title: bestMatch.designer.title,
          city: bestMatch.designer.city,
          country: bestMatch.designer.country,
          yearsExperience: bestMatch.designer.years_experience,
          rating: bestMatch.designer.rating || 4.5,
          totalProjects: bestMatch.designer.total_projects || 0,
          avatarUrl: bestMatch.designer.avatar_url,
          styles: bestMatch.designer.styles || [],
          industries: bestMatch.designer.industries || []
        }
      }
    })
  } catch (error) {
    logger.error('Error in match API:', error)
    logger.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
      fullError: error
    })
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to find match' },
      { status: 500 }
    )
  }
}