// AI Configuration and Rate Limits
export const AI_CONFIG = {
  provider: 'deepseek',
  model: 'deepseek-chat',
  rateLimit: 60, // requests per minute
  matching: {
    maxDesignersToAnalyze: 10,
    delayBetweenRequests: 1000, // 1 second between requests
    maxRetries: 2,
    cacheExpiry: 3600000 // 1 hour in milliseconds
  }
}

// Request queue to manage rate limiting
class RequestQueue {
  private queue: Array<{
    fn: () => Promise<any>,
    resolve: (value: any) => void,
    reject: (error: any) => void
  }> = []
  private processing = false
  private lastRequestTime = 0
  private requestCount = 0
  private resetTime = Date.now()

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
      this.process()
    })
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    
    // Reset counter every minute
    if (Date.now() - this.resetTime > 60000) {
      this.requestCount = 0
      this.resetTime = Date.now()
    }
    
    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift()!
      
      // Check rate limit
      if (this.requestCount >= AI_CONFIG.rateLimit) {
        const waitTime = 60000 - (Date.now() - this.resetTime)
        if (waitTime > 0) {
          await new Promise(r => setTimeout(r, waitTime))
          this.requestCount = 0
          this.resetTime = Date.now()
        }
      }
      
      // Ensure minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime
      if (timeSinceLastRequest < AI_CONFIG.matching.delayBetweenRequests) {
        await new Promise(r => setTimeout(r, AI_CONFIG.matching.delayBetweenRequests - timeSinceLastRequest))
      }
      
      try {
        this.requestCount++
        this.lastRequestTime = Date.now()
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    
    this.processing = false
  }
}

export const aiRequestQueue = new RequestQueue()

// Cache for match results
export class MatchCache {
  private cache = new Map<string, { result: any, timestamp: number }>()
  
  getCacheKey(designerId: string, briefId: string): string {
    return `${designerId}-${briefId}`
  }
  
  get(designerId: string, briefId: string): any | null {
    const key = this.getCacheKey(designerId, briefId)
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    // Check if cache expired
    if (Date.now() - cached.timestamp > AI_CONFIG.matching.cacheExpiry) {
      this.cache.delete(key)
      return null
    }
    
    return cached.result
  }
  
  set(designerId: string, briefId: string, result: any): void {
    const key = this.getCacheKey(designerId, briefId)
    this.cache.set(key, { result, timestamp: Date.now() })
  }
  
  clear(): void {
    this.cache.clear()
  }
}

export const matchCache = new MatchCache()