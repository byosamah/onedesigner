import { createServiceClient } from '@/lib/supabase/server'
import { createAIProvider } from '@/lib/ai'
import { generateEnhancedMatchingPrompt, EnhancedMatchingContext } from '@/lib/ai/enhanced-matching-prompt'
import { DESIGN_CATEGORIES, BUDGET_RANGES, TIMELINE_TYPES } from '@/lib/constants'
import { logger } from '@/lib/core/logging-service'

export interface EnhancedDesignMatch {
  score: number
  confidence: 'low' | 'medium' | 'high'
  categoryMatch: boolean
  matchSummary: string
  reasons: string[]
  personalizedReasons: string[]
  uniqueValue: string
  potentialChallenges: string[]
  riskLevel: 'low' | 'medium' | 'high'
  scoreBreakdown: {
    categoryMatch: number
    styleAlignment: number
    budgetFit: number
    timelineFit: number
    industryFit: number
    workingStyleFit: number
  }
  designer: any
  aiAnalyzed: boolean
}

export interface ClientBrief {
  id: string
  client_id: string
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

export class EnhancedDesignMatcher {
  private supabase = createServiceClient()
  private aiProvider = createAIProvider()

  async findMatches(brief: ClientBrief): Promise<EnhancedDesignMatch[]> {
    logger.info('=== ENHANCED MATCHING START ===')
    logger.info('Brief category:', brief.design_category)
    logger.info('Brief timeline:', brief.timeline_type)
    logger.info('Brief budget:', brief.budget_range)

    try {
      // 1. CATEGORY FILTERING (Hard requirement)
      const categoryMatches = await this.filterByCategory(brief.design_category)
      logger.info(`Found ${categoryMatches.length} designers in category`)

      if (categoryMatches.length === 0) {
        logger.info('No designers found in category')
        return []
      }

      // 2. EXCLUDE PREVIOUSLY MATCHED DESIGNERS
      const availableDesigners = await this.excludePreviousMatches(categoryMatches, brief.client_id)
      logger.info(`${availableDesigners.length} designers available after excluding previous matches`)

      if (availableDesigners.length === 0) {
        logger.info('All designers in category already matched')
        return []
      }

      // 3. BUDGET & TIMELINE FILTERING
      const feasibleMatches = this.filterByBudgetTimeline(availableDesigners, brief)
      logger.info(`${feasibleMatches.length} designers after budget/timeline filter`)

      // 4. AI SCORING FOR EACH DESIGNER
      const matchPromises = feasibleMatches.map(designer => 
        this.scoreDesignerMatch(designer, brief)
      )

      const scoredMatches = await Promise.all(matchPromises)
      const validMatches = scoredMatches.filter(match => 
        match !== null && match.score >= 50 && match.categoryMatch
      ) as EnhancedDesignMatch[]

      // 5. RANK AND SELECT TOP 3
      const topMatches = validMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      logger.info(`=== FINAL MATCHES ===`)
      topMatches.forEach((match, index) => {
        logger.info(`${index + 1}. ${match.designer.firstName} ${match.designer.lastName} - ${match.score}% (${match.confidence})`)
        logger.info(`   Summary: ${match.matchSummary}`)
      })

      return topMatches

    } catch (error) {
      logger.error('Enhanced matching failed:', error)
      return []
    }
  }

  private async filterByCategory(designCategory: string): Promise<any[]> {
    // Query designers who have this category as primary or secondary
    const { data: designers, error } = await this.supabase
      .from('designers')
      .select(`
        id, first_name, last_name, email, title, city, country, 
        years_experience, design_philosophy, 
        primary_categories, secondary_categories, style_keywords,
        preferred_industries, preferred_project_sizes,
        expert_tools, special_skills, turnaround_times,
        revision_rounds_included, collaboration_style, 
        current_availability, ideal_client_types,
        dream_project_description, portfolio_projects,
        is_verified, is_approved, rating, total_projects,
        avg_client_satisfaction, on_time_delivery_rate
      `)
      .eq('is_verified', true)
      .eq('is_approved', true)
      .in('current_availability', ['available', 'busy'])
      .or(`primary_categories.cs.{${designCategory}}, secondary_categories.cs.{${designCategory}}`)

    if (error) {
      logger.error('Error filtering by category:', error)
      return []
    }

    return designers || []
  }

