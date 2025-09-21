import { DataService, Match, Brief, Designer, Client, DatabaseError, ValidationError } from './data-service'
import { logger } from '@/lib/core/logging-service'

export interface CreateMatchData {
  client_id: string
  designer_id: string
  brief_id?: string
  score: number
  reasons: string[]
  ai_analysis?: any
}

export interface MatchFilters {
  status?: 'pending' | 'unlocked' | 'accepted' | 'rejected' | 'expired'
  minScore?: number
  maxScore?: number
  clientId?: string
  designerId?: string
  briefId?: string
}

export interface MatchWithFullDetails extends Match {
  designer: Designer
  client?: Client
  brief?: Brief
  unlocked?: boolean
  request_count?: number
}

/**
 * Match-specific data service
 * Extends DataService with match-focused operations
 */
export class MatchDataService extends DataService {
  private static matchInstance: MatchDataService

  static getInstance(): MatchDataService {
    if (!this.matchInstance) {
      this.matchInstance = new MatchDataService()
    }
    return this.matchInstance
  }

  /**
   * Create a new match
   */
  async createMatch(matchData: CreateMatchData): Promise<Match> {
    // Validate designer is approved
    const designer = await this.getDesigner(matchData.designer_id)
    if (!designer.is_approved) {
      throw new ValidationError('Cannot create match with unapproved designer')
    }

    // Check if client already has this designer unlocked
    const { data: existing } = await this['supabase']
      .from('client_designers')
      .select('id')
      .eq('client_id', matchData.client_id)
      .eq('designer_id', matchData.designer_id)
      .single()

    if (existing) {
      throw new ValidationError('Client has already unlocked this designer')
    }

    // Create the match
    const { data, error } = await this['supabase']
      .from('matches')
      .insert({
        ...matchData,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to create match', error)
    }

    // Create designer request
    await this.createDesignerRequest(data.id, matchData.designer_id)

    return data as Match
  }

  /**
   * Create designer request for a match
   */
  private async createDesignerRequest(matchId: string, designerId: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

    const { error } = await this['supabase']
      \.from\(['"`]project_requests['"`]\)
      .insert({
        match_id: matchId,
        designer_id: designerId,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })

    if (error) {
      logger.error('Failed to create designer request:', error)
      // Don't throw - match was created successfully
    }
  }

  /**
   * Find new match for client (excludes already seen designers)
   */
  async findNewMatch(
    clientId: string, 
    briefId: string,
    excludeDesignerIds: string[] = []
  ): Promise<Match | null> {
    // Get client's unlocked designers
    const { data: unlockedDesigners } = await this['supabase']
      .from('client_designers')
      .select('designer_id')
      .eq('client_id', clientId)

    const unlockedIds = unlockedDesigners?.map(d => d.designer_id) || []
    const allExcludedIds = [...new Set([...excludeDesignerIds, ...unlockedIds])]

    // Get approved designers not yet matched
    let query = this['supabase']
      .from('designers')
      .select('*')
      .eq('is_approved', true)

    if (allExcludedIds.length > 0) {
      query = query.not('id', 'in', `(${allExcludedIds.join(',')})`)
    }

    const { data: availableDesigners, error } = await query

    if (error) {
      throw new DatabaseError('Failed to find available designers', error)
    }

    if (!availableDesigners || availableDesigners.length === 0) {
      return null // No more designers available
    }

    // For now, pick the first available designer
    // In production, this would use AI matching
    const selectedDesigner = availableDesigners[0]

    // Create a new match
    const match = await this.createMatch({
      client_id: clientId,
      designer_id: selectedDesigner.id,
      brief_id: briefId,
      score: Math.floor(Math.random() * 30) + 55, // Random 55-85
      reasons: [
        'Strong portfolio match',
        'Available immediately',
        'Excellent communication skills'
      ]
    })

    return match
  }

  /**
   * Get matches by filters
   */
  async getMatchesByFilters(filters: MatchFilters): Promise<Match[]> {
    let query = this['supabase']
      .from('matches')
      .select(`
        *,
        designer:designers(*),
        client:clients(*),
        brief:briefs(*)
      `)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.clientId) {
      query = query.eq('client_id', filters.clientId)
    }

    if (filters.designerId) {
      query = query.eq('designer_id', filters.designerId)
    }

    if (filters.briefId) {
      query = query.eq('brief_id', filters.briefId)
    }

    if (filters.minScore !== undefined) {
      query = query.gte('score', filters.minScore)
    }

    if (filters.maxScore !== undefined) {
      query = query.lte('score', filters.maxScore)
    }

    const { data, error } = await query
      .order('score', { ascending: false })

    if (error) {
      throw new DatabaseError('Failed to fetch matches', error)
    }

    return data as Match[]
  }

  /**
   * Update match status
   */
  async updateMatchStatus(
    matchId: string, 
    status: Match['status'],
    additionalData?: Partial<Match>
  ): Promise<Match> {
    const updateData = {
      status,
      ...additionalData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this['supabase']
      .from('matches')
      .update(updateData)
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to update match status', error)
    }

    return data as Match
  }

  /**
   * Expire old matches
   */
  async expireOldMatches(): Promise<number> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await this['supabase']
      .from('matches')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('created_at', sevenDaysAgo.toISOString())
      .select()

    if (error) {
      throw new DatabaseError('Failed to expire old matches', error)
    }

    return data?.length || 0
  }

  /**
   * Get match statistics
   */
  async getMatchStatistics(): Promise<{
    total: number
    byStatus: Record<string, number>
    averageScore: number
    conversionRate: number
  }> {
    const { data, error } = await this['supabase']
      .from('matches')
      .select('status, score')

    if (error) {
      throw new DatabaseError('Failed to fetch match statistics', error)
    }

    const matches = data || []
    const total = matches.length

    // Group by status
    const byStatus = matches.reduce((acc, match) => {
      acc[match.status] = (acc[match.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate average score
    const averageScore = total > 0
      ? matches.reduce((sum, m) => sum + m.score, 0) / total
      : 0

    // Calculate conversion rate (unlocked/total)
    const unlocked = byStatus['unlocked'] || 0
    const accepted = byStatus['accepted'] || 0
    const conversionRate = total > 0
      ? ((unlocked + accepted) / total) * 100
      : 0

    return {
      total,
      byStatus,
      averageScore,
      conversionRate
    }
  }

  /**
   * Cache AI analysis for a match
   */
  async cacheMatchAnalysis(
    briefId: string,
    designerId: string,
    analysis: any
  ): Promise<void> {
    const { error } = await this['supabase']
      .from('match_cache')
      .upsert({
        brief_id: briefId,
        designer_id: designerId,
        ai_analysis: analysis,
        created_at: new Date().toISOString()
      })

    if (error) {
      logger.error('Failed to cache match analysis:', error)
      // Don't throw - caching is optional
    }
  }

  /**
   * Get cached match analysis
   */
  async getCachedMatchAnalysis(
    briefId: string,
    designerId: string
  ): Promise<any | null> {
    const { data, error } = await this['supabase']
      .from('match_cache')
      .select('ai_analysis')
      .eq('brief_id', briefId)
      .eq('designer_id', designerId)
      .single()

    if (error || !data) {
      return null
    }

    return data.ai_analysis
  }

  /**
   * Get match with full details including unlock status
   */
  async getMatchWithFullDetails(matchId: string): Promise<MatchWithFullDetails> {
    const match = await this.getMatchWithDetails(matchId)
    
    // Check if unlocked
    const unlocked = match.status === 'unlocked' || match.status === 'accepted'

    // Get working request count if unlocked
    let request_count = 0
    if (unlocked) {
      const { count } = await this['supabase']
        .from('project_requests')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', matchId)

      request_count = count || 0
    }

    return {
      ...match,
      designer: match.designer!,
      unlocked,
      request_count
    } as MatchWithFullDetails
  }

  /**
   * Auto-unlock match after payment
   */
  async autoUnlockMatch(matchId: string, clientId: string): Promise<Match> {
    // First verify and unlock
    await this.unlockMatch(matchId, clientId)

    // Then return updated match
    return this.updateMatchStatus(matchId, 'unlocked', {
      client_id: clientId
    })
  }
}