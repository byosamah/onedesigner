import { DatabaseService } from './base'

/**
 * Centralized client database operations
 */
export class ClientService extends DatabaseService {
  
  /**
   * Get client by ID
   */
  async getClient(clientId: string) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
    
    if (error) {
      this.handleError(error, 'get client')
    }

    return data
  }

  /**
   * Get client by email
   */
  async getClientByEmail(email: string) {
    if (!email) {
      throw new Error('Email is required')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') { // Not found is ok
      this.handleError(error, 'get client by email')
    }

    return data
  }

  /**
   * Create or update client
   */
  async upsertClient(clientData: { email: string; [key: string]: any }) {
    this.validateRequired(clientData, ['email'], 'upsert client')

    const { data, error } = await this.supabase
      .from('clients')
      .upsert(clientData, { onConflict: 'email' })
      .select()
      .single()

    if (error) {
      this.handleError(error, 'upsert client')
    }

    return data
  }

  /**
   * Add credits to client
   */
  async addCredits(clientId: string, credits: number) {
    if (!clientId || credits <= 0) {
      throw new Error('Valid client ID and positive credits required')
    }

    // Get current credits first
    const { data: currentClient, error: fetchError } = await this.supabase
      .from('clients')
      .select('match_credits')
      .eq('id', clientId)
      .single()

    if (fetchError) {
      this.handleError(fetchError, 'fetch client for credits update')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .update({ 
        match_credits: (currentClient?.match_credits || 0) + credits
      })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      this.handleError(error, 'add credits')
    }

    return data
  }

  /**
   * Deduct credits from client
   */
  async deductCredits(clientId: string, credits: number) {
    if (!clientId || credits <= 0) {
      throw new Error('Valid client ID and positive credits required')
    }

    // Check current balance first
    const client = await this.getClient(clientId)
    if (!client || client.match_credits < credits) {
      throw new Error('Insufficient credits')
    }

    const { data, error } = await this.supabase
      .from('clients')
      .update({ 
        match_credits: client.match_credits - credits
      })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      this.handleError(error, 'deduct credits')
    }

    return data
  }

  /**
   * Get client matches
   */
  async getClientMatches(clientId: string, options?: {
    status?: string
    page?: number
    limit?: number
  }) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    let query = this.supabase
      .from('matches')
      .select(`
        *,
        brief:briefs(*),
        designer:designers(*)
      `)
      .eq('client_id', clientId)

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    // Apply pagination
    query = this.applyPagination(query, options?.page, options?.limit)
    query = this.applyOrdering(query, 'created_at', false) // Most recent first

    const { data, error } = await query

    if (error) {
      this.handleError(error, 'get client matches')
    }

    return data || []
  }

  /**
   * Get unlocked designers for client
   */
  async getUnlockedDesigners(clientId: string) {
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    const { data, error } = await this.supabase
      .from('client_designers')
      .select(`
        *,
        designer:designers(*)
      `)
      .eq('client_id', clientId)

    if (error) {
      this.handleError(error, 'get unlocked designers')
    }

    return data || []
  }

  /**
   * Check if designer is unlocked for client
   */
  async isDesignerUnlocked(clientId: string, designerId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('client_designers')
      .select('id')
      .eq('client_id', clientId)
      .eq('designer_id', designerId)
      .single()

    if (error && error.code !== 'PGRST116') {
      this.handleError(error, 'check designer unlock status')
    }

    return !!data
  }

  /**
   * Unlock designer for client
   */
  async unlockDesigner(clientId: string, designerId: string) {
    this.validateRequired({ clientId, designerId }, ['clientId', 'designerId'], 'unlock designer')

    // Check if already unlocked
    const isUnlocked = await this.isDesignerUnlocked(clientId, designerId)
    if (isUnlocked) {
      throw new Error('Designer is already unlocked for this client')
    }

    const { data, error } = await this.supabase
      .from('client_designers')
      .insert({
        client_id: clientId,
        designer_id: designerId,
        unlocked_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      this.handleError(error, 'unlock designer')
    }

    return data
  }
}

// Export singleton instance
export const clientService = new ClientService()