  private async excludePreviousMatches(designers: any[], clientId: string): Promise<any[]> {
    // Get all previously matched designer IDs for this client
    const { data: previousMatches } = await this.supabase
      .from('matches')
      .select('designer_id')
      .eq('client_id', clientId)

    const excludedIds = previousMatches?.map(m => m.designer_id) || []
    
    return designers.filter(designer => !excludedIds.includes(designer.id))
  }

  private filterByBudgetTimeline(designers: any[], brief: ClientBrief): any[] {
    const budgetRange = BUDGET_RANGES[brief.budget_range as keyof typeof BUDGET_RANGES]
    const timelineType = TIMELINE_TYPES[brief.timeline_type as keyof typeof TIMELINE_TYPES]

    return designers.filter(designer => {
      // Budget compatibility check
      const prefersSizes = designer.preferred_project_sizes || ['small', 'medium', 'large']
      const budgetCompatible = this.isBudgetCompatible(prefersSizes, budgetRange)

      // Timeline compatibility check  
      const turnaroundTimes = designer.turnaround_times || {}
      const categoryTime = turnaroundTimes[brief.design_category] || 14 // default 2 weeks
      const timelineCompatible = categoryTime <= timelineType.days

      // Availability check
      const availabilityOk = designer.current_availability !== 'unavailable'

      return budgetCompatible && timelineCompatible && availabilityOk
    })
  }

  private isBudgetCompatible(preferredSizes: string[], budgetRange: any): boolean {
    // Map budget ranges to project sizes
    const budgetToSize: Record<string, string[]> = {
      'entry': ['small'],
      'mid': ['small', 'medium'], 
      'premium': ['medium', 'large']
    }

    const compatibleSizes = budgetToSize[budgetRange.id] || []
    return preferredSizes.some(size => compatibleSizes.includes(size))
  }

  private async scoreDesignerMatch(designer: any, brief: ClientBrief): Promise<EnhancedDesignMatch | null> {
    try {
      const context: EnhancedMatchingContext = {
        clientBrief: brief,
        designer: {
          id: designer.id,
          firstName: designer.first_name,
          lastName: designer.last_name,
          designPhilosophy: designer.design_philosophy,
          primaryCategories: designer.primary_categories,
          secondaryCategories: designer.secondary_categories,
          styleKeywords: designer.style_keywords,
          portfolioProjects: designer.portfolio_projects,
          preferredIndustries: designer.preferred_industries,
          preferredProjectSizes: designer.preferred_project_sizes,
          expertTools: designer.expert_tools,
          specialSkills: designer.special_skills,
          turnaroundTimes: designer.turnaround_times,
          revisionRoundsIncluded: designer.revision_rounds_included,
          collaborationStyle: designer.collaboration_style,
          currentAvailability: designer.current_availability,
          idealClientTypes: designer.ideal_client_types,
          dreamProjectDescription: designer.dream_project_description,
          yearsExperience: designer.years_experience,
          city: designer.city,
          country: designer.country
        }
      }

      const prompt = generateEnhancedMatchingPrompt(context)
      const response = await this.aiProvider.generateText(prompt)

      // Parse AI response
      const aiResult = JSON.parse(response)
      
      return {
        ...aiResult,
        designer: {
          id: designer.id,
          firstName: designer.first_name,
          lastName: designer.last_name,
          lastInitial: designer.last_name?.charAt(0)?.toUpperCase() || '',
          title: designer.title || 'Designer',
          city: designer.city,
          country: designer.country,
          yearsExperience: designer.years_experience || 0,
          rating: designer.rating || 4.5,
          totalProjects: designer.total_projects || 0,
          designPhilosophy: designer.design_philosophy,
          primaryCategories: designer.primary_categories,
          styleKeywords: designer.style_keywords,
          portfolioProjects: designer.portfolio_projects,
          avgClientSatisfaction: designer.avg_client_satisfaction,
          onTimeDeliveryRate: designer.on_time_delivery_rate
        },
        aiAnalyzed: true
      }

    } catch (error) {
      logger.error(`AI scoring failed for designer ${designer.id}:`, error)
      return null
    }
  }
}

// Helper function to create enhanced matcher instance
export function createEnhancedMatcher(): EnhancedDesignMatcher {
  return new EnhancedDesignMatcher()
}