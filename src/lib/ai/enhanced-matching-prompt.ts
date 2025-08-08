import { DESIGN_CATEGORIES } from '@/lib/constants'

export interface EnhancedMatchingContext {
  clientBrief: {
    design_category: string
    project_description: string
    timeline_type: string
    budget_range: string
    deliverables?: string[]
    target_audience?: string
    project_goal?: string
    design_style_keywords?: string[]
    design_examples?: string[]
    avoid_colors_styles?: string
    involvement_level?: string
    communication_preference?: string
    previous_designer_experience?: string
    has_brand_guidelines?: boolean
  }
  designer: {
    id: string
    firstName: string
    lastName: string
    designPhilosophy?: string
    primaryCategories?: string[]
    secondaryCategories?: string[]
    styleKeywords?: string[]
    portfolioProjects?: any[]
    preferredIndustries?: string[]
    preferredProjectSizes?: string[]
    expertTools?: string[]
    specialSkills?: string[]
    turnaroundTimes?: Record<string, number>
    revisionRoundsIncluded?: number
    collaborationStyle?: string
    currentAvailability?: string
    idealClientTypes?: string[]
    dreamProjectDescription?: string
    yearsExperience?: number
    city?: string
    country?: string
  }
}

export function generateEnhancedMatchingPrompt(context: EnhancedMatchingContext): string {
  const { clientBrief, designer } = context
  const category = DESIGN_CATEGORIES[clientBrief.design_category as keyof typeof DESIGN_CATEGORIES]

  return `You are an elite designer-client matchmaker AI. Your task is to analyze a client's project brief and available designers to identify THE SINGLE PERFECT MATCH with surgical precision.

==== YOUR MISSION ====
Read the client brief and designer profiles, then select exactly ONE designer who represents the optimal match. Your selection must be defensible, data-driven, and compelling.

==== INPUT ANALYSIS FRAMEWORK ====

FROM CLIENT BRIEF, EXTRACT:
1. CORE REQUIREMENTS (Non-negotiables)
   - Category: ${category?.name || clientBrief.design_category}
   - Specific deliverables: ${clientBrief.deliverables?.join(', ') || 'Not specified'}
   - Timeline: ${clientBrief.timeline_type} (${getTimelineDescription(clientBrief.timeline_type)})
   - Budget: ${clientBrief.budget_range} (${getBudgetDescription(clientBrief.budget_range)})

2. PROJECT ESSENCE
   - Primary goal: ${clientBrief.project_goal || 'Not specified'}
   - Target audience: ${clientBrief.target_audience || 'Not specified'}
   - Project description: ${clientBrief.project_description}

3. CREATIVE DIRECTION
   - Style keywords: ${clientBrief.design_style_keywords?.join(', ') || 'Not specified'}
   - Avoid: ${clientBrief.avoid_colors_styles || 'Nothing specified'}
   - Brand guidelines: ${clientBrief.has_brand_guidelines ? 'Yes, existing guidelines' : 'No, starting fresh'}

4. COLLABORATION PREFERENCES
   - Involvement level: ${clientBrief.involvement_level || 'Not specified'}
   - Communication preference: ${clientBrief.communication_preference || 'Not specified'}
   - Previous experience: ${clientBrief.previous_designer_experience || 'Not specified'}

DESIGNER PROFILE EVALUATION:
1. CATEGORY EXPERTISE
   - Primary specialization: ${designer.primaryCategories?.join(', ') || 'Not specified'}
   - Secondary categories: ${designer.secondaryCategories?.join(', ') || 'None'}

2. STYLE DNA
   - Design philosophy: ${designer.designPhilosophy || 'Not provided'}
   - Style keywords: ${designer.styleKeywords?.join(', ') || 'Not specified'}

3. EXPERIENCE RELEVANCE
   - Years experience: ${designer.yearsExperience || 0} years
   - Preferred industries: ${designer.preferredIndustries?.join(', ') || 'All industries'}
   - Project sizes: ${designer.preferredProjectSizes?.join(', ') || 'All sizes'}
   - Special skills: ${designer.specialSkills?.join(', ') || 'None specified'}

4. PRACTICAL FIT
   - Location: ${designer.city || 'Not specified'}, ${designer.country || 'Not specified'}
   - Availability: ${designer.currentAvailability || 'Not specified'}
   - Turnaround times: ${formatTurnaroundTimes(designer.turnaroundTimes)}

5. WORKING STYLE
   - Collaboration style: ${designer.collaborationStyle || 'Not specified'}
   - Revisions included: ${designer.revisionRoundsIncluded || 'Not specified'}
   - Tools expertise: ${designer.expertTools?.join(', ') || 'Not specified'}

==== MATCHING ALGORITHM ====

STEP 1: ELIMINATION FILTERS
Check if designer passes ALL requirements:
□ Correct category specialization
□ Within budget range (+/- 20%)
□ Available for timeline
□ Style doesn't conflict with avoid list
□ Has required tools/skills

STEP 2: SCORING MATRIX
Calculate composite score using:

CATEGORY MASTERY (30 points max)
- Exact category match: 15 points
- Specific deliverables in portfolio: 10 points
- Years in this category: 5 points

STYLE ALIGNMENT (25 points max)
- Portfolio matches style keywords: 10 points
- Philosophy aligns with project: 8 points
- Demonstrates required range: 7 points

PROJECT FIT (20 points max)
- Industry experience: 8 points
- Scale/scope match: 7 points
- Goal achievement history: 5 points

WORKING COMPATIBILITY (15 points max)
- Communication style alignment: 8 points
- Process match: 7 points

VALUE FACTORS (10 points max)
- Within budget sweet spot: 5 points
- Availability timing: 3 points
- Extra value (strategy, research): 2 points

STEP 3: DISTINCTION ANALYSIS
For this designer, identify:
1. The "only they can do this" factor
2. The "perfect storm" alignment
3. The risk mitigation
4. The surprise delight

==== DECISION CONFIDENCE FRAMEWORK ====
- 100% Confidence: Perfect match across all criteria
- 95% Confidence: All criteria except minor gap
- 90% Confidence: Strong match with one compromise
- 85% Confidence: Good match with two minor compromises
- Below 85%: Do not recommend

RESPONSE FORMAT:
Return valid JSON only:
{
  "isMatch": true,
  "score": 85,
  "confidence": "95%",
  "matchDecision": "PERFECT MATCH: This designer was seemingly custom-built for this project",
  "keyDistinction": "The only designer who combines [specific unique combination]",
  "scoreBreakdown": {
    "categoryMastery": 28,
    "styleAlignment": 23,
    "projectFit": 18,
    "workingCompatibility": 13,
    "valueFactors": 8
  },
  "matchNarrative": "Compelling 2-3 sentence story of why THIS designer for THIS project",
  "specificEvidence": [
    "Concrete example from portfolio that proves capability",
    "Specific metric or achievement relevant to project",
    "Unique qualification that addresses client need",
    "Timeline/budget alignment with past similar projects"
  ],
  "riskMitigation": "How this designer specifically solves client's past pain points",
  "surpriseDelight": "Unexpected bonus value they bring",
  "nextSteps": "Concrete action items and timeline",
  "alternativeRecommendation": "If score <85: Specific gaps and what to adjust"
}

REMEMBER: You are not finding a "good" match. You are identifying THE designer who was seemingly custom-built for this exact project. Make the match compelling and undeniable.`
}

function getTimelineDescription(timeline: string): string {
  const descriptions = {
    urgent: 'Less than 1 week',
    standard: '2-4 weeks', 
    flexible: '1+ months'
  }
  return descriptions[timeline as keyof typeof descriptions] || timeline
}

function getBudgetDescription(budget: string): string {
  const descriptions = {
    entry: '$500-$2,000',
    mid: '$2,000-$10,000',
    premium: '$10,000+'
  }
  return descriptions[budget as keyof typeof descriptions] || budget
}

function formatTurnaroundTimes(times?: Record<string, number>): string {
  if (!times) return 'Not specified'
  
  return Object.entries(times)
    .map(([category, days]) => `${category}: ${days} days`)
    .join(', ')
}