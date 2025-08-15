import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createAIProvider } from '@/lib/ai'
import { AI_CONFIG } from '@/lib/ai/config'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    const { briefId, autoUnlock = false } = await request.json()

    if (!briefId) {
      return apiResponse.error('Brief ID is required')
    }

    logger.info('=== FINDING NEW MATCH START ===')
    logger.info('Brief ID:', briefId)
    logger.info('Auto Unlock:', autoUnlock)

    const supabase = createServiceClient()

    // Get the enhanced brief
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select(`
        *, 
        client:clients(*)
      `)
      .eq('id', briefId)
      .single()

    if (briefError || !brief) {
      logger.error('Brief not found:', briefError)
      return apiResponse.notFound('Brief')
    }

    // If auto-unlock is requested, check client has credits
    if (autoUnlock) {
      if (!brief.client || !brief.client.match_credits || brief.client.match_credits < 1) {
        logger.error('Insufficient credits for auto-unlock:', brief.client?.match_credits || 0)
        return apiResponse.error('Insufficient credits. Need at least 1 credit to find and unlock a new match.')
      }
    }

    // Handle both old and new field names for compatibility
    const briefData = {
      ...brief,
      design_category: brief.design_category || brief.project_type,
      timeline_type: brief.timeline_type || brief.timeline,
      budget_range: brief.budget_range || brief.budget,
      project_description: brief.project_description || brief.requirements || ''
    }

    // Get all previously unlocked designers for this client from client_designers table
    const { data: unlockedDesigners } = await supabase
      .from('client_designers')
      .select('designer_id')
      .eq('client_id', brief.client_id)
    
    // Also get existing matches for this brief (as backup/compatibility)
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('designer_id')
      .eq('brief_id', briefId)

    // Combine both lists and remove duplicates
    const unlockedIds = unlockedDesigners?.map(d => d.designer_id) || []
    const matchedIds = existingMatches?.map(m => m.designer_id) || []
    const excludedDesignerIds = [...new Set([...unlockedIds, ...matchedIds])]
    
    logger.info(`Excluding ${excludedDesignerIds.length} designers (${unlockedIds.length} unlocked, ${matchedIds.length} matched)`)

    // Get approved designers (excluding already matched ones)
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('*')
      .eq('is_verified', true)
      .eq('is_approved', true)
      .neq('availability', 'busy')
      .not('id', 'in', `(${excludedDesignerIds.join(',') || 'null'})`)

    if (designersError || !designers || designers.length === 0) {
      logger.error('No new designers available')
      return apiResponse.error('No new designers available for matching.')
    }

    logger.info(`Found ${designers.length} new designers to analyze`)

    // Use AI to analyze new matches
    const ai = createAIProvider()
    let matches = []

    // Analyze each designer with AI (limit to top 3 for performance)
    for (const designer of designers.slice(0, 3)) {
      try {
        const prompt = `
You are an expert design matchmaker. Analyze this designer-client match and provide a detailed assessment.

CLIENT BRIEF:
- Category: ${briefData.design_category}
- Timeline: ${briefData.timeline_type}
- Budget: ${briefData.budget_range}
- Description: ${briefData.project_description}
- Industry: ${briefData.industry || 'Not specified'}
- Styles: ${briefData.styles?.join(', ') || 'Not specified'}

DESIGNER PROFILE:
- Name: ${designer.first_name} ${designer.last_initial}
- Experience: ${designer.years_experience} years
- Categories: ${designer.categories?.join(', ') || 'Not specified'}
- Industries: ${designer.industries?.join(', ') || 'Not specified'}
- Styles: ${designer.styles?.join(', ') || 'Not specified'}
- Rating: ${designer.rating || 0}/5
- Projects: ${designer.total_projects || 0}
- Philosophy: ${designer.design_philosophy || 'Not specified'}

Provide a JSON response with:
{
  "score": <number 0-100>,
  "confidence": <"low" | "medium" | "high">,
  "matchSummary": <string explaining why this is a good/bad match>,
  "personalizedReasons": [<3-5 specific reasons>],
  "uniqueValue": <what makes this designer special for this project>,
  "potentialChallenges": [<0-2 potential issues>],
  "scoreBreakdown": {
    "categoryMatch": <0-30>,
    "styleAlignment": <0-25>,
    "budgetCompatibility": <0-15>,
    "timelineCompatibility": <0-10>,
    "experienceLevel": <0-10>,
    "industryFamiliarity": <0-10>
  }
}
`

        const completion = await ai.generateText({
          messages: [{ role: 'user', content: prompt }],
          model: AI_CONFIG.models.fast,
          temperature: 0.3,
          maxTokens: 800,
          responseFormat: { type: 'json_object' }
        })

        const analysis = JSON.parse(completion.text)
        
        matches.push({
          designer: {
            ...designer,
            firstName: designer.first_name,
            lastName: designer.last_name,
            lastInitial: designer.last_initial || designer.last_name?.charAt(0),
            title: designer.title,
            city: designer.city,
            country: designer.country,
            yearsExperience: designer.years_experience,
            rating: designer.rating,
            totalProjects: designer.total_projects,
            designPhilosophy: designer.design_philosophy,
            primaryCategories: designer.categories,
            styleKeywords: designer.styles,
            portfolioProjects: designer.portfolio_projects || [],
            portfolioImages: Array.isArray(designer.tools) ? designer.tools : [],
            avgClientSatisfaction: 95,
            onTimeDeliveryRate: 98
          },
          score: analysis.score,
          confidence: analysis.confidence,
          matchSummary: analysis.matchSummary,
          reasons: analysis.personalizedReasons.slice(0, 3),
          personalizedReasons: analysis.personalizedReasons,
          uniqueValue: analysis.uniqueValue,
          potentialChallenges: analysis.potentialChallenges || [],
          riskLevel: analysis.score >= 80 ? 'low' : analysis.score >= 60 ? 'medium' : 'high',
          scoreBreakdown: analysis.scoreBreakdown,
          aiAnalyzed: true
        })

      } catch (error) {
        logger.error('AI analysis failed for designer:', designer.id, error)
      }
    }

    // Sort matches by score and get the best one
    matches.sort((a, b) => b.score - a.score)

    if (matches.length === 0) {
      return apiResponse.error('No suitable new matches found')
    }

    // Create match record for the best new match
    const bestMatch = matches[0]
    
    // If auto-unlock, deduct credit first
    let remainingCredits = brief.client?.match_credits || 0
    if (autoUnlock) {
      const { error: creditError } = await supabase
        .from('clients')
        .update({ match_credits: brief.client.match_credits - 1 })
        .eq('id', brief.client_id)
      
      if (creditError) {
        logger.error('Error deducting credit:', creditError)
        return apiResponse.error('Failed to process credit payment')
      }
      remainingCredits = brief.client.match_credits - 1
      logger.info('✅ Credit deducted, remaining:', remainingCredits)
    }
    
    // Create match with appropriate status
    const { data: matchRecord, error: matchError } = await supabase
      .from('matches')
      .insert({
        brief_id: briefId,
        designer_id: bestMatch.designer.id,
        client_id: brief.client_id,
        score: bestMatch.score,
        reasons: bestMatch.reasons,
        personalized_reasons: bestMatch.personalizedReasons,
        status: autoUnlock ? 'unlocked' : 'pending'
      })
      .select()
      .single()

    if (matchError) {
      logger.error('Error creating new match record:', matchError)
      
      // If auto-unlock was attempted, refund the credit
      if (autoUnlock) {
        await supabase
          .from('clients')
          .update({ match_credits: brief.client.match_credits })
          .eq('id', brief.client_id)
      }
      
      return apiResponse.error('Failed to save new match')
    }
    
    // Record the unlock if auto-unlocked
    if (autoUnlock) {
      const { error: unlockError } = await supabase
        .from('match_unlocks')
        .insert({
          match_id: matchRecord.id,
          client_id: brief.client_id,
          amount: 0, // Using credit, not direct payment
        })
      
      if (unlockError) {
        logger.error('Error recording unlock:', unlockError)
        // Non-critical, continue
      }

      // Track this designer as unlocked by this client to prevent future matches
      // First check if the record already exists
      const { data: existingRecord } = await supabase
        .from('client_designers')
        .select('id')
        .eq('client_id', brief.client_id)
        .eq('designer_id', bestMatch.designer.id)
        .single()
      
      if (!existingRecord) {
        // Only insert if it doesn't exist
        const { error: clientDesignerError } = await supabase
          .from('client_designers')
          .insert({
            client_id: brief.client_id,
            designer_id: bestMatch.designer.id,
            unlocked_at: new Date().toISOString()
          })
        
        if (clientDesignerError) {
          logger.error('Error tracking unlocked designer:', clientDesignerError)
        } else {
          logger.info('✅ Tracked designer as unlocked for client')
        }
      }
    }

    logger.info('✅ New match found and saved')

    return apiResponse.success({
      match: {
        id: matchRecord.id,
        score: bestMatch.score,
        status: matchRecord.status, // Include status
        confidence: bestMatch.confidence,
        matchSummary: bestMatch.matchSummary,
        reasons: bestMatch.reasons,
        personalizedReasons: bestMatch.personalizedReasons,
        uniqueValue: bestMatch.uniqueValue,
        potentialChallenges: bestMatch.potentialChallenges,
        riskLevel: bestMatch.riskLevel,
        scoreBreakdown: bestMatch.scoreBreakdown,
        designer: {
          id: bestMatch.designer.id,
          firstName: bestMatch.designer.firstName,
          lastName: bestMatch.designer.lastName,
          lastInitial: bestMatch.designer.lastInitial,
          title: bestMatch.designer.title,
          city: bestMatch.designer.city,
          country: bestMatch.designer.country,
          yearsExperience: bestMatch.designer.yearsExperience,
          rating: bestMatch.designer.rating,
          totalProjects: bestMatch.designer.totalProjects,
          designPhilosophy: bestMatch.designer.designPhilosophy,
          primaryCategories: bestMatch.designer.primaryCategories,
          styleKeywords: bestMatch.designer.styleKeywords,
          portfolioProjects: bestMatch.designer.portfolioProjects,
          avgClientSatisfaction: bestMatch.designer.avgClientSatisfaction,
          onTimeDeliveryRate: bestMatch.designer.onTimeDeliveryRate
        },
        aiAnalyzed: bestMatch.aiAnalyzed
      },
      remainingCredits: autoUnlock ? remainingCredits : undefined
    })

  } catch (error) {
    return handleApiError(error, 'match/find-new')
  }
}