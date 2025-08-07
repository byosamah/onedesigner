import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface CachedScore {
  designer: any
  score: number
  breakdown?: any
  phase: 'instant' | 'refined' | 'final'
  timestamp: number
  aiScore?: number
  explanation?: string
  strengths?: string[]
}

export class MatchingCache {
  private memoryCache: Map<string, CachedScore> = new Map()
  private supabase: any
  private maxMemoryCacheSize = 500
  
  constructor() {
    this.supabase = createServiceClient()
  }
  
  /**
   * Get cached match score
   */
  async get(brief: any, designerId: string): Promise<CachedScore | null> {
    const key = this.generateCacheKey(brief, designerId)
    
    // Check memory cache first (fastest)
    const memCached = this.memoryCache.get(key)
    if (memCached && this.isValid(memCached)) {
      return memCached
    }
    
    // Check database cache
    try {
      const { data } = await this.supabase
        .from('match_cache')
        .select('*')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (data) {
        const cached: CachedScore = {
          designer: { id: data.designer_id },
          score: data.score,
          phase: data.ai_analysis?.phase || 'instant',
          timestamp: new Date(data.created_at).getTime(),
          ...data.ai_analysis
        }
        
        // Add to memory cache
        this.setMemoryCache(key, cached)
        
        return cached
      }
    } catch (error) {
      // Cache miss is not an error
    }
    
    return null
  }
  
  /**
   * Set cache entry
   */
  async set(
    brief: any, 
    designerId: string, 
    score: CachedScore | any, 
    phase: 'instant' | 'refined' | 'final',
    ttlSeconds: number = 3600
  ): Promise<void> {
    const key = this.generateCacheKey(brief, designerId)
    const briefHash = this.generateBriefHash(brief)
    
    // Ensure score object has required fields
    const cacheData: CachedScore = {
      ...score,
      phase,
      timestamp: Date.now()
    }
    
    // Set in memory cache
    this.setMemoryCache(key, cacheData)
    
    // Set in database cache
    try {
      await this.supabase
        .from('match_cache')
        .upsert({
          cache_key: key,
          designer_id: designerId,
          brief_hash: briefHash,
          score: cacheData.score,
          ai_analysis: {
            phase,
            breakdown: cacheData.breakdown,
            aiScore: cacheData.aiScore,
            explanation: cacheData.explanation,
            strengths: cacheData.strengths
          },
          expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to cache match result:', error)
      // Don't throw - caching failures shouldn't break matching
    }
  }
  
  /**
   * Generate deterministic cache key
   */
  private generateCacheKey(brief: any, designerId: string): string {
    const briefKey = this.generateBriefHash(brief)
    return `match:${briefKey}:${designerId}`
  }
  
  /**
   * Generate hash of brief essentials
   */
  private generateBriefHash(brief: any): string {
    // Only hash the essential fields that affect matching
    const essentials = {
      styles: (brief.styles || []).sort(),
      industry: brief.industry,
      project_type: brief.project_type,
      // Round budget to nearest $1000 to increase cache hits
      budget: brief.budget ? Math.floor(this.parseBudget(brief.budget) / 1000) : 0,
      timeline: brief.timeline
    }
    
    return crypto
      .createHash('md5')
      .update(JSON.stringify(essentials))
      .digest('hex')
      .substring(0, 16) // Shorter hash for efficiency
  }
  
  /**
   * Parse budget string to number
   */
  private parseBudget(budget: string): number {
    const match = budget.match(/\d+/)
    return match ? parseInt(match[0]) : 0
  }
  
  /**
   * Check if cache entry is still valid
   */
  private isValid(cached: CachedScore): boolean {
    const age = Date.now() - cached.timestamp
    
    // Different TTLs for different phases
    const maxAge = {
      instant: 3600 * 1000,    // 1 hour
      refined: 7200 * 1000,    // 2 hours
      final: 14400 * 1000      // 4 hours
    }[cached.phase] || 3600 * 1000
    
    return age < maxAge
  }
  
  /**
   * Set memory cache with LRU eviction
   */
  private setMemoryCache(key: string, value: CachedScore): void {
    // Simple LRU: remove oldest entries if cache is full
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }
    
    this.memoryCache.set(key, value)
  }
  
  /**
   * Clear expired cache entries (maintenance task)
   */
  async clearExpired(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('match_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id')
      
      if (error) throw error
      
      // Also clear memory cache
      for (const [key, value] of this.memoryCache.entries()) {
        if (!this.isValid(value)) {
          this.memoryCache.delete(key)
        }
      }
      
      return data?.length || 0
    } catch (error) {
      console.error('Failed to clear expired cache:', error)
      return 0
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    memoryCacheSize: number
    hitRate: number
    avgAge: number
  } {
    const ages: number[] = []
    let now = Date.now()
    
    for (const value of this.memoryCache.values()) {
      ages.push(now - value.timestamp)
    }
    
    return {
      memoryCacheSize: this.memoryCache.size,
      hitRate: 0, // Would need to track hits/misses
      avgAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0
    }
  }
}