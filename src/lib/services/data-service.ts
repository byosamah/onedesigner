import { createServiceClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/core/logging-service'
import { emailService } from '@/lib/core/email-service'
import { createUnlockNotificationEmail } from '@/lib/email/templates/unlock-notification'

// Custom error types for better error handling
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super('Insufficient credits')
    this.name = 'InsufficientCreditsError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Types for better type safety
export interface Client {
  id: string
  email: string
  match_credits: number
  created_at?: string
  updated_at?: string
}

export interface Designer {
  id: string
  email: string
  first_name: string
  last_name: string
  is_approved: boolean
  is_verified: boolean
  created_at?: string
  updated_at?: string
}

export interface Match {
  id: string
  client_id?: string
  designer_id: string
  brief_id?: string
  status: 'pending' | 'unlocked' | 'accepted' | 'rejected' | 'expired'
  score: number
  reasons: string[]
  created_at?: string
  updated_at?: string
}

export interface Brief {
  id: string
  client_id: string
  project_type: string
  industry: string
  styles: string[]
  created_at?: string
  updated_at?: string
}

// Transaction callback type
type TransactionCallback<T> = (tx: SupabaseClient) => Promise<T>

// Query options for flexibility
export interface QueryOptions {
  page?: number
  limit?: number
  orderBy?: string
  ascending?: boolean
  filters?: Record<string, any>
}

/**
 * Centralized Data Service with singleton pattern
 * Handles all database operations with built-in error handling and optimization
 */
export class DataService {
  private static instance: DataService
  private supabase: SupabaseClient
  private queryCache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL: number

  private constructor() {
    this.supabase = createServiceClient()
    
    // Use ConfigManager for cache TTL if available
    try {
      const { getOneDesignerConfig } = require('@/lib/config/init')
      this.cacheTTL = getOneDesignerConfig('cache.ttl', 300000) // 5 minutes default
    } catch {
      // Fallback to environment or default
      this.cacheTTL = parseInt(process.env.CACHE_TTL || '300000')
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DataService {
    if (!this.instance) {
      this.instance = new DataService()
    }
    return this.instance
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.queryCache.clear()
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl
  }

  // ==================== CLIENT OPERATIONS ====================

  /**
   * Get client with credits information
   */
  async getClientWithCredits(clientId: string): Promise<Client> {
    const cacheKey = `client:${clientId}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const { data, error } = await this.supabase
      .from('clients')
      .select('id, email, match_credits, created_at, updated_at')
      .eq('id', clientId)
      .single()

    if (error) throw new DatabaseError('Failed to fetch client', error)
    if (!data) throw new NotFoundError('Client')

    this.setCachedData(cacheKey, data)
    return data as Client
  }

  /**
   * Get client by email
   */
  async getClientByEmail(email: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('id, email, match_credits, created_at, updated_at')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError('Failed to fetch client by email', error)
    }

    return data as Client | null
  }

  /**
   * Deduct credit from client (with transaction support)
   */
  async deductCredit(clientId: string, matchId: string): Promise<void> {
    // Get current client data with SELECT FOR UPDATE to prevent race conditions
    const { data: client, error: selectError } = await this.supabase
      .from('clients')
      .select('id, match_credits')
      .eq('id', clientId)
      .single()

    if (selectError || !client) {
      throw new DatabaseError('Failed to get client data', selectError)
    }

    if (client.match_credits < 1) {
      throw new InsufficientCreditsError()
    }

    // Perform atomic credit deduction
    const { data: updateResult, error: creditError } = await this.supabase
      .from('clients')
      .update({ match_credits: client.match_credits - 1 })
      .eq('id', clientId)
      .eq('match_credits', client.match_credits) // Optimistic locking
      .select('match_credits')

    if (creditError || !updateResult || updateResult.length === 0) {
      // Either error occurred or no rows updated (credits changed between select and update)
      throw new InsufficientCreditsError('Credits were modified by another operation')
    }

    // Update match status (this happens after successful credit deduction)
    const { error: matchError } = await this.supabase
      .from('matches')
      .update({ status: 'unlocked' })
      .eq('id', matchId)

    if (matchError) {
      // Rollback credit deduction - add back the credit
      await this.supabase
        .from('clients')
        .update({ match_credits: client.match_credits })
        .eq('id', clientId)

      throw new DatabaseError('Failed to unlock match', matchError)
    }

    // Clear cache for this client
    this.queryCache.delete(`client:${clientId}`)
  }

  /**
   * Add credits to client - CENTRALIZED METHOD
   * Always use this method instead of direct database updates
   */
  async addCredits(clientId: string, credits: number): Promise<Client> {
    const client = await this.getClientWithCredits(clientId)
    
    const newCredits = (client.match_credits || 0) + credits
    const { data, error } = await this.supabase
      .from('clients')
      .update({ match_credits: newCredits })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to add credits', error)
    }

    // Clear cache
    this.queryCache.delete(`client:${clientId}`)
    
    logger.info(`✅ Credits added: Client ${clientId} now has ${newCredits} credits (added ${credits})`)
    return data as Client
  }

  /**
   * Deduct credits from client - CENTRALIZED METHOD
   * Always use this method instead of direct database updates
   */
  async deductCredits(clientId: string, credits: number): Promise<Client> {
    const client = await this.getClientWithCredits(clientId)
    
    if (client.match_credits < credits) {
      throw new Error(`Insufficient credits. Has ${client.match_credits}, needs ${credits}`)
    }
    
    const newCredits = client.match_credits - credits
    const { data, error } = await this.supabase
      .from('clients')
      .update({ match_credits: newCredits })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to deduct credits', error)
    }

    // Clear cache
    this.queryCache.delete(`client:${clientId}`)
    
    logger.info(`✅ Credits deducted: Client ${clientId} now has ${newCredits} credits (deducted ${credits})`)
    return data as Client
  }

  // ==================== DESIGNER OPERATIONS ====================

  /**
   * Get designer by ID
   */
  async getDesigner(designerId: string): Promise<Designer> {
    const cacheKey = `designer:${designerId}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const { data, error } = await this.supabase
      .from('designers')
      .select('*')
      .eq('id', designerId)
      .single()

    if (error) throw new DatabaseError('Failed to fetch designer', error)
    if (!data) throw new NotFoundError('Designer')

    this.setCachedData(cacheKey, data)
    return data as Designer
  }

  /**
   * Get designer by email
   */
  async getDesignerByEmail(email: string): Promise<Designer | null> {
    const { data, error } = await this.supabase
      .from('designers')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError('Failed to fetch designer by email', error)
    }

    return data as Designer | null
  }

  /**
   * Get approved designers
   */
  async getApprovedDesigners(options?: QueryOptions): Promise<Designer[]> {
    let query = this.supabase
      .from('designers')
      .select('*')
      .eq('is_approved', true)

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true })
    }

    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('Failed to fetch approved designers', error)
    }

    return data as Designer[]
  }

  // ==================== MATCH OPERATIONS ====================

  /**
   * Get match by ID with full details
   */
  async getMatchWithDetails(matchId: string): Promise<Match & { designer?: Designer; brief?: Brief }> {
    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        designer:designers(*),
        brief:briefs(*)
      `)
      .eq('id', matchId)
      .single()

    if (error) throw new DatabaseError('Failed to fetch match', error)
    if (!data) throw new NotFoundError('Match')

    return data as Match & { designer?: Designer; brief?: Brief }
  }

  /**
   * Get client matches
   */
  async getClientMatches(clientId: string, options?: QueryOptions): Promise<Match[]> {
    let query = this.supabase
      .from('matches')
      .select(`
        *,
        designer:designers(*)
      `)
      .eq('client_id', clientId)

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false })
    }

    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('Failed to fetch client matches', error)
    }

    return data as Match[]
  }

  /**
   * Check if match belongs to client
   */
  async isMatchAuthorized(matchId: string, clientId: string): Promise<boolean> {
    const { data: match } = await this.supabase
      .from('matches')
      .select('id, client_id, brief_id')
      .eq('id', matchId)
      .single()

    if (!match) return false

    // Direct client_id match
    if (match.client_id === clientId) return true

    // Check via brief ownership
    if (match.brief_id) {
      const { data: brief } = await this.supabase
        .from('briefs')
        .select('client_id')
        .eq('id', match.brief_id)
        .single()

      if (brief && brief.client_id === clientId) return true
    }

    return false
  }

  /**
   * Unlock match with proper transaction handling
   */
  async unlockMatch(matchId: string, clientId: string): Promise<{ success: boolean; remainingCredits: number; alreadyUnlocked?: boolean }> {
    // Check authorization
    const isAuthorized = await this.isMatchAuthorized(matchId, clientId)
    if (!isAuthorized) {
      throw new ValidationError('You are not authorized to unlock this match')
    }

    // Get match details
    const match = await this.getMatchWithDetails(matchId)
    
    // Check if already unlocked
    if (match.status === 'unlocked' || match.status === 'accepted') {
      const client = await this.getClientWithCredits(clientId)
      return {
        success: true,
        remainingCredits: client.match_credits,
        alreadyUnlocked: true
      }
    }

    // Check if match is available
    if (match.status !== 'pending') {
      throw new ValidationError('Match unavailable')
    }

    // Get client and check credits
    const client = await this.getClientWithCredits(clientId)
    if (client.match_credits < 1) {
      throw new InsufficientCreditsError()
    }

    // Perform the unlock operation
    await this.deductCredit(clientId, matchId)

    // Record the unlock
    await this.supabase
      .from('client_designers')
      .insert({
        match_id: matchId,
        client_id: clientId,
        designer_id: match.designer_id,
        amount: 0,
        unlocked_at: new Date().toISOString()
      })

    // Track unlocked designer
    await this.trackUnlockedDesigner(clientId, match.designer_id)

    // Send unlock notification email to designer
    try {
      // Get designer details
      const designer = await this.getDesigner(match.designer_id)
      
      // Get brief details for the email
      const { data: brief } = await this.supabase
        .from('briefs')
        .select('project_type, industry, timeline, budget')
        .eq('id', match.brief_id)
        .single()
      
      if (designer?.email) {
        const emailHtml = createUnlockNotificationEmail({
          designerName: designer.first_name || 'Designer',
          projectType: brief?.project_type,
          industry: brief?.industry,
          timeline: brief?.timeline,
          budget: brief?.budget,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/designer/dashboard`
        })
        
        await emailService.sendEmail({
          to: designer.email,
          subject: '🔓 A Client Has Unlocked Your Profile!',
          html: emailHtml
        })
        
        logger.info('Unlock notification email sent to designer:', designer.id)
      }
    } catch (error) {
      logger.error('Failed to send unlock notification email:', error)
      // Don't fail the unlock operation if email fails
    }

    return {
      success: true,
      remainingCredits: client.match_credits - 1
    }
  }

  // ==================== BRIEF OPERATIONS ====================

  /**
   * Get brief by ID
   */
  async getBrief(briefId: string): Promise<Brief> {
    const { data, error } = await this.supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single()

    if (error) throw new DatabaseError('Failed to fetch brief', error)
    if (!data) throw new NotFoundError('Brief')

    return data as Brief
  }

  // ==================== HELPER METHODS ====================

  /**
   * Track unlocked designer to prevent future matches
   */
  private async trackUnlockedDesigner(clientId: string, designerId: string): Promise<void> {
    // Check if already tracked
    const { data: existing } = await this.supabase
      .from('client_designers')
      .select('id')
      .eq('client_id', clientId)
      .eq('designer_id', designerId)
      .single()

    if (!existing) {
      const { error } = await this.supabase
        .from('client_designers')
        .insert({
          client_id: clientId,
          designer_id: designerId,
          unlocked_at: new Date().toISOString()
        })

      if (error) {
        logger.error('Error tracking unlocked designer:', error)
      }
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData(key: string): any | null {
    const cached = this.queryCache.get(key)
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > this.cacheTTL
      if (!isExpired) {
        return cached.data
      }
      this.queryCache.delete(key)
    }
    return null
  }

  /**
   * Set cached data
   */
  private setCachedData(key: string, data: any): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Transaction wrapper (simplified version for now)
   * In production, this would use proper database transactions
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    // For now, we'll just execute the callback
    // In a real implementation, this would:
    // 1. Begin transaction
    // 2. Execute callback
    // 3. Commit on success
    // 4. Rollback on failure
    try {
      return await callback(this.supabase)
    } catch (error) {
      logger.error('Transaction failed:', error)
      throw error
    }
  }

  /**
   * Execute raw query (for complex operations)
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const { data, error } = await this.supabase.rpc('exec_sql', {
      query: sql,
      params: params || []
    })

    if (error) {
      throw new DatabaseError('Query execution failed', error)
    }

    return data as T[]
  }

  /**
   * Get multiple records by IDs (batch operation)
   */
  async batchGet<T>(table: string, ids: string[]): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .in('id', ids)

    if (error) {
      throw new DatabaseError(`Failed to batch get from ${table}`, error)
    }

    return data as T[]
  }
}