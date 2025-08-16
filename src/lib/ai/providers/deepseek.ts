import { AIProvider, MatchResult } from '../types'
import { API_ENDPOINTS } from '@/lib/constants'
import { MATCHING_PROMPT_CONFIG } from '@/config/matching/prompt.config'
import { logger } from '@/lib/core/logging-service'
import { RetryHelper } from '@/lib/ai/retry-helper'

export class DeepSeekProvider implements AIProvider {
  private apiKey: string
  private baseURL = API_ENDPOINTS.DEEPSEEK
  private model = MATCHING_PROMPT_CONFIG.aiSettings.model
  private config = MATCHING_PROMPT_CONFIG

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is not set')
    }
  }

  async generateMatches(
    designers: any[],
    brief: any,
    count: number = 3
  ): Promise<MatchResult[]> {
    try {
      const prompt = this.createMatchingPrompt(designers, brief)
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.config.systemRole
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.aiSettings.temperature,
          max_tokens: this.config.aiSettings.maxTokens
        })
      })

      if (!response.ok) {
        const error = await response.text()
        logger.error('DeepSeek API error:', error)
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from DeepSeek')
      }

      return this.parseMatchResults(content, designers)
    } catch (error) {
      logger.error('DeepSeek matching error:', error)
      throw error
    }
  }

  private createMatchingPrompt(designers: any[], brief: any): string {
    const { promptTemplates, scoringWeights, eliminationCriteria, thresholds } = this.config
    
    return `
==== YOUR MISSION ====
${promptTemplates.missionStatement}

==== CLIENT PROJECT ANALYSIS ====

CORE REQUIREMENTS:
- Company: ${brief.company_name}
- Industry: ${brief.industry}
- Project Type: ${brief.project_type || brief.projectType}
- Budget: ${brief.budget}
- Timeline: ${brief.timeline}
- Required Styles: ${JSON.stringify(brief.styles)}

PROJECT ESSENCE:
- Target Audience: ${brief.target_audience || 'Not specified'}
- Brand Personality: ${brief.brand_personality || 'Not specified'}
- Key Requirements: ${brief.requirements || 'None specified'}
- Success Metrics: ${brief.success_metrics || 'Not specified'}
- Inspiration/References: ${brief.inspiration || 'None provided'}

==== AVAILABLE DESIGNERS FOR EVALUATION ====
${designers.map((d, i) => `
DESIGNER ${i + 1}: ${d.first_name} ${d.last_name}

CATEGORY EXPERTISE:
- Specializations: ${JSON.stringify(d.specializations || [])}
- Industries: ${JSON.stringify(d.industries || [])}
- Experience: ${d.years_experience || 5} years
- Total Projects: ${d.total_projects_completed || d.total_projects || 10}

STYLE DNA:
- Design Styles: ${JSON.stringify(d.styles || [])}
- Portfolio Keywords: ${JSON.stringify(d.portfolio_keywords || [])}
- Design Philosophy: ${d.design_philosophy || 'Not specified'}

PRACTICAL FIT:
- Location: ${d.city}, ${d.country} (${d.timezone || 'UTC'})
- Languages: ${JSON.stringify(d.languages || ['English'])}
- Current Availability: ${d.availability}
- Timeline Preference: ${d.preferred_timeline || 'standard'}
- Project Size Preference: ${d.preferred_project_size || 'medium'}

WORKING STYLE:
- Communication Style: ${d.communication_style || 'collaborative'}
- Revision Approach: ${d.revision_approach || 'structured'}
- Team Size: ${d.team_size || 'solo'}
- Work Approach: ${d.work_approach || 'Not specified'}

PERFORMANCE METRICS:
- Client Satisfaction: ${d.avg_client_satisfaction || 4.5}/5
- On-time Delivery: ${d.on_time_delivery_rate || 90}%
- Budget Adherence: ${d.budget_adherence_rate || 85}%
- Avg Project Duration: ${d.avg_project_duration_days || 30} days
`).join('\n===== NEXT DESIGNER =====\n')}

==== MATCHING ALGORITHM ====

STEP 1: ELIMINATION FILTERS
For each designer, verify:
${Object.entries(eliminationCriteria)
  .filter(([_, criteria]) => criteria.enabled)
  .map(([_, criteria]) => `□ ${criteria.description}`)
  .join('\n')}

STEP 2: ${promptTemplates.scoringInstructions}

STEP 3: SELECT THE ONE
Choose the highest scoring designer who passes all filters.
If NO designer scores above ${thresholds.minimumScore}/100, respond with: "${thresholds.noMatchMessage}"

==== RESPONSE FORMAT ====
${promptTemplates.outputInstructions}

Example JSON structure:
{
  "selectedDesignerIndex": 0,
  "designerName": "First Last",
  "matchScore": 85,
  "confidence": "95%",
  "isRecommended": true,
  "matchDecision": "PERFECT MATCH: [One compelling sentence why this designer]",
  "keyDistinction": "The only designer who [unique combination of strengths]",
  "scoreBreakdown": {
    "categoryMastery": 28,
    "styleAlignment": 23,
    "projectFit": 18,
    "workingCompatibility": 13,
    "valueFactors": 8
  },
  "matchNarrative": "[2-3 sentences: compelling story of why THIS designer for THIS project]",
  "specificEvidence": [
    "Concrete portfolio example proving capability",
    "Specific metric demonstrating reliability",
    "Unique qualification addressing client need",
    "Past project showing budget/timeline alignment"
  ],
  "riskMitigation": "How this designer solves client's specific concerns",
  "surpriseDelight": "Unexpected bonus value they bring",
  "potentialConcerns": ["Honest concern if any", "Another if applicable"],
  "nextSteps": "Contact designer immediately to confirm availability for [specific dates]"
}

If NO suitable match (all scores <70):
{
  "selectedDesignerIndex": -1,
  "designerName": "No Match Found",
  "matchScore": 0,
  "confidence": "N/A",
  "isRecommended": false,
  "matchDecision": "NO OPTIMAL MATCH: Best available scores only [X]/100",
  "recommendedAction": "Wait for better matches or adjust [specific requirement]",
  "topGaps": ["Specific missing qualification", "Another gap"]
}

REMEMBER: Select THE ONE designer who seems custom-built for this project. Make it undeniable.`
  }

  private parseMatchResults(content: string, designers: any[]): MatchResult[] {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Handle single match response
      if (!parsed.isRecommended || parsed.selectedDesignerIndex === -1) {
        // No suitable match found
        logger.info('No suitable match found:', parsed.recommendedAction)
        return []
      }

      const designer = designers[parsed.selectedDesignerIndex]
      if (!designer) {
        throw new Error(`Invalid designer index: ${parsed.selectedDesignerIndex}`)
      }

      // Return single match as array (for compatibility)
      return [{
        designer,
        score: Math.min(100, Math.max(0, parsed.matchScore)),
        reasons: parsed.specificEvidence || [
          'Strong portfolio in relevant style',
          'Experience with similar projects',
          'Available within timeline'
        ],
        personalizedReasons: parsed.specificEvidence || [],
        confidence: parsed.confidence || 'medium',
        uniqueValue: parsed.keyDistinction || parsed.surpriseDelight,
        challenges: parsed.potentialConcerns || [],
        riskLevel: parsed.matchScore >= 85 ? 'low' : parsed.matchScore >= 70 ? 'medium' : 'high',
        matchSummary: parsed.matchNarrative || parsed.matchDecision,
        matchDecision: parsed.matchDecision,
        scoreBreakdown: parsed.scoreBreakdown,
        riskMitigation: parsed.riskMitigation,
        nextSteps: parsed.nextSteps
      }]
    } catch (error) {
      logger.error('Error parsing DeepSeek response:', error)
      // No fallback - throw error to enforce AI-only matching policy
      throw new Error('AI matching service failed to parse response. Please try again.')
    }
  }

  async analyzeMatch(designer: any, brief: any): Promise<any> {
    try {
      const prompt = this.createDetailedMatchAnalysisPrompt(designer, brief)
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an elite designer-client matchmaker AI with deep understanding of design disciplines, client needs, and professional compatibility. 
Your job is to analyze if this specific designer is THE PERFECT MATCH for this client's project with surgical precision. 
Be critical and thorough - only recommend if the match is truly exceptional. A score below 70 means NO MATCH.
Consider all aspects: category expertise, style alignment, project fit, working compatibility, and value factors.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2, // Lower temperature for more consistent, realistic scoring
          max_tokens: 1500,
          stream: false // Ensure non-streaming for consistent responses
        })
      })

      if (!response.ok) {
        const error = await response.text()
        logger.error('DeepSeek API error:', error)
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from DeepSeek')
      }

      return this.parseDetailedMatchResult(content, designer)
    } catch (error) {
      logger.error('DeepSeek match analysis error:', error)
      throw error
    }
  }

  private createDetailedMatchAnalysisPrompt(designer: any, brief: any): string {
    return `
==== YOUR MISSION ====
Determine if this designer is THE PERFECT MATCH for this client's project. Apply the elite matching algorithm with surgical precision.

==== CLIENT PROJECT ANALYSIS ====

CORE REQUIREMENTS:
- Company: ${brief.company_name}
- Industry: ${brief.industry}
- Project Type: ${brief.project_type || brief.projectType}
- Budget: ${brief.budget}
- Timeline: ${brief.timeline}
- Design Styles: ${JSON.stringify(brief.styles)}

PROJECT ESSENCE:
- Requirements: ${brief.requirements || 'Not specified'}
- Target Audience: ${brief.target_audience || 'Not specified'}
- Brand Personality: ${brief.brand_personality || 'Not specified'}
- Success Metrics: ${brief.success_metrics || 'Not specified'}
- Inspiration: ${brief.inspiration || 'None provided'}

==== DESIGNER EVALUATION ====

Name: ${designer.first_name} ${designer.last_name}

CATEGORY EXPERTISE:
- Specializations: ${JSON.stringify(designer.specializations || [])}
- Industries: ${JSON.stringify(designer.industries || [])}
- Experience: ${designer.years_experience || 0} years
- Total Projects: ${designer.total_projects_completed || designer.total_projects || 0}

STYLE DNA:
- Design Styles: ${JSON.stringify(designer.styles || [])}
- Portfolio Keywords: ${JSON.stringify(designer.portfolio_keywords || [])}
- Design Philosophy: ${designer.design_philosophy || 'Not specified'}

PRACTICAL FIT:
- Location: ${designer.city}, ${designer.country} (${designer.timezone || 'Unknown'})
- Current Availability: ${designer.availability}
- Timeline Preference: ${designer.preferred_timeline || 'unknown'}
- Project Size Preference: ${designer.preferred_project_size || 'unknown'}

WORKING STYLE:
- Communication Style: ${designer.communication_style || 'unknown'}
- Team Size: ${designer.team_size || 'solo'}
- Work Approach: ${designer.work_approach || 'Not specified'}

PERFORMANCE METRICS:
- Client Satisfaction: ${designer.avg_client_satisfaction || 'Unknown'}/5
- On-time Delivery: ${designer.on_time_delivery_rate || 'Unknown'}%
- Budget Adherence: ${designer.budget_adherence_rate || 'Unknown'}%

==== MATCHING ALGORITHM ====

STEP 1: ELIMINATION FILTERS
Verify designer passes ALL:
□ Correct specialization for ${brief.project_type}
□ Within budget range ${brief.budget} (+/- 20%)
□ Available for ${brief.timeline} timeline
□ Style matches ${brief.styles.join(', ')}
□ Has relevant industry experience

STEP 2: SCORING MATRIX (100 points)
- CATEGORY MASTERY (30 pts): Specialization + portfolio + experience
- STYLE ALIGNMENT (25 pts): Style match + philosophy + range
- PROJECT FIT (20 pts): Industry + scale + success history
- WORKING COMPATIBILITY (15 pts): Communication + process
- VALUE FACTORS (10 pts): Budget fit + availability + extras

STEP 3: DECISION
- Score 85+: PERFECT MATCH - Recommend immediately
- Score 70-84: GOOD MATCH - Recommend with noted considerations
- Score <70: NO MATCH - Do not recommend

==== RESPONSE FORMAT ====
{
  "isMatch": true/false,
  "score": 0-100,
  "confidence": "100%|95%|90%|85%",
  "matchDecision": "PERFECT MATCH: [compelling reason]" or "NO MATCH: [key gap]",
  "keyDistinction": "The only designer who [unique strength]",
  "scoreBreakdown": {
    "categoryMastery": 0-30,
    "styleAlignment": 0-25,
    "projectFit": 0-20,
    "workingCompatibility": 0-15,
    "valueFactors": 0-10
  },
  "matchNarrative": "[2-3 sentences why THIS designer for THIS project]",
  "specificEvidence": [
    "Portfolio example proving capability",
    "Metric demonstrating reliability",
    "Unique qualification for client need",
    "Past project showing alignment"
  ],
  "riskMitigation": "How they solve client's specific concerns",
  "surpriseDelight": "Unexpected bonus value",
  "potentialConcerns": ["Any honest concern"],
  "nextSteps": "Contact immediately for [dates]" or "Find alternative designer"
}

REMEMBER: Only recommend if this designer seems custom-built for this project (70+ score).`
  }

  private parseDetailedMatchResult(content: string, designer: any): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Ensure score is realistic
      const score = Math.min(100, Math.max(0, parsed.score))
      
      return {
        designer,
        score,
        confidence: parsed.confidence || '85%',
        reasons: parsed.specificEvidence || [],
        personalizedReasons: parsed.specificEvidence || [],
        strengths: parsed.specificEvidence?.slice(0, 2) || [],
        weaknesses: parsed.potentialConcerns || [],
        uniqueValue: parsed.keyDistinction || parsed.surpriseDelight,
        riskLevel: score >= 85 ? 'low' : score >= 70 ? 'medium' : 'high',
        matchSummary: parsed.matchNarrative || parsed.matchDecision,
        isMatch: parsed.isMatch && score >= 70,
        aiAnalyzed: true,
        matchDecision: parsed.matchDecision,
        scoreBreakdown: parsed.scoreBreakdown,
        riskMitigation: parsed.riskMitigation,
        surpriseDelight: parsed.surpriseDelight,
        nextSteps: parsed.nextSteps
      }
    } catch (error) {
      logger.error('Error parsing DeepSeek match analysis:', error)
      // No fallback - throw error to enforce AI-only matching policy
      throw new Error('AI match analysis failed. Please try again.')
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  async generateText(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
    model?: string
    temperature?: number
    maxTokens?: number
    responseFormat?: { type: 'json_object' | 'text' }
  }): Promise<{ text: string }> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: params.model || this.model,
          messages: params.messages,
          temperature: params.temperature || 0.3,
          max_tokens: params.maxTokens || 1000,
          response_format: params.responseFormat
        })
      })

      if (!response.ok) {
        const error = await response.text()
        logger.error('DeepSeek API error:', error)
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from DeepSeek')
      }

      return { text: content }
    } catch (error) {
      logger.error('DeepSeek generateText error:', error)
      throw error
    }
  }
}