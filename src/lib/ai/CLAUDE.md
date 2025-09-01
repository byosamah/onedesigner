# AI System Architecture - CLAUDE.md

## Overview
OneDesigner's AI system (`/src/lib/ai/`) powers intelligent designer-client matching through advanced prompt engineering, multi-provider support, and sophisticated scoring algorithms. The system uses DeepSeek as the primary provider with configuration-driven customization.

## AI Architecture

### Provider System (`/providers/`)
**Purpose**: Multi-provider AI integration with failover capabilities

#### Supported Providers:
1. **DeepSeek** (Primary) - `deepseek-provider.ts`
2. **Google AI** (Backup) - `google-provider.ts`  
3. **OpenAI** (Future) - `openai-provider.ts`

#### Provider Interface:
```typescript
interface AIProvider {
  name: string
  generateMatch(brief: Brief, designer: Designer): Promise<MatchResult>
  generateBulkMatches(brief: Brief, designers: Designer[]): Promise<MatchResult[]>
  validateConnection(): Promise<boolean>
  getUsageStats(): Promise<UsageStats>
}

interface MatchResult {
  score: number                    // 50-85 range
  reasons: string[]               // 3 key reasoning points
  message: string                 // Personalized recommendation
  confidence: number              // AI confidence in match
  processingTime: number          // Response time in ms
  tokensUsed: number             // Token consumption
}
```

### DeepSeek Provider (`deepseek-provider.ts`)
**Primary AI provider for production matching**

#### Configuration:
```typescript
const DEEPSEEK_CONFIG = {
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  maxTokens: 1000,
  temperature: 0.3,              // Low for consistent scoring
  timeout: 30000,                // 30 second timeout
  retryAttempts: 3,
  retryDelay: 1000              // 1 second base delay
}
```

#### Implementation:
```typescript
export class DeepSeekProvider implements AIProvider {
  private apiKey: string
  private baseUrl: string
  private metrics: ProviderMetrics
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = DEEPSEEK_CONFIG.apiUrl
    this.metrics = new ProviderMetrics('deepseek')
  }
  
  async generateMatch(brief: Brief, designer: Designer): Promise<MatchResult> {
    const startTime = Date.now()
    
    try {
      const prompt = this.buildMatchingPrompt(brief, designer)
      
      const response = await this.makeRequest({
        model: DEEPSEEK_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: DEEPSEEK_CONFIG.maxTokens,
        temperature: DEEPSEEK_CONFIG.temperature,
        response_format: { type: 'json_object' }
      })
      
      const result = this.parseMatchResponse(response)
      result.processingTime = Date.now() - startTime
      
      this.metrics.recordSuccess(result.processingTime, result.tokensUsed)
      return result
      
    } catch (error) {
      this.metrics.recordError(error)
      throw new AIProviderError('DeepSeek matching failed', error)
    }
  }
  
  private buildMatchingPrompt(brief: Brief, designer: Designer): string {
    return `
MATCH ANALYSIS REQUEST

PROJECT BRIEF:
- Type: ${brief.project_type}
- Industry: ${brief.industry} 
- Budget: ${brief.budget}
- Timeline: ${brief.timeline}
- Style Preferences: ${brief.styles?.join(', ') || 'None specified'}
- Target Audience: ${brief.target_audience || 'Not specified'}
- Requirements: ${brief.requirements || 'Basic requirements'}
- Additional Context: ${brief.additional_notes || 'None'}

DESIGNER PROFILE:
- Name: ${designer.first_name} ${designer.last_name}
- Title: ${designer.professional_title}
- Experience Level: ${designer.years_experience}
- Primary Categories: ${designer.categories?.join(', ') || 'General'}
- Design Styles: ${designer.design_styles?.join(', ') || 'Versatile'}
- Industry Experience: ${designer.industries_worked?.join(', ') || 'Various'}
- Tools & Software: ${designer.tools?.join(', ') || 'Standard tools'}
- Portfolio URL: ${designer.portfolio_url || 'Not provided'}
- Availability: ${designer.availability_status || 'Available'}
- Rate Range: ${designer.rate_range || 'Not specified'}

