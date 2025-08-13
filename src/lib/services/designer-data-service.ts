import { DataService, Designer, Match, DatabaseError, ValidationError } from './data-service'
import { logger } from '@/lib/core/logging-service'

export interface DesignerProfile extends Designer {
  portfolio_url?: string
  years_experience?: string
  communication_style?: string
  project_types?: string[]
  design_styles?: string[]
  industries?: string[]
  software?: string[]
  city?: string
  country?: string
  bio?: string
  hourly_rate?: number
  availability?: string
}

export interface DesignerStats {
  totalMatches: number
  acceptedMatches: number
  completedProjects: number
  responseRate?: number
}

export interface DesignerApplication {
  email: string
  first_name: string
  last_name: string
  portfolio_url: string
  years_experience: string
  project_types: string[]
  design_styles: string[]
  industries: string[]
  software: string[]
  city: string
  country: string
  communication_style: string
  bio?: string
  hourly_rate?: number
}

/**
 * Designer-specific data service
 * Extends DataService with designer-focused operations
 */
export class DesignerDataService extends DataService {
  private static designerInstance: DesignerDataService

  static getInstance(): DesignerDataService {
    if (!this.designerInstance) {
      this.designerInstance = new DesignerDataService()
    }
    return this.designerInstance
  }

  /**
   * Create a new designer account
   */
  async createDesigner(application: DesignerApplication): Promise<DesignerProfile> {
    // Check if designer already exists
    const existing = await this.getDesignerByEmail(application.email)
    if (existing) {
      throw new ValidationError('Designer with this email already exists')
    }

    // Calculate last_initial
    const last_initial = application.last_name ? application.last_name.charAt(0).toUpperCase() : ''

    const { data, error } = await this['supabase']
      .from('designers')
      .insert({
        ...application,
        last_initial,
        is_approved: false, // Designers need admin approval
        is_verified: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to create designer', error)
    }

    return data as DesignerProfile
  }

  /**
   * Update designer profile
   */
  async updateDesignerProfile(
    designerId: string, 
    updates: Partial<DesignerProfile>
  ): Promise<DesignerProfile> {
    // If updating critical fields, reset approval
    const criticalFields = ['portfolio_url', 'bio', 'hourly_rate', 'years_experience']
    const needsReapproval = Object.keys(updates).some(key => criticalFields.includes(key))

    if (needsReapproval) {
      updates.is_approved = false
      updates.edited_after_approval = true
    }

    // Update last_initial if last_name changes
    if (updates.last_name) {
      updates.last_initial = updates.last_name.charAt(0).toUpperCase()
    }

    const { data, error } = await this['supabase']
      .from('designers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', designerId)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to update designer profile', error)
    }

    // Clear cache
    this['queryCache'].delete(`designer:${designerId}`)

    return data as DesignerProfile
  }

  /**
   * Get designer statistics
   */
  async getDesignerStats(designerId: string): Promise<DesignerStats> {
    // Get matches
    const { data: matches, error: matchError } = await this['supabase']
      .from('matches')
      .select('status')
      .eq('designer_id', designerId)

    if (matchError) {
      throw new DatabaseError('Failed to fetch designer matches', matchError)
    }

    const acceptedMatches = matches?.filter(m => 
      m.status === 'accepted'
    ).length || 0

    // Get completed projects (could be tracked separately)
    const completedProjects = acceptedMatches // For now, assume accepted = completed

    // Calculate response rate (simplified)
    const { data: requests } = await this['supabase']
      .from('designer_requests')
      .select('responded')
      .eq('designer_id', designerId)

    let responseRate: number | undefined
    if (requests && requests.length > 0) {
      const responded = requests.filter(r => r.responded).length
      responseRate = (responded / requests.length) * 100
    }

    return {
      totalMatches: matches?.length || 0,
      acceptedMatches,
      completedProjects,
      responseRate
    }
  }

  /**
   * Get designer's match requests
   */
  async getMatchRequests(designerId: string, status?: 'pending' | 'accepted' | 'rejected'): Promise<any[]> {
    let query = this['supabase']
      .from('designer_requests')
      .select(`
        *,
        match:matches(
          *,
          client:clients(email, id),
          brief:briefs(*)
        )
      `)
      .eq('designer_id', designerId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError('Failed to fetch match requests', error)
    }

    return data || []
  }

