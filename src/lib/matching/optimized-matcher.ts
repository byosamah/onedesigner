import { EventEmitter } from 'events'
import { createServiceClient } from '@/lib/supabase/server'
import { EmbeddingService } from './embedding-service'
import { MatchingCache } from './matching-cache'
import { generateMatchExplanation } from './explanation-generator'
import { createAIProvider } from '@/lib/ai'
import { performanceMonitor } from '@/lib/monitoring/performance'

export interface Designer {
  id: string
  first_name: string
  last_name: string
  title: string
  city: string
  country: string
  styles: string[]
  industries: string[]
  availability: string
  rating?: number
  years_experience?: number
  is_approved: boolean
  is_verified: boolean
  quickStats?: {
    total_projects: number
    avg_rating: number
    completion_rate: number
    avg_response_time_hours: number
    top_industries: string[]
    top_styles: string[]
  }
  // Enhanced fields
  specializations?: string[]
  portfolio_keywords?: string[]
  avg_client_satisfaction?: number
  on_time_delivery_rate?: number
  project_completion_rate?: number
}

export interface Brief {
  id: string
  client_id: string
  project_type: string
  industry: string
  timeline: string
  budget: string
  styles: string[]
  requirements?: string
  inspiration?: string
  target_audience?: string
  brand_personality?: string
  success_metrics?: string
}

export interface ScoredDesigner {
  designer: Designer
  score: number
  breakdown?: {
    localScore: number
    embeddingScore: number
  }
}

export interface InstantMatch {
  topMatch: ScoredDesigner
  candidates: ScoredDesigner[]
  phase: 'instant'
  confidence: 'low'
}

export interface MatchResult {
  phase: 'instant' | 'refined' | 'final'
  match: ScoredDesigner & {
    explanation?: string
    strengths?: string[]
    uniqueValue?: string
    confidence?: 'low' | 'medium' | 'high'
  }
  confidence: 'low' | 'medium' | 'high'
  elapsed: number
  alternatives?: ScoredDesigner[]
}

export class OptimizedMatcher extends EventEmitter {
  private cache: MatchingCache
  private embeddingService: EmbeddingService
  private supabase: any
  private aiProvider: any

  constructor() {
    super()
    this.cache = new MatchingCache()
    this.embeddingService = new EmbeddingService()
    this.supabase = createServiceClient()
    
    try {
      this.aiProvider = createAIProvider()
    } catch (error) {
      console.warn('AI provider not available, using local scoring only')
    }
  }

  /**
   * Main matching function with progressive enhancement
   */
  async findMatch(brief: Brief, options: { maxCandidates?: number } = {}) {
    const startTime = Date.now()
    
    // PHASE 1: Instant Local Matching (0-50ms target)
    const instantMatch = await this.getInstantMatch(brief)
    this.emit('match', {
      phase: 'instant',
      match: instantMatch.topMatch,
      confidence: 'low',
      elapsed: Date.now() - startTime
    })
    
    // PHASE 2: Quick AI Scoring (500ms target)
    if (this.aiProvider) {
      this.scheduleQuickScoring(brief, instantMatch.candidates, startTime)
    }
    
    // PHASE 3: Deep Analysis (2s target)
    if (this.aiProvider) {
      this.scheduleDeepAnalysis(brief, instantMatch.candidates, startTime)
    }
    
    return instantMatch
  }

  /**
   * PHASE 1: Instant matching using local scoring + embeddings
   */
  async getInstantMatch(brief: Brief): Promise<InstantMatch> {
    performanceMonitor.startTimer('instant_match')
    const startTime = Date.now()
    
    // Step 1: Pre-filter eligible designers using indexed queries
    performanceMonitor.startTimer('database_query')
    const eligibleDesigners = await this.getEligibleDesigners(brief)
    performanceMonitor.endTimer('database_query')
    
    console.log(`[INSTANT] Found ${eligibleDesigners.length} eligible designers in ${Date.now() - startTime}ms`)
    
    // Step 2: Calculate local scores in parallel
    const scoringPromises = eligibleDesigners.map(async (designer) => {
      // Check cache first
      performanceMonitor.startTimer('cache_lookup')
      const cached = await this.cache.get(brief, designer.id)
      performanceMonitor.endTimer('cache_lookup')
      
      if (cached && cached.phase === 'instant') {
        return cached
      }
      
      // Calculate score using multiple factors
      const [localScore, embeddingScore] = await Promise.all([
        this.calculateLocalScore(designer, brief),
        this.embeddingService.calculateEmbeddingScore(designer.id, brief)
      ])
      
      const result = {
        designer,
        score: Math.round(localScore * 0.7 + embeddingScore * 0.3),
        breakdown: { localScore, embeddingScore }
      }
      
      // Cache the instant result
      await this.cache.set(brief, designer.id, result, 'instant', 3600) // 1 hour TTL
      
      return result
    })
    
    const scores = await Promise.all(scoringPromises)
    scores.sort((a, b) => b.score - a.score)
    
    const elapsed = performanceMonitor.endTimer('instant_match')
    console.log(`[INSTANT] Scoring completed in ${elapsed}ms`)
    
    return {
      topMatch: scores[0],
      candidates: scores.slice(0, 20), // Keep top 20 for next phases
      phase: 'instant',
      confidence: 'low'
    }
  }

