import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

export interface SimpleMatch {
  designer: any
  score: number
  reasons: string[]
}

export class SimpleMatcher {
  private supabase = createServiceClient()

  async findMatches(brief: any): Promise<SimpleMatch[]> {
    logger.info('=== SIMPLE MATCHING START ===')
    logger.info('Looking for designers...')

    try {
      // Get all approved and verified designers
      const { data: designers, error } = await this.supabase
        .from('designers')
        .select('*')
        .eq('is_verified', true)
        .eq('is_approved', true)
        .neq('availability', 'busy')

      if (error || !designers || designers.length === 0) {
        logger.info('No available designers found')
        return []
      }

      logger.info(`Found ${designers.length} available designers`)

      // Exclude already matched designers (only if client_id exists)
      let availableDesigners = designers
      
      if (brief.client_id) {
        const { data: previousMatches } = await this.supabase
          .from('matches')
          .select('designer_id')
          .eq('client_id', brief.client_id)

        const excludedIds = previousMatches?.map(m => m.designer_id) || []
        availableDesigners = designers.filter(d => !excludedIds.includes(d.id))

        if (availableDesigners.length === 0) {
          logger.info('All designers already matched with this client')
          return []
        }
      }

      // Simple scoring based on available fields
      const matches = availableDesigners.map(designer => {
        let score = 50 // Base score
        const reasons = []

        // Check industry match
        const briefIndustry = brief.industry?.toLowerCase() || ''
        if (designer.industries?.some((ind: string) => 
          ind.toLowerCase().includes(briefIndustry) || 
          briefIndustry.includes(ind.toLowerCase())
        )) {
          score += 20
          reasons.push('Industry expertise match')
        }

        // Check style match
        if (brief.styles && designer.styles) {
          const matchingStyles = brief.styles.filter((style: string) =>
            designer.styles.some((dStyle: string) => 
              dStyle.toLowerCase().includes(style.toLowerCase())
            )
          )
          if (matchingStyles.length > 0) {
            score += 15
            reasons.push(`Matching design styles: ${matchingStyles.join(', ')}`)
          }
        }

        // Experience level bonus
        if (designer.years_experience >= 5) {
          score += 10
          reasons.push(`${designer.years_experience} years of experience`)
        }

        // Rating bonus
        if (designer.rating >= 4.5) {
          score += 5
          reasons.push(`High rating: ${designer.rating}/5`)
        }

        // Add generic reasons
        if (reasons.length === 0) {
          reasons.push('Available for new projects')
          reasons.push('Verified designer')
        }

        return {
          designer: {
            ...designer,
            firstName: designer.first_name,
            lastName: designer.last_name,
            lastInitial: designer.last_initial || designer.last_name?.charAt(0),
            yearsExperience: designer.years_experience,
            totalProjects: designer.total_projects
          },
          score: Math.min(score, 95), // Cap at 95%
          reasons
        }
      })

      // Sort by score and return top 3
      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

    } catch (error) {
      logger.error('Simple matching failed:', error)
      return []
    }
  }
}

export function createSimpleMatcher(): SimpleMatcher {
  return new SimpleMatcher()
}