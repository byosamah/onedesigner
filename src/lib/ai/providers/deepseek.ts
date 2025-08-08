import { AIProvider, MatchResult } from '../types'
import { API_ENDPOINTS } from '@/lib/constants'

export class DeepSeekProvider implements AIProvider {
  private apiKey: string
  private baseURL = API_ENDPOINTS.DEEPSEEK
  private model = 'deepseek-chat' // Using chat model for better matching capabilities

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
              content: 'You are an expert at matching designers with client projects. Analyze designer profiles and project requirements to find the best matches. Be specific and detailed in your reasoning.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent matching
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('DeepSeek API error:', error)
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from DeepSeek')
      }

      return this.parseMatchResults(content, designers)
    } catch (error) {
      console.error('DeepSeek matching error:', error)
      throw error
    }
  }

  private createMatchingPrompt(designers: any[], brief: any): string {
    return `
You are an expert design matchmaker analyzing compatibility between a client's project and potential designers.

PROJECT CONTEXT:
Company: ${brief.company_name}
Industry: ${brief.industry}
Project Type: ${brief.project_type || brief.projectType}
Budget Range: ${brief.budget}
Timeline: ${brief.timeline}
Required Styles: ${JSON.stringify(brief.styles)}
Target Audience: ${brief.target_audience || 'Not specified'}
Brand Personality: ${brief.brand_personality || 'Not specified'}
Key Requirements: ${brief.requirements || 'None specified'}
Project Complexity: ${brief.complexity_level || 'moderate'}
Success Metrics: ${brief.success_metrics || 'Not specified'}
Inspiration/References: ${brief.inspiration || 'None provided'}

AVAILABLE DESIGNERS:
${designers.map((d, i) => `
Designer ${i + 1}: ${d.first_name} ${d.last_name}
Professional Profile:
- Title: ${d.title}
- Experience: ${d.years_experience || 5} years
- Location: ${d.city}, ${d.country} (${d.timezone || 'UTC'})
- Languages: ${JSON.stringify(d.languages || ['English'])}
- Team Size: ${d.team_size || 'solo'}

Expertise & Style:
- Specializations: ${JSON.stringify(d.specializations || [])}
- Design Styles: ${JSON.stringify(d.styles || [])}
- Industries: ${JSON.stringify(d.industries || [])}
- Tools: ${JSON.stringify(d.tools_expertise || [])}
- Portfolio Keywords: ${JSON.stringify(d.portfolio_keywords || [])}
- Design Philosophy: ${d.design_philosophy || 'Not specified'}

Work Approach:
- Communication Style: ${d.communication_style || 'collaborative'}
- Project Size Preference: ${d.preferred_project_size || 'medium'}
- Timeline Preference: ${d.preferred_timeline || 'standard'}
- Revision Approach: ${d.revision_approach || 'structured'}
- Work Approach: ${d.work_approach || 'Not specified'}
- Key Strengths: ${JSON.stringify(d.strengths || [])}

Performance Metrics:
- Client Satisfaction: ${d.avg_client_satisfaction || 4.5}/5
- On-time Delivery: ${d.on_time_delivery_rate || 90}%
- Project Completion: ${d.project_completion_rate || 95}%
- Budget Adherence: ${d.budget_adherence_rate || 85}%
- Client Retention: ${d.client_retention_rate || 80}%
- Avg Project Duration: ${d.avg_project_duration_days || 30} days
- Total Projects: ${d.total_projects_completed || d.total_projects || 10}
- Current Availability: ${d.availability}
`).join('\n---\n')}

ANALYZE AND PROVIDE:
1. Overall match score (0-100) with confidence level
2. Top 5 specific reasons why this designer is ideal for this project
3. Potential challenges or considerations
4. Unique value propositions this designer brings
5. Risk assessment (low/medium/high)

Consider these critical matching factors:
- Style alignment with brand personality
- Industry expertise relevance
- Capacity to handle project complexity
- Communication style compatibility
- Timeline feasibility
- Budget alignment
- Innovation vs. tradition balance
- Cultural fit indicators
- Performance track record
- Unique differentiators

For the top ${Math.min(3, designers.length)} designers, return your response in this exact JSON format:
{
  "matches": [
    {
      "designerIndex": 0,
      "score": 95,
      "confidence": "high",
      "reasons": [
        "Specific reason with concrete examples from their background",
        "How their expertise directly addresses the project needs",
        "Why their work style matches the client's requirements",
        "What unique value they bring to this specific project",
        "Performance metric that demonstrates reliability"
      ],
      "uniqueValue": "One sentence describing their standout quality for this project",
      "challenges": ["Potential consideration 1", "Potential consideration 2"],
      "riskLevel": "low",
      "matchSummary": "2-3 sentence compelling summary of why they're the perfect match"
    }
  ]
}

Be specific and mention actual details from both the brief and designer profiles. Focus on creating a compelling narrative for why each match is ideal.`
  }

  private parseMatchResults(content: string, designers: any[]): MatchResult[] {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      const matches = parsed.matches || []

      return matches.map((match: any) => {
        const designer = designers[match.designerIndex]
        return {
          designer,
          score: Math.min(100, Math.max(0, match.score)),
          reasons: match.reasons || [
            'Strong portfolio in relevant style',
            'Experience with similar projects',
            'Available within timeline'
          ],
          personalizedReasons: match.reasons || [],
          confidence: match.confidence || 'medium',
          uniqueValue: match.uniqueValue,
          challenges: match.challenges || [],
          riskLevel: match.riskLevel || 'medium',
          matchSummary: match.matchSummary
        }
      })
    } catch (error) {
      console.error('Error parsing DeepSeek response:', error)
      // Fallback to basic scoring
      return designers.slice(0, 3).map((designer, index) => ({
        designer,
        score: 85 - (index * 10),
        reasons: [
          'Strong portfolio match',
          'Relevant industry experience',
          'Available for project timeline'
        ],
        personalizedReasons: [],
        confidence: 'low',
        uniqueValue: 'Experienced designer with relevant portfolio',
        challenges: [],
        riskLevel: 'low',
        matchSummary: 'This designer has relevant experience and is available for your project timeline.'
      }))
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
              content: `You are an expert design matchmaker with deep understanding of design disciplines, client needs, and professional compatibility. 
Your job is to analyze designer-client matches with extreme precision and provide realistic, honest assessments. 
Be critical and thorough - do not inflate scores. A 90+ score should be exceptionally rare and only for near-perfect matches.
Consider all aspects: skills, experience, style, availability, communication, budget fit, and cultural alignment.`
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
        console.error('DeepSeek API error:', error)
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from DeepSeek')
      }

      return this.parseDetailedMatchResult(content, designer)
    } catch (error) {
      console.error('DeepSeek match analysis error:', error)
      throw error
    }
  }

  private createDetailedMatchAnalysisPrompt(designer: any, brief: any): string {
    return `
TASK: Analyze this designer-client match with extreme thoroughness and provide a realistic compatibility score.

CLIENT BRIEF - READ CAREFULLY:
==================================
Company: ${brief.company_name}
Industry: ${brief.industry}
Project Type: ${brief.project_type || brief.projectType}
Budget: ${brief.budget}
Timeline: ${brief.timeline}
Design Styles Needed: ${JSON.stringify(brief.styles)}

DETAILED REQUIREMENTS:
${brief.requirements || 'Not specified'}

INSPIRATION/REFERENCES:
${brief.inspiration || 'None provided'}

Target Audience: ${brief.target_audience || 'Not specified'}
Brand Personality: ${brief.brand_personality || 'Not specified'}
Success Metrics: ${brief.success_metrics || 'Not specified'}
Project Complexity: ${brief.complexity_level || 'moderate'}

DESIGNER PROFILE - ANALYZE THOROUGHLY:
======================================
Name: ${designer.first_name} ${designer.last_name}
Title: ${designer.title}
Experience: ${designer.years_experience || 0} years
Location: ${designer.city}, ${designer.country} (Timezone: ${designer.timezone || 'Unknown'})

PORTFOLIO & EXPERTISE:
- Design Styles: ${JSON.stringify(designer.styles || [])}
- Industries: ${JSON.stringify(designer.industries || [])}
- Specializations: ${JSON.stringify(designer.specializations || [])}
- Portfolio Keywords: ${JSON.stringify(designer.portfolio_keywords || [])}
- Tools: ${JSON.stringify(designer.tools_expertise || [])}

WORK APPROACH:
- Team Size: ${designer.team_size || 'solo'}
- Communication Style: ${designer.communication_style || 'unknown'}
- Project Size Preference: ${designer.preferred_project_size || 'unknown'}
- Timeline Preference: ${designer.preferred_timeline || 'unknown'}
- Design Philosophy: ${designer.design_philosophy || 'Not specified'}
- Work Approach: ${designer.work_approach || 'Not specified'}

PERFORMANCE METRICS:
- Client Satisfaction: ${designer.avg_client_satisfaction || 'Unknown'}/5
- On-time Delivery: ${designer.on_time_delivery_rate || 'Unknown'}%
- Project Completion: ${designer.project_completion_rate || 'Unknown'}%
- Budget Adherence: ${designer.budget_adherence_rate || 'Unknown'}%
- Total Projects: ${designer.total_projects_completed || designer.total_projects || 0}

CURRENT STATUS:
- Availability: ${designer.availability}
- Average Project Duration: ${designer.avg_project_duration_days || 'Unknown'} days

CRITICAL ANALYSIS REQUIRED:
1. Does the designer have PROVEN experience with ${brief.project_type} projects?
2. Do their design styles ACTUALLY match what the client needs (${brief.styles.join(', ')})?
3. Have they worked in the ${brief.industry} industry or similar?
4. Can they realistically deliver within the ${brief.timeline} timeline?
5. Does their typical project size align with the ${brief.budget} budget?
6. Will their ${designer.communication_style || 'communication style'} work for this client?
7. Do they have the right tools and skills for this specific project?

SCORING GUIDELINES:
- 95-100: Nearly impossible perfect match - all criteria align flawlessly
- 85-94: Excellent match - most criteria align very well with minor gaps
- 75-84: Good match - solid alignment with some notable differences
- 65-74: Decent match - workable but with significant compromises needed
- 50-64: Mediocre match - major gaps but could potentially work
- Below 50: Poor match - fundamental misalignments

Provide your analysis in this EXACT JSON format:
{
  "score": [0-100 realistic score based on thorough analysis],
  "confidence": "high|medium|low",
  "reasons": [
    "Specific reason mentioning exact style/industry match or mismatch",
    "Concrete evidence from their experience that relates to this project",
    "How their availability and timeline preference fits the project needs",
    "Their track record with similar project types and budgets",
    "Any concerns or gaps that affect the match"
  ],
  "strengths": [
    "Specific relevant strength with evidence",
    "Another concrete strength"
  ],
  "weaknesses": [
    "Honest assessment of gaps or concerns",
    "Any misalignments that could be problematic"
  ],
  "uniqueValue": "One sentence on what makes them specifically good (or not) for THIS project",
  "riskLevel": "low|medium|high",
  "matchSummary": "2-3 sentence honest summary of the match quality"
}

BE REALISTIC AND CRITICAL. Most matches should score between 50-80. Only truly exceptional alignments should score above 85.`
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
        confidence: parsed.confidence || 'medium',
        reasons: parsed.reasons || [],
        personalizedReasons: parsed.reasons || [],
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        uniqueValue: parsed.uniqueValue,
        riskLevel: parsed.riskLevel || 'medium',
        matchSummary: parsed.matchSummary,
        isMatch: score >= 50, // Only consider it a match if score is 50+
        aiAnalyzed: true
      }
    } catch (error) {
      console.error('Error parsing DeepSeek match analysis:', error)
      // Return a conservative score if parsing fails
      return {
        designer,
        score: 60,
        confidence: 'low',
        reasons: ['Unable to complete full AI analysis'],
        personalizedReasons: ['Unable to complete full AI analysis'],
        strengths: [],
        weaknesses: ['AI analysis incomplete'],
        uniqueValue: 'Manual review recommended',
        riskLevel: 'high',
        matchSummary: 'AI analysis failed - manual review needed',
        isMatch: false,
        aiAnalyzed: false
      }
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
}