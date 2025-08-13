import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { createAIProvider } from '@/lib/ai'
import { AI_CONFIG } from '@/lib/ai/config'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    const { briefId } = await request.json()

    if (!briefId) {
      return apiResponse.error('Brief ID is required')
    }

    logger.info('=== AI MATCHING START ===')
    logger.info('Brief ID:', briefId)

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
      logger.error('Brief not found:', briefError)
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

    logger.info('Brief found:', {
      category: briefData.design_category,
      timeline: briefData.timeline_type,
      budget: briefData.budget_range
    })

    // Validate required fields
    if (!briefData.design_category || !briefData.timeline_type || !briefData.budget_range) {
      logger.error('Brief missing required fields')
      return apiResponse.validationError('Brief must have design category, timeline, and budget information')
    }

    // Check if matches already exist for this brief
    const { data: existingMatches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        designer:designers(*)
      `)
      .eq('brief_id', briefId)
      .order('created_at', { ascending: false })

    if (existingMatches && existingMatches.length > 0) {
      logger.info(`Found ${existingMatches.length} existing matches for brief ${briefId}`)
      
      // Format existing matches to match expected structure
      const formattedMatches = existingMatches.map(match => ({
        id: match.id,
        score: match.score,
        status: match.status, // Include the status field!
        confidence: 'medium',
        matchSummary: match.reasons?.[0] || `Great match for your ${briefData.design_category} project`,
        reasons: match.reasons || [],
        personalizedReasons: match.personalized_reasons || match.reasons || [],
        uniqueValue: `${match.designer.first_name} brings professional expertise to your project`,
        potentialChallenges: [],
        riskLevel: match.score >= 80 ? 'low' : match.score >= 60 ? 'medium' : 'high',
        scoreBreakdown: {
          categoryMatch: Math.round(match.score * 0.4),
          styleAlignment: Math.round(match.score * 0.25),
          budgetCompatibility: 15,
          timelineCompatibility: 10,
          experienceLevel: 10,
          industryFamiliarity: 5
        },
        designer: {
          id: match.designer.id,
          firstName: match.designer.first_name,
          lastName: match.designer.last_name,
          lastInitial: match.designer.last_initial || match.designer.last_name?.charAt(0),
          title: match.designer.title,
          city: match.designer.city,
          country: match.designer.country,
          yearsExperience: match.designer.years_experience,
          totalProjects: match.designer.total_projects,
          designPhilosophy: match.designer.design_philosophy,
          primaryCategories: match.designer.categories,
          styleKeywords: match.designer.styles,
          portfolioProjects: match.designer.portfolio_projects || [],
          profilePicture: match.designer.avatar_url || null,
          portfolioImages: (() => {
            // Try to get actual portfolio images first
            const actualImages = [
              match.designer.portfolio_image_1,
              match.designer.portfolio_image_2,
              match.designer.portfolio_image_3
            ].filter(Boolean);
            
            // If no actual images, generate Picsum placeholders
            if (actualImages.length === 0) {
              const category = match.designer.title?.includes('Graphic') ? 'abstract' :
                              match.designer.title?.includes('Web') ? 'tech' :
                              match.designer.title?.includes('UI/UX') ? 'app' :
                              match.designer.title?.includes('Product') ? 'product' :
                              match.designer.title?.includes('Motion') ? 'motion' : 'design';
              
              return [
                `https://picsum.photos/seed/${category}1-${match.designer.id}/800/600`,
                `https://picsum.photos/seed/${category}2-${match.designer.id}/800/600`,
                `https://picsum.photos/seed/${category}3-${match.designer.id}/800/600`
              ];
            }
            
            return actualImages;
          })(),
          avgClientSatisfaction: 95,
          onTimeDeliveryRate: 98
        },
        aiAnalyzed: true
      }))

      logger.info('✅ Returning existing matches')
      return apiResponse.success({
        matches: formattedMatches,
        briefData: {
          designCategory: brief.design_category,
          timeline: brief.timeline_type,
          budget: brief.budget_range,
          description: brief.project_description
        }
      })
    }

    // Get approved designers
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('*')
      .eq('is_verified', true)
      .eq('is_approved', true)
      .neq('availability', 'busy')

    if (designersError || !designers || designers.length === 0) {
      logger.error('No available designers')
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
    logger.info(`\n🚀 === STARTING AI MATCHING ===`)
    logger.info(`📊 Available designers: ${availableDesigners.length}`)
    logger.info(`🎯 Will analyze top 5 designers with AI`)
    
    let ai
    try {
      ai = createAIProvider()
      logger.info(`✅ AI Provider initialized successfully`)
    } catch (error) {
      logger.error(`❌ Failed to initialize AI provider:`, error)
      return apiResponse.error('AI service unavailable')
    }
    
    let matches = []

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
- Projects: ${designer.total_projects || 0}
- Philosophy: ${designer.design_philosophy || 'Not specified'}

IMPORTANT SCORING GUIDELINES:
- Excellent match (85-95): Perfect alignment in category, style, and experience
- Great match (75-84): Strong alignment with minor differences  
- Good match (65-74): Solid alignment with some compromises
- Fair match (55-64): Basic alignment, several mismatches
- Poor match (45-54): Significant mismatches

Be REALISTIC and VARIED in your scoring. Generate scores across the full range based on actual match quality.
DO NOT default to 65% - evaluate each match carefully!

Provide a JSON response with:
{
  "score": <number 45-95, vary based on actual match quality>,
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

        logger.info(`🤖 Calling AI for designer ${designer.id} (${designer.first_name})...`)
        const completion = await ai.generateText({
          messages: [{ role: 'user', content: prompt }],
          model: AI_CONFIG.models.fast,
          temperature: 0.3,
          maxTokens: 800,
          responseFormat: { type: 'json_object' }
        })

        const analysis = JSON.parse(completion.text)
        logger.info(`✅ AI Score for ${designer.first_name}: ${analysis.score}% (${analysis.confidence} confidence)`)
        
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
            totalProjects: designer.total_projects,
            designPhilosophy: designer.design_philosophy,
            primaryCategories: designer.categories,
            styleKeywords: designer.styles,
            portfolioProjects: designer.portfolio_projects || [],
            profilePicture: designer.avatar_url || null,
            portfolioImages: (() => {
              // Try to get actual portfolio images first
              const actualImages = [
                designer.portfolio_image_1,
                designer.portfolio_image_2,
                designer.portfolio_image_3
              ].filter(Boolean);
              
              // If no actual images, generate Picsum placeholders
              if (actualImages.length === 0) {
                const category = designer.title?.includes('Graphic') ? 'abstract' :
                                designer.title?.includes('Web') ? 'tech' :
                                designer.title?.includes('UI/UX') ? 'app' :
                                designer.title?.includes('Product') ? 'product' :
                                designer.title?.includes('Motion') ? 'motion' : 'design';
                
                return [
                  `https://picsum.photos/seed/${category}1-${designer.id}/800/600`,
                  `https://picsum.photos/seed/${category}2-${designer.id}/800/600`,
                  `https://picsum.photos/seed/${category}3-${designer.id}/800/600`
                ];
              }
              
              return actualImages;
            })(),
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
        logger.error('❌ AI analysis FAILED for designer:', designer.id, designer.first_name)
        logger.error('Error details:', error)
        // Fallback to simple scoring if AI fails
        logger.info('⚠️ Using FALLBACK score of 70 for', designer.first_name)
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
            totalProjects: designer.total_projects,
            designPhilosophy: designer.design_philosophy,
            primaryCategories: designer.categories,
            styleKeywords: designer.styles,
            portfolioProjects: designer.portfolio_projects || [],
            profilePicture: designer.avatar_url || null,
            portfolioImages: (() => {
              // Try to get actual portfolio images first
              const actualImages = [
                designer.portfolio_image_1,
                designer.portfolio_image_2,
                designer.portfolio_image_3
              ].filter(Boolean);
              
              // If no actual images, generate Picsum placeholders
              if (actualImages.length === 0) {
                const category = designer.title?.includes('Graphic') ? 'abstract' :
                                designer.title?.includes('Web') ? 'tech' :
                                designer.title?.includes('UI/UX') ? 'app' :
                                designer.title?.includes('Product') ? 'product' :
                                designer.title?.includes('Motion') ? 'motion' : 'design';
                
                return [
                  `https://picsum.photos/seed/${category}1-${designer.id}/800/600`,
                  `https://picsum.photos/seed/${category}2-${designer.id}/800/600`,
                  `https://picsum.photos/seed/${category}3-${designer.id}/800/600`
                ];
              }
              
              return actualImages;
            })(),
            avgClientSatisfaction: 95,
            onTimeDeliveryRate: 98
          },
          // Generate a more realistic random score between 55-75 for fallback
          score: Math.floor(Math.random() * 20) + 55,
          confidence: 'medium',
          matchSummary: `${designer.first_name} is an experienced designer ready for your project`,
          reasons: ['Verified designer', 'Available for new projects', `${designer.years_experience} years of experience`],
          personalizedReasons: ['Verified designer', 'Available for new projects', `${designer.years_experience} years of experience`],
          uniqueValue: 'Experienced designer ready to bring your vision to life',
          potentialChallenges: [],
          riskLevel: 'medium',
          scoreBreakdown: {
            categoryMatch: Math.floor(Math.random() * 10) + 15,
            styleAlignment: Math.floor(Math.random() * 10) + 10,
            budgetCompatibility: Math.floor(Math.random() * 5) + 8,
            timelineCompatibility: Math.floor(Math.random() * 5) + 7,
            experienceLevel: Math.floor(Math.random() * 5) + 7,
            industryFamiliarity: Math.floor(Math.random() * 5) + 3
          },
          aiAnalyzed: false
        })
      }
    }

    // Sort matches by score
    matches.sort((a, b) => b.score - a.score)

    logger.info(`Found ${matches.length} enhanced matches`)

    // If no matches found after AI analysis, return error
    if (matches.length === 0) {
      logger.info('No suitable matches found after AI analysis')
      
      return NextResponse.json({
        success: false,
        error: 'No suitable designers found for your requirements',
        message: 'We couldn\'t find designers that match your specific requirements. Please try adjusting your brief or contact support.',
        debugInfo: {
          availableDesigners: availableDesigners.length,
          briefId: briefData.id
        }
      }, { status: 404 })
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
        status: 'pending'
      })
      .select()
      .single()

    if (matchError) {
      logger.error('Error creating match record:', matchError)
      // Continue anyway, we can still return the match results
    }

    logger.info('✅ Enhanced matching complete')

    return apiResponse.success({
      matches: matches.map(match => ({
        id: matchRecord?.id || `temp-${match.designer.id}`,
        score: match.score,
        status: matchRecord?.status || 'pending', // Include status field
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