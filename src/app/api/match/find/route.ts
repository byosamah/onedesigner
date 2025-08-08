import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createAIProvider } from '@/lib/ai'
import { AI_CONFIG } from '@/lib/ai/config'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { 
  calculateEnhancedRelevanceScore, 
  Designer, 
  Brief, 
  ClientPreferences 
} from '@/lib/matching/enhanced-scoring'
import { sendEmail } from '@/lib/email/send-email'
import { 
  generateMatchExplanation, 
  generateKeyStrengths,
  generateQuickStats 
} from '@/lib/matching/explanation-generator'

// Helper to get client preferences
async function getClientPreferences(supabase: any, clientId: string): Promise<ClientPreferences | null> {
  const { data } = await supabase
    .from('client_preferences')
    .select('*')
    .eq('client_id', clientId)
    .single()
  
  return data
}

import { OptimizedMatcher } from '@/lib/matching/optimized-matcher'

// Streaming endpoint for progressive match results
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { briefId, streaming = false } = body

    if (!briefId) {
      return apiResponse.error('Brief ID is required')
    }

    const supabase = createServiceClient()

    // Get the brief with client info
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*, client:clients(*)')
      .eq('id', briefId)
      .single()

    if (briefError || !brief) {
      return apiResponse.notFound('Brief')
    }

    // Get all previously matched designers for this client (including pending ones)
    const { data: previousMatches } = await supabase
      .from('matches')
      .select('designer_id')
      .eq('client_id', brief.client_id)
    
    const excludedDesignerIds = previousMatches?.map(m => m.designer_id) || []
    
    console.log(`Excluding ${excludedDesignerIds.length} previously matched designers`)

    // Get all available designers excluding previously matched ones
    // Only include designers that are both verified AND approved
    let designersQuery = supabase
      .from('designers')
      .select('id, first_name, last_name, email, is_verified, is_approved, availability, *')
      .eq('is_verified', true)
      .eq('is_approved', true)
      .in('availability', ['available', 'busy'])
    
    if (excludedDesignerIds.length > 0) {
      designersQuery = designersQuery.not('id', 'in', `(${excludedDesignerIds.join(',')})`)
    }

    const { data: designers, error: designersError } = await designersQuery
    
    // Debug logging
    console.log('=== MATCH DEBUG INFO ===')
    console.log('Query filters: is_verified=true, is_approved=true')
    console.log('Available designers found:', designers?.length || 0)
    if (designers && designers.length > 0) {
      designers.forEach(d => {
        console.log(`- Name: ${d.first_name} ${d.last_name}`)
        console.log(`  Title: ${d.title}`)
        console.log(`  Location: ${d.city}, ${d.country}`)
        console.log(`  Status: verified=${d.is_verified}, approved=${d.is_approved}`)
      })
    }

    if (designersError || !designers || designers.length === 0) {
      // Check if there are any approved designers at all
      const { data: totalApprovedDesigners } = await supabase
        .from('designers')
        .select('id')
        .eq('is_verified', true)
        .eq('is_approved', true)
        .in('availability', ['available', 'busy'])
      
      const totalApproved = totalApprovedDesigners?.length || 0
      
      if (totalApproved > 0 && excludedDesignerIds.length >= totalApproved) {
        // Client has unlocked all approved designers
        return apiResponse.notFound('Designers')
      } else {
        // No approved designers available (they haven't been approved yet)
        return apiResponse.notFound('Designers')
      }
    }

    console.log(`Found ${designers.length} verified and approved designers`)

    // Get client preferences for AI context
    const clientPrefs = await getClientPreferences(supabase, brief.client_id)
    
    // Let AI analyze ALL eligible designers without pre-filtering bias
    // Only do basic filtering for availability and approval status
    const eligibleDesigners = designers.filter(d => 
      d.availability !== 'unavailable' && 
      d.is_approved === true &&
      d.is_verified === true
    )
    
    console.log(`${eligibleDesigners.length} eligible designers will be analyzed by AI`)

    // Initialize AI provider - required for matching
    let aiProvider = null
    
    try {
      aiProvider = createAIProvider()
    } catch (error: any) {
      console.error('AI provider initialization failed:', error.message)
      return apiResponse.serverError('AI matching service is not configured')
    }
    
    // Analyze matches with AI - no rate limits on DeepSeek
    let matchResults = []
    
    // Process ALL eligible designers through AI for thorough analysis
    // DeepSeek has no rate limits - we can analyze all designers
    const maxAnalyze = Math.min(eligibleDesigners.length, 50) // Increased cap since no rate limits
    
    console.log(`AI will analyze ${maxAnalyze} designers to find the best match`)
    
    // Process designers in parallel batches for faster results
    const batchSize = 5
    for (let i = 0; i < maxAnalyze; i += batchSize) {
      const batch = eligibleDesigners.slice(i, Math.min(i + batchSize, maxAnalyze))
      
      // Analyze batch in parallel
      const batchPromises = batch.map(async (designer, idx) => {
        try {
          console.log(`AI analyzing designer ${i + idx + 1}/${maxAnalyze}: ${designer.first_name} ${designer.last_name}`)
          
          const matchResult = await aiProvider.analyzeMatch(designer, brief)
          
          // Only add matches that the AI considers viable (50+ score)
          if (matchResult.score >= 50) {
            console.log(`  -> Match score: ${matchResult.score} (${matchResult.confidence} confidence)`)
            return matchResult
          } else {
            console.log(`  -> Poor match: ${matchResult.score} - ${matchResult.matchSummary}`)
            return null
          }
        } catch (error: any) {
          console.error(`AI matching failed for designer ${designer.id}:`, error.message)
          return null
        }
      })
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises)
      
      // Add successful matches
      matchResults.push(...batchResults.filter(result => result !== null))
      
      console.log(`Batch ${Math.floor(i/batchSize) + 1} complete. Total matches so far: ${matchResults.length}`)
    }
    
    // If no matches found after AI analysis
    if (matchResults.length === 0) {
      console.log('No suitable matches found after AI analysis')
      
      return apiResponse.notFound('Suitable matches')
    }
    
    // Sort by final score and get the best match
    const sortedMatches = matchResults.sort((a, b) => b.score - a.score)
    const bestMatch = sortedMatches[0]
    
    console.log(`\n=== MATCH RESULTS ===`)
    console.log(`Best match: ${bestMatch.designer.first_name} ${bestMatch.designer.last_name}`)
    console.log(`Score: ${bestMatch.score}% (${bestMatch.confidence || 'medium'} confidence)`)
    console.log(`AI Analysis: ${bestMatch.aiAnalyzed ? 'Complete' : 'Fallback'}`)
    if (bestMatch.matchSummary) {
      console.log(`Summary: ${bestMatch.matchSummary}`)
    }
    console.log(`Total matches found: ${matchResults.length}`)
    console.log(`Other matches:`, sortedMatches.slice(1, 4).map(m => 
      `${m.designer.first_name} ${m.designer.last_name} (${m.score}%)`
    ))
    
    // Create match record
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        brief_id: briefId,
        designer_id: bestMatch.designer.id,
        client_id: brief.client_id, // Add the client_id from the brief
        score: bestMatch.score,
        reasons: bestMatch.reasons,
        personalized_reasons: bestMatch.personalizedReasons,
        status: 'pending'
      })
      .select()
      .single()

    let finalMatch = match
    
    if (matchError) {
      console.error('Error creating match:', matchError)
      
      // Check if it's a unique constraint error (duplicate match)
      if (matchError.code === '23505') {
        // Get the existing match
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('*')
          .eq('brief_id', briefId)
          .eq('designer_id', bestMatch.designer.id)
          .single()
          
        if (existingMatch) {
          console.log('Using existing match:', existingMatch.id)
          finalMatch = existingMatch // Use the existing match
        }
      } else {
        throw matchError
      }
    }

    // Create designer request with expiration date
    if (finalMatch) {
      // Set expiration to 7 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)
      
      const { error: requestError } = await supabase
        .from('designer_requests')
        .insert({
          match_id: finalMatch.id,
          designer_id: bestMatch.designer.id,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
      
      if (requestError) {
        console.error('Error creating designer request:', requestError)
      } else {
        // Send email notification to designer
        try {
          await sendEmail({
            to: bestMatch.designer.email,
            subject: 'New project match on OneDesigner! 🎨',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #f0ad4e; margin: 0;">OneDesigner</h1>
                </div>
                <h2 style="color: #333;">You've been matched with a new project!</h2>
                <p style="color: #666; font-size: 16px;">
                  Great news! You've been selected as the perfect match for a ${brief.project_type} project.
                </p>
                <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Project Details:</h3>
                  <ul style="color: #666;">
                    <li><strong>Type:</strong> ${brief.project_type}</li>
                    <li><strong>Industry:</strong> ${brief.industry}</li>
                    <li><strong>Timeline:</strong> ${brief.timeline}</li>
                    <li><strong>Match Score:</strong> ${bestMatch.score}%</li>
                  </ul>
                </div>
                <p style="color: #666;">
                  The client is excited to work with you! Please respond within 48 hours to maintain your response rate.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard" 
                     style="background: #f0ad4e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    View Project Details
                  </a>
                </div>
                <p style="color: #999; font-size: 14px; text-align: center;">
                  This request will expire in 7 days if not responded to.
                </p>
              </div>
            `,
            text: `You've been matched with a new ${brief.project_type} project on OneDesigner! Match score: ${bestMatch.score}%. Please respond within 48 hours. View details at: ${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
          })
          console.log('Designer notification email sent')
        } catch (emailError) {
          console.error('Failed to send designer notification:', emailError)
        }
      }
    }

    // Send email notification to client
    if (finalMatch && brief.client?.email) {
      try {
        await sendEmail({
          to: brief.client.email,
          subject: 'We found your perfect designer match! 🎯',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f0ad4e; margin: 0;">OneDesigner</h1>
              </div>
              <h2 style="color: #333;">We found the perfect designer for your project!</h2>
              <p style="color: #666; font-size: 16px;">
                Our AI has analyzed hundreds of designers and found an exceptional match for your ${brief.project_type} project.
              </p>
              <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Your Match:</h3>
                <p style="color: #666; margin: 10px 0;">
                  <strong>Designer:</strong> ${bestMatch.designer.first_name} ${bestMatch.designer.last_name[0]}.<br>
                  <strong>Match Score:</strong> ${bestMatch.score}%<br>
                  <strong>Specialties:</strong> ${bestMatch.designer.skills?.slice(0, 3).join(', ') || 'Various design skills'}
                </p>
              </div>
              <p style="color: #666;">
                ${bestMatch.personalizedReasons?.[0] || bestMatch.reasons?.[0] || 'This designer has the perfect combination of skills and experience for your project.'}
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/match/${finalMatch.id}" 
                   style="background: #f0ad4e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Your Match
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center;">
                Unlock this designer's contact details with just 1 credit.
              </p>
            </div>
          `,
          text: `We found the perfect designer for your ${brief.project_type} project! Match score: ${bestMatch.score}%. View your match at: ${process.env.NEXT_PUBLIC_APP_URL}/match/${finalMatch.id}`
        })
        console.log('Client notification email sent')
      } catch (emailError) {
        console.error('Failed to send client notification:', emailError)
      }
    }

    // Check if match is already unlocked
    const isUnlocked = finalMatch?.status === 'unlocked' || finalMatch?.status === 'accepted'

    // Create match analytics record
    if (finalMatch?.id && !bestMatch.fallbackMatch) {
      await supabase
        .from('match_analytics')
        .insert({
          match_id: finalMatch.id,
          client_id: brief.client_id,
          designer_id: bestMatch.designer.id,
          match_score: bestMatch.score,
          ai_confidence: bestMatch.confidence || 'medium',
          match_reasons: bestMatch.personalizedReasons || bestMatch.reasons,
          alternative_designers: sortedMatches.slice(1, 4).map(m => ({
            id: m.designer.id,
            score: m.score,
            name: `${m.designer.first_name} ${m.designer.last_name}`
          }))
        })
    }

    // Generate match explanation
    const matchExplanation = generateMatchExplanation({
      designer: bestMatch.designer,
      brief,
      aiAnalysis: {
        score: bestMatch.score,
        confidence: bestMatch.confidence || 'medium',
        reasons: bestMatch.personalizedReasons || bestMatch.reasons,
        uniqueValue: bestMatch.uniqueValue,
        challenges: bestMatch.challenges,
        riskLevel: bestMatch.riskLevel,
        matchSummary: bestMatch.matchSummary
      },
      scores: bestMatch.designer.scoreBreakdown ? {
        totalScore: bestMatch.score,
        breakdown: bestMatch.designer.scoreBreakdown,
        weights: {},
        confidence: bestMatch.confidence || 'medium'
      } : {
        totalScore: bestMatch.score,
        breakdown: {},
        weights: {},
        confidence: 'low'
      },
      clientPrefs: clientPrefs || undefined
    })

    // Generate key strengths
    const keyStrengths = generateKeyStrengths(
      bestMatch.designer,
      brief,
      {
        score: bestMatch.score,
        confidence: bestMatch.confidence || 'medium',
        reasons: bestMatch.personalizedReasons || bestMatch.reasons
      }
    )

    // Generate quick stats
    const quickStats = generateQuickStats(bestMatch.designer, brief)

    // Return the enhanced match
    return apiResponse.success({
      success: true,
      match: {
        id: finalMatch?.id || 'temp-id',
        score: bestMatch.score,
        confidence: bestMatch.confidence || 'medium',
        reasons: bestMatch.reasons,
        personalizedReasons: bestMatch.personalizedReasons,
        matchExplanation,
        keyStrengths,
        quickStats,
        uniqueValue: bestMatch.uniqueValue,
        challenges: bestMatch.challenges || [],
        riskLevel: bestMatch.riskLevel || 'low',
        matchSummary: bestMatch.matchSummary,
        designer: {
          id: bestMatch.designer.id,
          firstName: bestMatch.designer.first_name || 'Designer',
          lastInitial: bestMatch.designer.last_initial || (bestMatch.designer.last_name ? bestMatch.designer.last_name.charAt(0).toUpperCase() : ''),
          lastName: bestMatch.designer.last_name,
          title: bestMatch.designer.title || 'Designer',
          city: bestMatch.designer.city || 'Unknown',
          country: bestMatch.designer.country || '',
          yearsExperience: bestMatch.designer.years_experience || 0,
          rating: bestMatch.designer.rating || 4.5,
          totalProjects: bestMatch.designer.total_projects || 0,
          avatarUrl: bestMatch.designer.avatar_url,
          styles: bestMatch.designer.styles || [],
          industries: bestMatch.designer.industries || [],
          specializations: bestMatch.designer.specializations || [],
          communicationStyle: bestMatch.designer.communication_style,
          teamSize: bestMatch.designer.team_size,
          avgClientSatisfaction: bestMatch.designer.avg_client_satisfaction,
          onTimeDeliveryRate: bestMatch.designer.on_time_delivery_rate,
          projectCompletionRate: bestMatch.designer.project_completion_rate,
          email: isUnlocked ? bestMatch.designer.email : null,
          phone: isUnlocked ? bestMatch.designer.phone : null,
          website: isUnlocked ? bestMatch.designer.website_url : null,
          calendly_url: isUnlocked ? bestMatch.designer.calendly_url : null
        },
        alternativeOptions: sortedMatches.slice(1, 4).map(m => ({
          designer_id: m.designer.id,
          name: `${m.designer.first_name} ${m.designer.last_name}`,
          score: m.score,
          uniqueStrength: m.uniqueValue || `${m.designer.years_experience}+ years in ${m.designer.industries?.[0] || 'design'}`
        }))
      }
    })
  } catch (error) {
    return handleApiError(error, 'match/find')
  }
}