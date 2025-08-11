import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { logger } from '@/lib/core/logging-service'

export class EmbeddingService {
  private embeddings: Map<string, number[]> = new Map()
  private supabase: any
  
  constructor() {
    this.supabase = createServiceClient()
  }
  
  /**
   * Calculate embedding-based similarity score
   */
  async calculateEmbeddingScore(designerId: string, brief: any): Promise<number> {
    try {
      // Get or generate embeddings
      const [designerEmb, briefEmb] = await Promise.all([
        this.getDesignerEmbedding(designerId),
        this.getBriefEmbedding(brief)
      ])
      
      if (!designerEmb || !briefEmb) {
        return 50 // Default middle score if embeddings unavailable
      }
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(designerEmb, briefEmb)
      
      // Convert to 0-100 scale
      return Math.round(similarity * 100)
    } catch (error) {
      logger.error('Embedding calculation error:', error)
      return 50 // Fallback score
    }
  }
  
  /**
   * Get or generate designer embedding
   */
  private async getDesignerEmbedding(designerId: string): Promise<number[] | null> {
    // Check memory cache first
    if (this.embeddings.has(designerId)) {
      return this.embeddings.get(designerId)!
    }
    
    // Check database
    const { data, error } = await this.supabase
      .from('designer_embeddings')
      .select('embedding')
      .eq('designer_id', designerId)
      .single()
    
    if (data?.embedding) {
      this.embeddings.set(designerId, data.embedding)
      return data.embedding
    }
    
    // Generate embedding if not found (this would normally call an embedding API)
    // For now, return a mock embedding based on designer data
    const designer = await this.getDesignerData(designerId)
    if (designer) {
      const embedding = await this.generateEmbedding(designer)
      
      // Store in database for future use
      await this.supabase
        .from('designer_embeddings')
        .upsert({
          designer_id: designerId,
          embedding,
          metadata_hash: this.hashDesignerData(designer),
          updated_at: new Date().toISOString()
        })
      
      this.embeddings.set(designerId, embedding)
      return embedding
    }
    
    return null
  }
  
  /**
   * Generate embedding for brief
   */
  private async getBriefEmbedding(brief: any): Promise<number[] | null> {
    // Create a text representation of the brief
    const briefText = `
      ${brief.project_type} project
      ${brief.industry} industry
      ${brief.styles?.join(' ')} styles
      ${brief.requirements || ''}
      ${brief.target_audience || ''}
      ${brief.brand_personality || ''}
    `.trim()
    
    // Generate embedding (mock for now)
    return this.generateMockEmbedding(briefText)
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
  
  /**
   * Generate embedding from designer data
   */
  private async generateEmbedding(designer: any): Promise<number[]> {
    const text = `
      ${designer.styles?.join(' ') || ''} 
      ${designer.industries?.join(' ') || ''} 
      ${designer.specializations?.join(' ') || ''} 
      ${designer.design_philosophy || ''}
      ${designer.portfolio_keywords?.join(' ') || ''}
    `.trim()
    
    // In production, this would call an embedding API like OpenAI's text-embedding-ada-002
    // For now, return a mock embedding
    return this.generateMockEmbedding(text)
  }
  
  /**
   * Generate mock embedding for testing
   */
  private generateMockEmbedding(text: string): number[] {
    // Create a deterministic mock embedding based on text content
    const hash = crypto.createHash('sha256').update(text).digest()
    const embedding = new Array(512).fill(0)
    
    // Use hash bytes to create embedding values
    for (let i = 0; i < Math.min(hash.length, embedding.length); i++) {
      embedding[i] = (hash[i] - 128) / 128 // Normalize to [-1, 1]
    }
    
    // Add some variation based on text features
    const words = text.toLowerCase().split(/\s+/)
    const styleWords = ['modern', 'minimal', 'bold', 'classic', 'creative']
    const industryWords = ['tech', 'finance', 'health', 'retail', 'media']
    
    styleWords.forEach((word, idx) => {
      if (words.includes(word)) {
        embedding[100 + idx] = 0.8
      }
    })
    
    industryWords.forEach((word, idx) => {
      if (words.includes(word)) {
        embedding[200 + idx] = 0.8
      }
    })
    
    return embedding
  }
  
  /**
   * Get designer data for embedding generation
   */
  private async getDesignerData(designerId: string): Promise<any> {
    const { data } = await this.supabase
      .from('designers')
      .select('*')
      .eq('id', designerId)
      .single()
    
    return data
  }
  
  /**
   * Hash designer data to track changes
   */
  private hashDesignerData(designer: any): string {
    const relevant = {
      styles: designer.styles,
      industries: designer.industries,
      specializations: designer.specializations,
      design_philosophy: designer.design_philosophy,
      portfolio_keywords: designer.portfolio_keywords
    }
    
    return crypto
      .createHash('md5')
      .update(JSON.stringify(relevant))
      .digest('hex')
  }
  
  /**
   * Precompute embeddings for all designers (background job)
   */
  async precomputeDesignerEmbeddings(): Promise<void> {
    logger.info('Starting designer embeddings precomputation...')
    
    const { data: designers } = await this.supabase
      .from('designers')
      .select('*')
      .eq('is_approved', true)
      .eq('is_verified', true)
    
    if (!designers) return
    
    let updated = 0
    for (const designer of designers) {
      try {
        // Check if embedding needs update
        const { data: existing } = await this.supabase
          .from('designer_embeddings')
          .select('metadata_hash')
          .eq('designer_id', designer.id)
          .single()
        
        const currentHash = this.hashDesignerData(designer)
        
        if (!existing || existing.metadata_hash !== currentHash) {
          const embedding = await this.generateEmbedding(designer)
          
          await this.supabase
            .from('designer_embeddings')
            .upsert({
              designer_id: designer.id,
              embedding,
              metadata_hash: currentHash,
              updated_at: new Date().toISOString()
            })
          
          updated++
        }
      } catch (error) {
        logger.error(`Failed to compute embedding for designer ${designer.id}:`, error)
      }
    }
    
    logger.info(`Embeddings precomputation complete. Updated ${updated} embeddings.`)
  }
}