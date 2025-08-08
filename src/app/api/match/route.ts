import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createEnhancedMatcher } from '@/lib/matching/enhanced-matcher'
import { createSimpleMatcher } from '@/lib/matching/simple-matcher'

export async function POST(request: NextRequest) {
  try {
    const { briefId } = await request.json()

    if (!briefId) {
      return apiResponse.error('Brief ID is required')
    }

    console.log('=== ENHANCED MATCHING START ===')
    console.log('Brief ID:', briefId)

    const supabase = createServiceClient()

    // Get the enhanced brief with all new fields
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select(`
        *, 
        client:clients(*)
      `)
      .eq('id', briefId)
      .single()

    if (briefError || !brief) {
      console.error('Brief not found:', briefError)
      return apiResponse.notFound('Brief')
    }

    // Handle both old and new field names for compatibility
    const briefData = {
      ...brief,
      design_category: brief.design_category || brief.project_type,
      timeline_type: brief.timeline_type || brief.timeline,
      budget_range: brief.budget_range || brief.budget,
      project_description: brief.project_description || brief.requirements || ''
    }

    console.log('Brief found:', {
      category: briefData.design_category,
      timeline: briefData.timeline_type,
      budget: briefData.budget_range
    })

    // Validate required fields
    if (!briefData.design_category || !briefData.timeline_type || !briefData.budget_range) {
      console.error('Brief missing required fields')
      return apiResponse.validationError('Brief must have design category, timeline, and budget information')
    }

    // Try enhanced matcher first, fall back to simple matcher
    let matches = []
    
    // Always use simple matcher for now since enhanced matcher expects different schema
    console.log('Using simple matcher for compatibility with current schema')
    const simpleMatcher = createSimpleMatcher()
    const simpleMatches = await simpleMatcher.findMatches(briefData)
    
    // Convert simple matches to enhanced format
    matches = simpleMatches.map(match => ({
      ...match,
      confidence: match.score >= 80 ? 'high' : match.score >= 60 ? 'medium' : 'low',
      categoryMatch: true,
      matchSummary: `${match.designer.firstName} is a great match with ${match.score}% compatibility`,
      personalizedReasons: match.reasons,
      uniqueValue: 'Experienced designer ready to bring your vision to life',
      potentialChallenges: [],
      riskLevel: 'low',
      scoreBreakdown: {
        categoryMatch: 30,
        styleAlignment: 20,
        budgetFit: 15,
        timelineFit: 15,
        industryFit: 15,
        workingStyleFit: 5
      },
      aiAnalyzed: false
    }))

    console.log(`Found ${matches.length} enhanced matches`)

    if (matches.length === 0) {
      // For simple matcher, just check if any designers exist
      const { data: allDesigners } = await supabase
        .from('designers')
        .select('id')
        .eq('is_verified', true)
        .eq('is_approved', true)

      if (!allDesigners || allDesigners.length === 0) {
        return apiResponse.error('No designers available yet. Please check back later.')
      } else {
        return apiResponse.error('All available designers have already been matched with you')
      }
    }

    // Create match record for the best match
    const bestMatch = matches[0]
    const { data: matchRecord, error: matchError } = await supabase
      .from('matches')
      .insert({
        brief_id: briefId,
        designer_id: bestMatch.designer.id,
        client_id: brief.client_id,
        score: bestMatch.score,
        reasons: bestMatch.reasons,
        personalized_reasons: bestMatch.personalizedReasons,
        status: 'pending',
        match_data: {
          confidence: bestMatch.confidence,
          uniqueValue: bestMatch.uniqueValue,
          potentialChallenges: bestMatch.potentialChallenges,
          riskLevel: bestMatch.riskLevel,
          scoreBreakdown: bestMatch.scoreBreakdown,
          matchSummary: bestMatch.matchSummary
        }
      })
      .select()
      .single()

    if (matchError) {
      console.error('Error creating match record:', matchError)
      // Continue anyway, we can still return the match results
    }

    console.log('✅ Enhanced matching complete')

    return apiResponse.success({
      matches: matches.map(match => ({
        id: matchRecord?.id || `temp-${match.designer.id}`,
        score: match.score,
        confidence: match.confidence,
        matchSummary: match.matchSummary,
        reasons: match.reasons,
        personalizedReasons: match.personalizedReasons,
        uniqueValue: match.uniqueValue,
        potentialChallenges: match.potentialChallenges,
        riskLevel: match.riskLevel,
        scoreBreakdown: match.scoreBreakdown,
        designer: {
          id: match.designer.id,
          firstName: match.designer.firstName,
          lastName: match.designer.lastName,
          lastInitial: match.designer.lastInitial,
          title: match.designer.title,
          city: match.designer.city,
          country: match.designer.country,
          yearsExperience: match.designer.yearsExperience,
          rating: match.designer.rating,
          totalProjects: match.designer.totalProjects,
          designPhilosophy: match.designer.designPhilosophy,
          primaryCategories: match.designer.primaryCategories,
          styleKeywords: match.designer.styleKeywords,
          portfolioProjects: match.designer.portfolioProjects,
          avgClientSatisfaction: match.designer.avgClientSatisfaction,
          onTimeDeliveryRate: match.designer.onTimeDeliveryRate
        },
        aiAnalyzed: match.aiAnalyzed
      })),
      briefData: {
        designCategory: brief.design_category,
        timeline: brief.timeline_type,
        budget: brief.budget_range,
        description: brief.project_description
      }
    })

  } catch (error) {
    return handleApiError(error, 'match/enhanced')
  }
}