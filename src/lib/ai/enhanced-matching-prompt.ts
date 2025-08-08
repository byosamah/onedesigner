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

  return `You are an expert design matchmaker analyzing client requirements against designer profiles to find perfect matches.

CLIENT PROJECT DETAILS:
Category: ${category?.name || clientBrief.design_category}
Description: ${clientBrief.project_description}
Timeline: ${clientBrief.timeline_type} (${getTimelineDescription(clientBrief.timeline_type)})
Budget: ${clientBrief.budget_range} (${getBudgetDescription(clientBrief.budget_range)})
Deliverables: ${clientBrief.deliverables?.join(', ') || 'Not specified'}
Target Audience: ${clientBrief.target_audience || 'Not specified'}
Project Goal: ${clientBrief.project_goal || 'Not specified'}
Style Keywords: ${clientBrief.design_style_keywords?.join(', ') || 'Not specified'}
Avoid: ${clientBrief.avoid_colors_styles || 'Nothing specified'}
Involvement Level: ${clientBrief.involvement_level || 'Not specified'}
Communication: ${clientBrief.communication_preference || 'Not specified'}
Brand Guidelines: ${clientBrief.has_brand_guidelines ? 'Yes, existing guidelines' : 'No, starting fresh'}

DESIGNER PROFILE:
Name: ${designer.firstName} ${designer.lastName}
Philosophy: ${designer.designPhilosophy || 'Not provided'}
Experience: ${designer.yearsExperience || 0} years
Location: ${designer.city || 'Not specified'}, ${designer.country || 'Not specified'}
Primary Categories: ${designer.primaryCategories?.join(', ') || 'Not specified'}
Secondary Categories: ${designer.secondaryCategories?.join(', ') || 'None'}
Style Keywords: ${designer.styleKeywords?.join(', ') || 'Not specified'}
Preferred Industries: ${designer.preferredIndustries?.join(', ') || 'All industries'}
Project Sizes: ${designer.preferredProjectSizes?.join(', ') || 'All sizes'}
Tools: ${designer.expertTools?.join(', ') || 'Not specified'}
Special Skills: ${designer.specialSkills?.join(', ') || 'None specified'}
Collaboration Style: ${designer.collaborationStyle || 'Not specified'}
Availability: ${designer.currentAvailability || 'Not specified'}
Turnaround Times: ${formatTurnaroundTimes(designer.turnaroundTimes)}
Revisions Included: ${designer.revisionRoundsIncluded || 'Not specified'}
Dream Project: ${designer.dreamProjectDescription || 'Not specified'}

SCORING CRITERIA & WEIGHTS:
1. Category Match (30%): Must match primary or secondary categories
2. Style Alignment (25%): Keywords, philosophy, and aesthetic compatibility
3. Budget Compatibility (15%): Designer's preferred project sizes vs client budget
4. Timeline Feasibility (15%): Designer's turnaround times vs client timeline
5. Industry/Audience Fit (10%): Relevant experience with client's industry/audience
6. Working Style Match (5%): Communication and collaboration preferences

ANALYSIS INSTRUCTIONS:
1. First verify category compatibility (required for any match)
2. Assess style alignment using both explicit keywords and implied aesthetics
3. Check budget/timeline feasibility based on designer's preferences
4. Evaluate communication and collaboration fit
5. Consider industry experience and special skills relevance
6. Calculate weighted score (50-95 range, realistic distribution)

RESPONSE FORMAT:
Return valid JSON only:
{
  "score": 85,
  "confidence": "high",
  "categoryMatch": true,
  "matchSummary": "Perfect alignment for modern tech branding with collaborative approach",
  "reasons": [
    "Primary category match: Branding & Logo Design",
    "Style keywords align: 'minimalist', 'modern', 'bold'",
    "Budget compatible: Mid-tier projects ($2k-10k) fits $5k budget",
    "Timeline works: 15-day turnaround for 3-week deadline",
    "Industry experience: 5+ tech startup projects"
  ],
  "personalizedReasons": [
    "Your desire for 'clean, innovative, bold' perfectly matches their minimalist-forward design philosophy showcased across 12+ tech projects",
    "Their experience with 3 recent startup rebrandings targeting millennials aligns exactly with your demographic goals",
    "Prefers milestone check-ins with creative freedom between - exactly matching your requested involvement level",
    "15-day turnaround for brand identity projects fits comfortably within your 3-week timeline with buffer for revisions"
  ],
  "uniqueValue": "Specializes in translating complex technical concepts into accessible visual language that resonates with digital-native audiences",
  "potentialChallenges": [
    "Designer prefers 2-week minimum timelines, your urgent needs may require discussion"
  ],
  "riskLevel": "low",
  "scoreBreakdown": {
    "categoryMatch": 30,
    "styleAlignment": 22,
    "budgetFit": 12,
    "timelineFit": 13,
    "industryFit": 8,
    "workingStyleFit": 5
  }
}

IMPORTANT: 
- Be realistic with scores (50-80% typical, 85%+ rare)
- Use specific details from both profiles in personalizedReasons
- Identify potential challenges honestly
- Focus on concrete compatibility factors, not generic praise`
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