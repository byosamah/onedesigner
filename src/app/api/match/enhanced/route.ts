import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createEnhancedMatcher } from '@/lib/matching/enhanced-matcher'

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

    console.log('Brief found:', {
      category: brief.design_category,
      timeline: brief.timeline_type,
      budget: brief.budget_range
    })

    // Validate required enhanced fields
    if (!brief.design_category || !brief.timeline_type || !brief.budget_range) {
      console.error('Brief missing enhanced fields')
      return apiResponse.validationError('Brief must have design category, timeline, and budget information')
    }

    // Use enhanced matcher
    const matcher = createEnhancedMatcher()
    const matches = await matcher.findMatches(brief)

    console.log(`Found ${matches.length} enhanced matches`)

    if (matches.length === 0) {
      // Check if there are any designers in this category at all
      const { data: categoryDesigners } = await supabase
        .from('designers')
        .select('id')
        .eq('is_verified', true)
        .eq('is_approved', true)
        .or(`primary_categories.cs.{${brief.design_category}}, secondary_categories.cs.{${brief.design_category}}`)

      if (!categoryDesigners || categoryDesigners.length === 0) {
        return apiResponse.error('No designers available in this category yet')
      } else {
        return apiResponse.error('All available designers in this category have already been matched with you')
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