  /**
   * Get eligible designers using optimized queries
   */
  private async getEligibleDesigners(brief: Brief & { excludedDesignerIds?: string[] }): Promise<Designer[]> {
    // Use indexed queries for speed
    let query = this.supabase
      .from('designers')
      .select(`
        *,
        designer_quick_stats!inner (
          total_projects,
          avg_rating,
          completion_rate,
          avg_response_time_hours,
          top_industries,
          top_styles
        )
      `)
      .eq('is_approved', true)
      .eq('is_verified', true)
      .in('availability', ['available', 'busy'])
      .limit(100) // Limit for performance
    
    // Exclude already matched designers if provided
    if (brief.excludedDesignerIds && brief.excludedDesignerIds.length > 0) {
      query = query.not('id', 'in', `(${brief.excludedDesignerIds.join(',')})`)
    }
    
    const { data: designers, error } = await query
    
    if (error || !designers) {
      console.error('Error fetching designers:', error)
      return []
    }
    
    // Map quick stats to designer objects
    return designers.map(d => ({
      ...d,
      quickStats: d.designer_quick_stats?.[0] || null
    }))
  }

  /**
   * Optimized local scoring algorithm
   */
  private calculateLocalScore(designer: Designer, brief: Brief): number {
    let score = 0
    const weights = this.getDynamicWeights(brief)
    
    // Style matching with fast set operations
    const designerStyles = new Set(designer.styles || [])
    const briefStyles = new Set(brief.styles || [])
    const styleOverlap = [...briefStyles].filter(style => designerStyles.has(style))
    score += (styleOverlap.length / brief.styles.length) * weights.style * 100
    
    // Industry match (direct lookup)
    if (designer.industries?.includes(brief.industry)) {
      score += weights.industry * 100
    }
    
    // Availability scoring
    const availabilityScore = {
      'available': 1.0,
      'busy': 0.6,
      'unavailable': 0
    }[designer.availability] || 0
    score += availabilityScore * weights.availability * 100
    
    // Performance metrics from quick stats
    if (designer.quickStats) {
      score += (designer.quickStats.avg_rating / 5) * weights.rating * 100
      score += designer.quickStats.completion_rate * weights.reliability * 100
    }
    
    // Timeline compatibility
    if (brief.timeline === 'ASAP' && designer.availability === 'available') {
      score += 10 // Bonus for urgent availability
    }
    
    return Math.min(100, Math.round(score))
  }

  /**
   * Get dynamic weights based on brief characteristics
   */
  private getDynamicWeights(brief: Brief) {
    const isUrgent = brief.timeline === 'ASAP' || brief.timeline === '1-2 weeks'
    
    return {
      style: isUrgent ? 0.25 : 0.35,
      industry: 0.25,
      availability: isUrgent ? 0.35 : 0.15,
      rating: 0.10,
      reliability: 0.15
    }
  }

  /**
   * PHASE 2: Quick AI Scoring (Lightweight)
   */
  private async scheduleQuickScoring(brief: Brief, candidates: ScoredDesigner[], startTime: number) {
    // Use setTimeout to not block the event loop
    setTimeout(async () => {
      try {
        const quickScores = await this.quickAIScore(
          candidates.slice(0, 10), // Top 10 candidates for speed
          brief
        )
        
        if (quickScores.length > 0) {
          this.emit('match', {
            phase: 'refined',
            match: {
              ...quickScores[0],
              confidence: 'medium'
            },
            confidence: 'medium',
            elapsed: Date.now() - startTime,
            alternatives: quickScores.slice(1, 4)
          })
        }
      } catch (error) {
        console.error('[REFINED] Quick scoring failed:', error)
        // Instant match already sent, so failures here are non-critical
      }
    }, 0)
  }