  /**
   * Respond to match request
   */
  async respondToMatchRequest(
    requestId: string, 
    designerId: string, 
    accept: boolean,
    message?: string
  ): Promise<void> {
    // Verify the request belongs to this designer
    const { data: request, error: fetchError } = await this['supabase']
      .from('designer_requests')
      .select('*')
      .eq('id', requestId)
      .eq('designer_id', designerId)
      .single()

    if (fetchError || !request) {
      throw new ValidationError('Match request not found')
    }

    // Update request status
    const { error: updateError } = await this['supabase']
      .from('designer_requests')
      .update({
        status: accept ? 'accepted' : 'rejected',
        responded: true,
        response_message: message,
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      throw new DatabaseError('Failed to respond to match request', updateError)
    }

    // If accepted, update match status
    if (accept && request.match_id) {
      const { error: matchError } = await this['supabase']
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', request.match_id)

      if (matchError) {
        logger.error('Failed to update match status:', matchError)
      }
    }
  }

  /**
   * Get designers pending approval
   */
  async getPendingDesigners(): Promise<DesignerProfile[]> {
    const { data, error } = await this['supabase']
      .from('designers')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError('Failed to fetch pending designers', error)
    }

    return data as DesignerProfile[]
  }

  /**
   * Approve designer (admin only)
   */
  async approveDesigner(designerId: string, adminId?: string): Promise<DesignerProfile> {
    const { data, error } = await this['supabase']
      .from('designers')
      .update({
        is_approved: true,
        is_verified: true,
        edited_after_approval: false,
        last_approved_at: new Date().toISOString(),
        approved_by: adminId
      })
      .eq('id', designerId)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to approve designer', error)
    }

    // Clear cache
    this['queryCache'].delete(`designer:${designerId}`)

    return data as DesignerProfile
  }

  /**
   * Reject designer (admin only)
   */
  async rejectDesigner(designerId: string, reason?: string): Promise<void> {
    const { error } = await this['supabase']
      .from('designers')
      .update({
        is_approved: false,
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', designerId)

    if (error) {
      throw new DatabaseError('Failed to reject designer', error)
    }

    // Clear cache
    this['queryCache'].delete(`designer:${designerId}`)
  }

  /**
   * Search designers by criteria
   */
  async searchDesigners(criteria: {
    project_types?: string[]
    design_styles?: string[]
    industries?: string[]
    min_experience?: number
    max_hourly_rate?: number
    availability?: string
  }): Promise<DesignerProfile[]> {
    let query = this['supabase']
      .from('designers')
      .select('*')
      .eq('is_approved', true)

    // Apply filters
    if (criteria.project_types?.length) {
      query = query.contains('project_types', criteria.project_types)
    }

    if (criteria.design_styles?.length) {
      query = query.contains('design_styles', criteria.design_styles)
    }

    if (criteria.industries?.length) {
      query = query.contains('industries', criteria.industries)
    }

    if (criteria.max_hourly_rate) {
      query = query.lte('hourly_rate', criteria.max_hourly_rate)
    }

    if (criteria.availability) {
      query = query.eq('availability', criteria.availability)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('Failed to search designers', error)
    }

    // Post-process for experience (stored as string ranges)
    let results = data as DesignerProfile[]
    
    if (criteria.min_experience) {
      results = results.filter(d => {
        const exp = d.years_experience
        if (!exp) return false
        
        // Parse experience ranges like "3-5", "10+"
        if (exp.includes('+')) {
          const min = parseInt(exp.replace('+', ''))
          return min >= criteria.min_experience
        }
        if (exp.includes('-')) {
          const [min] = exp.split('-').map(Number)
          return min >= criteria.min_experience
        }
        return parseInt(exp) >= criteria.min_experience
      })
    }

    return results
  }

  /**
   * Get designer's earnings
   */
  async getDesignerEarnings(designerId: string): Promise<{
    total: number
    pending: number
    paid: number
  }> {
    const { data, error } = await this['supabase']
      .from('designer_earnings')
      .select('amount, status')
      .eq('designer_id', designerId)

    if (error) {
      // Earnings table might not exist yet
      logger.error('Failed to fetch earnings:', error)
      return { total: 0, pending: 0, paid: 0 }
    }

    const total = data?.reduce((sum, e) => sum + e.amount, 0) || 0
    const pending = data?.filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0) || 0
    const paid = data?.filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0) || 0

    return { total, pending, paid }
  }
}