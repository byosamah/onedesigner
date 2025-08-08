import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createAIProvider } from '@/lib/ai'
import { AI_CONFIG } from '@/lib/ai/config'

export async function POST(request: NextRequest) {
  try {
    const { briefId } = await request.json()

    if (!briefId) {
      return apiResponse.error('Brief ID is required')
    }

    console.log('=== AI MATCHING START ===')
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

    // Get approved designers with portfolio images
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('*, portfolio_image_1, portfolio_image_2, portfolio_image_3')
      .eq('is_verified', true)
      .eq('is_approved', true)
      .eq('availability', 'available')

    if (designersError || !designers || designers.length === 0) {
      console.error('No available designers')
      return apiResponse.error('No designers available yet. Please check back later.')
    }

    // Exclude already matched designers (if client exists)
    let availableDesigners = designers
    
    if (brief.client_id) {
      const { data: previousMatches } = await supabase
        .from('matches')
        .select('designer_id')
        .eq('client_id', brief.client_id)

      const excludedIds = previousMatches?.map(m => m.designer_id) || []
      availableDesigners = designers.filter(d => !excludedIds.includes(d.id))

      if (availableDesigners.length === 0) {
        return apiResponse.error('All available designers have already been matched with you')
      }
    }

    // Use AI to analyze matches
    console.log(`Analyzing ${availableDesigners.length} designers with AI...`)
    
    const ai = createAIProvider()
    const matches = []

    // Analyze each designer with AI
    for (const designer of availableDesigners.slice(0, 5)) { // Limit to top 5 for performance
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
            portfolioImages: [
              designer.portfolio_image_1,
              designer.portfolio_image_2,
              designer.portfolio_image_3
            ].filter(Boolean), // Remove null/undefined values
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
        console.error('AI analysis failed for designer:', designer.id, error)
        // Fallback to simple scoring if AI fails
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
            portfolioImages: [
              designer.portfolio_image_1,
              designer.portfolio_image_2,
              designer.portfolio_image_3
            ].filter(Boolean), // Remove null/undefined values
            avgClientSatisfaction: 95,
            onTimeDeliveryRate: 98
          },
          score: 70,
          confidence: 'medium',
          matchSummary: `${designer.first_name} is an experienced designer ready for your project`,
          reasons: ['Verified designer', 'Available for new projects', `${designer.years_experience} years of experience`],
          personalizedReasons: ['Verified designer', 'Available for new projects', `${designer.years_experience} years of experience`],
          uniqueValue: 'Experienced designer ready to bring your vision to life',
          potentialChallenges: [],
          riskLevel: 'low',
          scoreBreakdown: {
            categoryMatch: 20,
            styleAlignment: 15,
            budgetCompatibility: 10,
            timelineCompatibility: 10,
            experienceLevel: 10,
            industryFamiliarity: 5
          },
          aiAnalyzed: false
        })
      }
    }

    // Sort matches by score
    matches.sort((a, b) => b.score - a.score)

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