  /**
   * Lightweight AI scoring for speed
   */
  private async quickAIScore(candidates: ScoredDesigner[], brief: Brief): Promise<ScoredDesigner[]> {
    performanceMonitor.startTimer('refined_match')
    
    // Build a compact prompt for speed
    const prompt = `
Rate these ${candidates.length} designers for this project (0-100). Be realistic and critical.

PROJECT: ${brief.project_type} for ${brief.industry}
STYLES: ${brief.styles.join(', ')}
TIMELINE: ${brief.timeline}
BUDGET: ${brief.budget}

DESIGNERS:
${candidates.map((c, idx) => `
${idx + 1}. ID: ${c.designer.id}
   Styles: ${c.designer.styles.filter(s => brief.styles.includes(s)).join(', ') || 'None matching'}
   Industry: ${c.designer.industries.includes(brief.industry) ? '✓ Matches' : '✗ No match'}
   Rating: ${c.designer.quickStats?.avg_rating || c.designer.rating || 'Unknown'}/5
   Available: ${c.designer.availability}
   Local Score: ${c.score}
`).join('\n')}

Return JSON only with realistic scores: {"designer_id": score, ...}
Most scores should be 50-80. Only exceptional matches should score 85+.`

    try {
      const response = await this.aiProvider.analyzeMatch(
        { prompt, isQuickScore: true },
        { maxTokens: 300, temperature: 0.3 }
      )
      
      // Parse AI scores and merge with local scores
      const aiScores = JSON.parse(response)
      
      return candidates.map(candidate => {
        const aiScore = aiScores[candidate.designer.id] || candidate.score
        const finalScore = Math.round(candidate.score * 0.3 + aiScore * 0.7)
        
        // Cache the refined score
        this.cache.set(brief, candidate.designer.id, {
          ...candidate,
          score: finalScore,
          aiScore
        }, 'refined', 3600)
        
        return {
          ...candidate,
          score: finalScore,
          aiScore
        }
      }).sort((a, b) => b.score - a.score)
      
      performanceMonitor.endTimer('refined_match')
      return candidates
    } catch (error) {
      console.error('[REFINED] AI quick scoring error:', error)
      performanceMonitor.endTimer('refined_match')
      return candidates // Return original scores if AI fails
    }
  }

  /**
   * PHASE 3: Deep Analysis for Top Matches
   */
  private async scheduleDeepAnalysis(brief: Brief, candidates: ScoredDesigner[], startTime: number) {
    // Start after 1s to ensure quick results are shown first
    setTimeout(async () => {
      try {
        const topCandidates = candidates.slice(0, 5)
        const deepAnalysis = await this.performDeepAnalysis(topCandidates, brief)
        
        if (deepAnalysis.length > 0) {
          this.emit('match', {
            phase: 'final',
            match: {
              ...deepAnalysis[0],
              confidence: 'high'
            },
            confidence: 'high',
            elapsed: Date.now() - startTime,
            alternatives: deepAnalysis.slice(1, 4)
          })
        }
      } catch (error) {
        console.error('[FINAL] Deep analysis failed:', error)
      }
    }, 1000)
  }

  /**
   * Comprehensive AI analysis for final matches
   */
  private async performDeepAnalysis(candidates: ScoredDesigner[], brief: Brief): Promise<any[]> {
    performanceMonitor.startTimer('final_match')
    
    // Check cache first
    const cachedResults = await Promise.all(
      candidates.map(c => this.cache.get(brief, c.designer.id))
    )
    
    const needsAnalysis = candidates.filter((c, idx) => 
      !cachedResults[idx] || cachedResults[idx].phase !== 'final'
    )
    
    if (needsAnalysis.length === 0) {
      return cachedResults.filter(r => r !== null)
    }
    
    // Run parallel deep analysis
    const analyses = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const result = await this.aiProvider.analyzeMatch(candidate.designer, brief)
          
          const explanation = generateMatchExplanation({
            designer: candidate.designer,
            brief,
            aiAnalysis: result,
            scores: {
              totalScore: result.score,
              breakdown: candidate.breakdown || {},
              weights: this.getDynamicWeights(brief),
              confidence: result.confidence || 'medium'
            }
          })
          
          const finalResult = {
            ...candidate,
            score: result.score,
            explanation,
            strengths: result.strengths || result.reasons,
            uniqueValue: result.uniqueValue,
            confidence: result.confidence
          }
          
          // Cache the final result
          await this.cache.set(brief, candidate.designer.id, finalResult, 'final', 7200) // 2 hour TTL
          
          return finalResult
        } catch (error) {
          console.error(`[FINAL] Analysis failed for designer ${candidate.designer.id}:`, error)
          return candidate // Return original if analysis fails
        }
      })
    )
    
    // Sort by comprehensive score
    const result = analyses.sort((a, b) => b.score - a.score)
    performanceMonitor.endTimer('final_match')
    return result
  }
}