SCORING INSTRUCTIONS:
Analyze the compatibility between this project brief and designer profile.
Consider these weighted factors:
- Category Alignment (25%): How well does the designer's expertise match the project type?
- Style Compatibility (20%): Do the designer's styles align with client preferences?
- Industry Experience (15%): Has the designer worked in this industry before?
- Portfolio Relevance (15%): How relevant is their past work to this project?
- Technical Skills (10%): Do they have the right tools and technical abilities?
- Timeline Fit (10%): Can they meet the project timeline?
- Budget Compatibility (5%): Does their rate align with the project budget?

SCORING SCALE:
- 85%+: Exceptional match - Perfect alignment across all major factors
- 75-84%: Excellent match - Strong alignment with minor gaps
- 65-74%: Very good match - Good fit with some considerations  
- 55-64%: Good match - Adequate fit with notable gaps
- 50-54%: Acceptable match - Basic compatibility
- <50%: Poor match - Not recommended (don't return)

Return ONLY valid JSON in this exact format:
{
  "score": number,
  "reasons": [
    "First key strength or compatibility point",
    "Second key strength or compatibility point", 
    "Third key strength or compatibility point"
  ],
  "message": "A personalized 2-3 sentence recommendation explaining why this designer would be a great fit for the project, written directly to the client"
}
`
  }
  
  private getSystemPrompt(): string {
    return `You are an expert design consultant and matching specialist for OneDesigner, a premium platform connecting clients with pre-vetted designers.

Your expertise includes:
- Deep understanding of design disciplines and specializations
- Knowledge of industry standards and best practices  
- Ability to assess designer-client compatibility
- Understanding of project requirements and constraints

Your personality is:
- Professional yet warm and approachable
- Confident in your assessments while being honest about limitations
- Focused on creating successful client-designer partnerships
- Optimistic but realistic in your evaluations

Your matching philosophy:
- Quality over quantity - better to be selective than to force poor matches
- Focus on strengths and compatibility rather than weaknesses
- Consider both hard skills and soft factors like communication style
- Always prioritize the client's project success

Response guidelines:
- Provide realistic scores (most matches fall between 55-80%)
- Give specific, actionable reasons for your score
- Write personalized messages that help clients understand the value
- Be honest about any concerns but focus on positive potential
- Use clear, jargon-free language that any client can understand`
  }
  
  private async makeRequest(payload: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  private parseMatchResponse(response: any): MatchResult {
    const content = response.choices[0].message.content
    const usage = response.usage
    
    try {
      const parsed = JSON.parse(content)
      
      return {
        score: this.validateScore(parsed.score),
        reasons: this.validateReasons(parsed.reasons),
        message: this.validateMessage(parsed.message),
        confidence: 0.95, // DeepSeek provides high-confidence results
        processingTime: 0, // Will be set by caller
        tokensUsed: usage.total_tokens || 0
      }
    } catch (error) {
      throw new Error('Invalid JSON response from DeepSeek')
    }
  }
  
  private validateScore(score: any): number {
    if (typeof score !== 'number' || score < 50 || score > 85) {
      throw new Error('Invalid score range')
    }
    return Math.round(score)
  }
  
  private validateReasons(reasons: any): string[] {
    if (!Array.isArray(reasons) || reasons.length !== 3) {
      throw new Error('Must provide exactly 3 reasons')
    }
    return reasons.map(r => String(r).trim()).filter(r => r.length > 0)
  }
  
  private validateMessage(message: any): string {
    if (typeof message !== 'string' || message.length < 20) {
      throw new Error('Message must be a meaningful string')
    }
    return message.trim()
  }
}
```

### Enhanced Matching System (`enhanced-matching.ts`)
**Core matching orchestration with 3-phase progressive enhancement**

#### Phase 1: Instant Matching (<50ms)
```typescript
export class EnhancedMatchingService {
  async findInstantMatch(briefId: string): Promise<InstantMatch | null> {
    // Uses pre-computed embeddings for ultra-fast similarity
    const brief = await DataService.getInstance().getBriefById(briefId)
    const embeddings = await this.getDesignerEmbeddings()
    
    // Vector similarity search
    const similarities = this.calculateEmbeddingSimilarities(brief, embeddings)
    const topMatch = similarities[0]
    
    if (topMatch.similarity > 0.7) { // High confidence threshold
      return {
        designerId: topMatch.designerId,
        score: Math.round(topMatch.similarity * 100),
        confidence: 'instant',
        processingTime: Date.now() - startTime
      }
    }
    
    return null // Proceed to Phase 2
  }
}
```

#### Phase 2: Refined Matching (~500ms)
```typescript
async findRefinedMatch(briefId: string): Promise<RefinedMatch[]> {
  // Quick AI analysis with reduced context
  const brief = await DataService.getInstance().getBriefById(briefId)
  const candidates = await this.getTopCandidates(brief, 5)
  
  const quickMatches = await Promise.all(
    candidates.map(designer => 
      this.generateQuickMatch(brief, designer)
    )
  )
  
  return quickMatches
    .filter(match => match.score >= 60)
    .sort((a, b) => b.score - a.score)
}

private async generateQuickMatch(brief: Brief, designer: Designer): Promise<RefinedMatch> {
  // Simplified prompt for faster processing
  const quickPrompt = this.buildQuickMatchPrompt(brief, designer)
  
  const response = await this.deepseek.generateMatch(quickPrompt, {
    maxTokens: 300, // Reduced for speed
    temperature: 0.1 // Very consistent
  })
  
  return {
    designerId: designer.id,
    score: response.score,
    quickReasons: response.reasons.slice(0, 2), // Top 2 reasons only
    confidence: 'refined',
    processingTime: response.processingTime
  }
}
```

#### Phase 3: Deep Analysis (~2s)
```typescript
async findDeepMatch(briefId: string, designerId: string): Promise<DeepMatch> {
  // Comprehensive AI analysis with full context
  const brief = await DataService.getInstance().getBriefById(briefId, { 
    includeClient: true 
  })
  const designer = await DataService.getInstance().getDesignerById(designerId, {
    includePortfolio: true
  })
  
  // Full prompt with all available context
  const deepPrompt = this.buildComprehensivePrompt(brief, designer)
  
  const response = await this.deepseek.generateMatch(brief, designer)
  
  // Store in cache for future reference
  await this.cacheMatchResult(briefId, designerId, response)
  
  return {
    designerId: designer.id,
    score: response.score,
    reasons: response.reasons, // Full 3 reasons
    message: response.message, // Personalized message
    confidence: 'deep',
    processingTime: response.processingTime,
    aiAnalysis: {
      categoryFit: this.analyzeCategoryFit(brief, designer),
      styleFit: this.analyzeStyleFit(brief, designer),
      experienceFit: this.analyzeExperienceFit(brief, designer),
      portfolioFit: this.analyzePortfolioFit(brief, designer)
    }
  }
}
```

### Embedding System (`embeddings.ts`)
**Pre-computed vector embeddings for instant matching**

#### Embedding Generation:
```typescript
export class EmbeddingService {
  private openai: OpenAI // Using OpenAI for embeddings
  
  async generateDesignerEmbedding(designer: Designer): Promise<number[]> {
    // Create comprehensive designer description
    const description = this.createDesignerDescription(designer)
    
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: description,
      encoding_format: 'float'
    })
    
    return response.data[0].embedding
  }
  
  async generateBriefEmbedding(brief: Brief): Promise<number[]> {
    const description = this.createBriefDescription(brief)
    
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small', 
      input: description,
      encoding_format: 'float'
    })
    
    return response.data[0].embedding
  }
  
  private createDesignerDescription(designer: Designer): string {
    return `
Designer Profile: ${designer.first_name} ${designer.last_name}
Professional Title: ${designer.professional_title}
Experience Level: ${designer.years_experience}
Specializations: ${designer.categories?.join(', ')}
Design Styles: ${designer.design_styles?.join(', ')}
Industries: ${designer.industries_worked?.join(', ')}
Tools: ${designer.tools?.join(', ')}
Skills: ${designer.skills?.join(', ')}
Rate: ${designer.rate_range}
Location: ${designer.location}
Bio: ${designer.bio}
    `.trim()
  }
  
  private createBriefDescription(brief: Brief): string {
    return `
Project Type: ${brief.project_type}
Industry: ${brief.industry}
Budget: ${brief.budget}
Timeline: ${brief.timeline}
Style Preferences: ${brief.styles?.join(', ')}
Target Audience: ${brief.target_audience}
Requirements: ${brief.requirements}
Additional Notes: ${brief.additional_notes}
    `.trim()
  }
  
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    // Cosine similarity calculation
    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0)
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0))
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0))
    
    return dotProduct / (magnitude1 * magnitude2)
  }
}
```

#### Cron Job Integration:
```typescript
// /api/cron/embeddings - Hourly embedding precomputation
export async function POST(req: NextRequest) {
  try {
    const embeddingService = new EmbeddingService()
    const dataService = DataService.getInstance()
    
    // Get all designers needing embedding updates
    const designers = await dataService.getDesignersNeedingEmbeddings()
    
    const results = await Promise.allSettled(
      designers.map(async (designer) => {
        const embedding = await embeddingService.generateDesignerEmbedding(designer)
        
        await dataService.rawQuery(
          'INSERT OR REPLACE INTO designer_embeddings (designer_id, embedding, updated_at) VALUES (?, ?, NOW())',
          [designer.id, JSON.stringify(embedding)]
        )
        
        return { designerId: designer.id, success: true }
      })
    )
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    return apiResponse.success({
      processed: designers.length,
      successful,
      failed,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    logger.error('Embedding cron job failed', error)
    return apiResponse.error('Embedding generation failed')
  }
}
```

## AI Response Processing

### Response Validation:
```typescript
export class MatchResponseValidator {
  static validate(response: any): ValidationResult {
    const errors: string[] = []
    
    // Score validation
    if (!response.score || typeof response.score !== 'number') {
      errors.push('Score must be a number')
    } else if (response.score < 50 || response.score > 85) {
      errors.push('Score must be between 50-85')
    }
    
    // Reasons validation
    if (!Array.isArray(response.reasons)) {
      errors.push('Reasons must be an array')
    } else if (response.reasons.length !== 3) {
      errors.push('Must provide exactly 3 reasons')
    } else if (response.reasons.some(r => typeof r !== 'string' || r.length < 10)) {
      errors.push('Each reason must be a meaningful string (10+ characters)')
    }
    
    // Message validation
    if (!response.message || typeof response.message !== 'string') {
      errors.push('Message must be a string')
    } else if (response.message.length < 20 || response.message.length > 200) {
      errors.push('Message must be 20-200 characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? response : null
    }
  }
  
  static sanitizeResponse(response: any): MatchResult {
    return {
      score: Math.round(Math.max(50, Math.min(85, response.score))),
      reasons: response.reasons.slice(0, 3).map(r => String(r).trim()),
      message: String(response.message).trim().substring(0, 200),
      confidence: 0.9,
      processingTime: 0,
      tokensUsed: 0
    }
  }
}
```

### Fallback & Error Handling:
```typescript
export class MatchingFallbackSystem {
  private providers: AIProvider[]
  
  constructor() {
    this.providers = [
      new DeepSeekProvider(process.env.DEEPSEEK_API_KEY),
      new GoogleAIProvider(process.env.GOOGLE_AI_KEY)
    ]
  }
  
  async generateMatchWithFallback(brief: Brief, designer: Designer): Promise<MatchResult> {
    let lastError: Error | null = null
    
    for (const provider of this.providers) {
      try {
        const result = await provider.generateMatch(brief, designer)
        
        // Validate response quality
        const validation = MatchResponseValidator.validate(result)
        if (validation.isValid) {
          return validation.sanitized
        }
        
        logger.warn(`Invalid response from ${provider.name}`, validation.errors)
        continue
        
      } catch (error) {
        logger.error(`Provider ${provider.name} failed`, error)
        lastError = error
        continue
      }
    }
    
    // All providers failed, return fallback match
    logger.error('All AI providers failed, using fallback', lastError)
    return this.generateFallbackMatch(brief, designer)
  }
  
  private generateFallbackMatch(brief: Brief, designer: Designer): MatchResult {
    // Rule-based fallback matching
    const categoryMatch = this.calculateCategoryMatch(brief, designer)
    const experienceMatch = this.calculateExperienceMatch(brief, designer)
    
    const fallbackScore = Math.round((categoryMatch + experienceMatch) / 2 * 100)
    
    return {
      score: Math.max(50, Math.min(75, fallbackScore)),
      reasons: [
        `Designer specializes in ${designer.categories?.join(', ')}`,
        `${designer.years_experience} of professional experience`,
        `Available for ${brief.timeline} timeline projects`
      ],
      message: `${designer.first_name} appears to be a good match for your ${brief.project_type} project based on their experience and specialization.`,
      confidence: 0.6, // Lower confidence for rule-based matching
      processingTime: 0,
      tokensUsed: 0
    }
  }
}
```

## Performance & Caching

### Match Result Caching:
```typescript
export class MatchCacheService {
  async getCachedMatch(briefId: string, designerId: string): Promise<CachedMatch | null> {
    const result = await DataService.getInstance().rawQuery(
      `SELECT * FROM match_cache 
       WHERE brief_id = ? AND designer_id = ? 
       AND expires_at > NOW()`,
      [briefId, designerId]
    )
    
    return result[0] || null
  }
  
  async cacheMatch(briefId: string, designerId: string, match: MatchResult): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour cache
    
    await DataService.getInstance().rawQuery(
      `INSERT OR REPLACE INTO match_cache 
       (brief_id, designer_id, score, reasons, message, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        briefId,
        designerId, 
        match.score,
        JSON.stringify(match.reasons),
        match.message,
        expiresAt.toISOString()
      ]
    )
  }
  
  async invalidateCache(designerId: string): Promise<void> {
    // Invalidate when designer profile changes
    await DataService.getInstance().rawQuery(
      'DELETE FROM match_cache WHERE designer_id = ?',
      [designerId]
    )
  }
}
```

### Performance Monitoring:
```typescript
export class AIPerformanceMonitor {
  private metrics: Map<string, ProviderMetrics> = new Map()
  
  recordMatch(provider: string, duration: number, tokensUsed: number, success: boolean): void {
    if (!this.metrics.has(provider)) {
      this.metrics.set(provider, new ProviderMetrics(provider))
    }
    
    const metric = this.metrics.get(provider)!
    if (success) {
      metric.recordSuccess(duration, tokensUsed)
    } else {
      metric.recordError()
    }
  }
  
  getPerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      providers: {},
      overall: {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        tokensConsumed: 0
      }
    }
    
    for (const [provider, metrics] of this.metrics) {
      report.providers[provider] = {
        requests: metrics.totalRequests,
        successRate: metrics.successRate,
        averageResponseTime: metrics.averageResponseTime,
        tokensUsed: metrics.totalTokens,
        lastError: metrics.lastError
      }
      
      report.overall.totalRequests += metrics.totalRequests
    }
    
    return report
  }
}
```

This AI system provides OneDesigner with sophisticated, reliable designer matching capabilities through multi-phase processing, robust error handling, and comprehensive performance monitoring.