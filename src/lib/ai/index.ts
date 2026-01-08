import { AIProvider, MatchResult } from './types'
import { DeepSeekProvider } from './providers/deepseek'
import { logger } from '@/lib/core/logging-service'

// Fallback scoring algorithm when AI providers fail
class FallbackProvider implements AIProvider {
  name = 'fallback'

  async generateMatches(designers: any[], brief: any, count: number = 3): Promise<MatchResult[]> {
    logger.info('🔄 Using fallback matching algorithm')

    return designers.slice(0, count).map(designer => {
      const score = this.calculateFallbackScore(brief, designer)
      return {
        designerId: designer.id,
        score,
        reasons: [
          `Designer specializes in ${designer.categories?.join(', ') || 'general design'}`,
          `${designer.years_experience || 0}+ years of professional experience`,
          `Available for ${brief.timeline || 'flexible'} timeline projects`
        ],
        message: `${designer.first_name} appears to be a good match for your ${brief.project_type} project based on their experience and specialization.`,
        confidence: 'fallback',
        processingTime: 0,
        tokensUsed: 0
      }
    })
  }

  private calculateFallbackScore(brief: any, designer: any): number {
    let score = 55 // Base score

    // Category match
    if (designer.categories?.includes(brief.project_type)) {
      score += 10
    }

    // Experience bonus
    const years = designer.years_experience || 0
    if (years >= 5) score += 5
    if (years >= 10) score += 5

    // Style match
    if (brief.styles && designer.design_styles) {
      const styleMatch = brief.styles.some((style: string) =>
        designer.design_styles.includes(style)
      )
      if (styleMatch) score += 8
    }

    // Industry match
    if (brief.industry && designer.industries_worked?.includes(brief.industry)) {
      score += 7
    }

    // Ensure score is within realistic range
    return Math.min(75, Math.max(50, score))
  }
}

export function createAIProvider(): AIProvider {
  try {
    return new DeepSeekProvider()
  } catch (error) {
    logger.error('DeepSeek initialization failed:', error)
    logger.warn('🔄 Falling back to rule-based matching')
    return new FallbackProvider()
  }
}

// Enhanced provider with automatic fallback
export class AIProviderWithFallback implements AIProvider {
  name = 'enhanced'
  private primary: AIProvider
  private fallback: AIProvider

  constructor() {
    try {
      this.primary = new DeepSeekProvider()
    } catch (error) {
      logger.error('Primary AI provider failed to initialize:', error)
      this.primary = new FallbackProvider()
    }
    this.fallback = new FallbackProvider()
  }

  async generateMatches(designers: any[], brief: any, count: number = 3): Promise<MatchResult[]> {
    try {
      // Try primary provider first
      const result = await this.primary.generateMatches(designers, brief, count)

      // Validate results
      if (result && result.length > 0 && result.every(r => r.score >= 50)) {
        return result
      }

      logger.warn('Primary provider returned invalid results, using fallback')
      return await this.fallback.generateMatches(designers, brief, count)

    } catch (error) {
      logger.error('Primary AI provider failed:', error)
      logger.info('🔄 Switching to fallback matching')

      try {
        return await this.fallback.generateMatches(designers, brief, count)
      } catch (fallbackError) {
        logger.error('Fallback provider also failed:', fallbackError)
        throw new Error('All AI providers failed')
      }
    }
  }
}

export function createEnhancedAIProvider(): AIProvider {
  return new AIProviderWithFallback()
}

export * from './types'