import { DataService, Client, Match, Brief, ValidationError, DatabaseError } from './data-service'
import { logger } from '@/lib/core/logging-service'

export interface ClientStats {
  totalMatches: number
  unlockedMatches: number
  availableCredits: number
  totalSpent: number
}

export interface CreateBriefData {
  client_id: string
  project_type: string
  industry: string
  styles: string[]
  budget?: string
  timeline?: string
  description?: string
  [key: string]: any // For additional fields
}

/**
 * Client-specific data service
 * Extends DataService with client-focused operations
 */
export class ClientDataService extends DataService {
  private static clientInstance: ClientDataService

  static getInstance(): ClientDataService {
    if (!this.clientInstance) {
      this.clientInstance = new ClientDataService()
    }
    return this.clientInstance
  }

  /**
   * Create a new client
   */
  async createClient(email: string): Promise<Client> {
    // Check if client already exists
    const existing = await this.getClientByEmail(email)
    if (existing) {
      return existing
    }

    const { data, error } = await this['supabase']
      .from('clients')
      .insert({
        email,
        match_credits: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to create client', error)
    }

    return data as Client
  }

  /**
   * Get client statistics
   */
  async getClientStats(clientId: string): Promise<ClientStats> {
    const client = await this.getClientWithCredits(clientId)
    
    // Get match counts
    const { data: matches, error: matchError } = await this['supabase']
      .from('matches')
      .select('status')
      .eq('client_id', clientId)

    if (matchError) {
      throw new DatabaseError('Failed to fetch client matches', matchError)
    }

    const unlockedMatches = matches?.filter(m => 
      m.status === 'unlocked' || m.status === 'accepted'
    ).length || 0

    // Get total spent (from match_unlocks)
    const { data: unlocks, error: unlockError } = await this['supabase']
      .from('match_unlocks')
      .select('amount')
      .eq('client_id', clientId)

    if (unlockError) {
      throw new DatabaseError('Failed to fetch unlock history', unlockError)
    }

    const totalSpent = unlocks?.reduce((sum, u) => sum + (u.amount || 0), 0) || 0

    return {
      totalMatches: matches?.length || 0,
      unlockedMatches,
      availableCredits: client.match_credits,
      totalSpent
    }
  }

  /**
   * Get client's unlocked designers
   */
  async getUnlockedDesigners(clientId: string): Promise<string[]> {
    const { data, error } = await this['supabase']
      .from('client_designers')
      .select('designer_id')
      .eq('client_id', clientId)

    if (error) {
      throw new DatabaseError('Failed to fetch unlocked designers', error)
    }

    return data?.map(d => d.designer_id) || []
  }

  /**
   * Create a new brief for client
   */
  async createBrief(briefData: CreateBriefData): Promise<Brief> {
    // Validate required fields
    if (!briefData.client_id || !briefData.project_type || !briefData.industry) {
      throw new ValidationError('Missing required brief fields')
    }

    const { data, error } = await this['supabase']
      .from('briefs')
      .insert({
        ...briefData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to create brief', error)
    }

    return data as Brief
  }

  /**
   * Get client's briefs
   */
  async getClientBriefs(clientId: string): Promise<Brief[]> {
    const { data, error } = await this['supabase']
      .from('briefs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError('Failed to fetch client briefs', error)
    }

    return data as Brief[]
  }

  /**
   * Get available matches for client (not yet unlocked)
   */
  async getAvailableMatches(clientId: string): Promise<Match[]> {
    // Get unlocked designer IDs
    const unlockedDesignerIds = await this.getUnlockedDesigners(clientId)

    let query = this['supabase']
      .from('matches')
      .select(`
        *,
        designer:designers(*)
      `)
      .eq('client_id', clientId)
      .eq('status', 'pending')

    // Exclude already unlocked designers
    if (unlockedDesignerIds.length > 0) {
      query = query.not('designer_id', 'in', `(${unlockedDesignerIds.join(',')})`)
    }

    const { data, error } = await query
      .order('score', { ascending: false })

    if (error) {
      throw new DatabaseError('Failed to fetch available matches', error)
    }

    return data as Match[]
  }

  /**
   * Check if client can afford a package
   */
  canAffordPackage(client: Client, packagePrice: number): boolean {
    // This could be extended to check payment methods, etc.
    return true // For now, always return true as we're using external payment
  }

  /**
   * Get client's conversation count
   */
  async getConversationCount(clientId: string): Promise<number> {
    const { count, error } = await this['supabase']
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    if (error) {
      throw new DatabaseError('Failed to count conversations', error)
    }

    return count || 0
  }

  /**
   * Purchase credits for client (after successful payment)
   */
  async purchaseCredits(
    clientId: string, 
    credits: number, 
    paymentDetails: {
      orderId: string
      amount: number
      currency: string
    }
  ): Promise<Client> {
    // Add credits
    const updatedClient = await this.addCredits(clientId, credits)

    // Record the purchase
    const { error } = await this['supabase']
      .from('credit_purchases')
      .insert({
        client_id: clientId,
        credits,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        order_id: paymentDetails.orderId,
        created_at: new Date().toISOString()
      })

    if (error) {
      logger.error('Failed to record credit purchase:', error)
      // Don't throw - credits were already added
    }

    return updatedClient
  }

  /**
   * Get client's recent activity
   */
  async getRecentActivity(clientId: string, limit = 10): Promise<any[]> {
    const { data, error } = await this['supabase']
      .from('activity_log')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      // Activity log might not exist, so don't throw
      logger.error('Failed to fetch activity:', error)
      return []
    }

    return data || []
  }
}