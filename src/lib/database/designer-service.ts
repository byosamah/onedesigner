import { DatabaseService } from './base'

/**
 * Centralized designer database operations
 */
export class DesignerService extends DatabaseService {
  
  /**
   * Get designer profile with related data
   */
  async getDesignerProfile(designerId: string) {
    if (!designerId) {
      throw new Error('Designer ID is required')
    }

    const { data, error } = await this.supabase
      .from('designers')
      .select(`
        *,
        designer_project_types (project_type),
        designer_industries (industry),
        designer_styles (style)
      `)
      .eq('id', designerId)
      .single()
    
    if (error) {
      this.handleError(error, 'get designer profile')
    }

    // Transform the data
    if (data) {
      return {
        ...data,
        project_types: data.designer_project_types?.map((pt: any) => pt.project_type) || [],
        industries: data.designer_industries?.map((i: any) => i.industry) || [],
        styles: data.designer_styles?.map((s: any) => s.style) || []
      }
    }

    return data
  }

  /**
   * Get all approved designers
   */
  async getApprovedDesigners(options?: {
    page?: number
    limit?: number
    orderBy?: string
    ascending?: boolean
  }) {
    let query = this.supabase
      .from('designers')
      .select('*')
      .eq('is_approved', true)
      .eq('is_verified', true)

    // Apply pagination and ordering
    query = this.applyPagination(query, options?.page, options?.limit)
    query = this.applyOrdering(query, options?.orderBy || 'created_at', options?.ascending)

    const { data, error } = await query

    if (error) {
      this.handleError(error, 'get approved designers')
    }

    return data || []
  }

  /**
   * Create designer profile
   */
  async createDesigner(designerData: any) {
    this.validateRequired(designerData, ['email', 'first_name', 'last_name'], 'create designer')

    const { data, error } = await this.supabase
      .from('designers')
      .insert(designerData)
      .select()
      .single()

    if (error) {
      this.handleError(error, 'create designer')
    }

    return data
  }

  /**
   * Update designer profile
   */
  async updateDesigner(designerId: string, updates: any) {
    if (!designerId) {
      throw new Error('Designer ID is required')
    }

    const { data, error } = await this.supabase
      .from('designers')
      .update(updates)
      .eq('id', designerId)
      .select()
      .single()

    if (error) {
      this.handleError(error, 'update designer')
    }

    return data
  }

  /**
   * Approve designer
   */
  async approveDesigner(designerId: string, approvedBy?: string) {
    return this.updateDesigner(designerId, {
      is_approved: true,
      approved_at: new Date().toISOString(),
      ...(approvedBy && { approved_by: approvedBy })
    })
  }

  /**
   * Get designers by availability
   */
  async getDesignersByAvailability(availability: string[]) {
    const { data, error } = await this.supabase
      .from('designers')
      .select('*')
      .eq('is_approved', true)
      .eq('is_verified', true)
      .in('availability', availability)

    if (error) {
      this.handleError(error, 'get designers by availability')
    }

    return data || []
  }

  /**
   * Search designers
   */
  async searchDesigners(searchParams: {
    styles?: string[]
    industries?: string[]
    location?: string
    experience?: number
    availability?: string[]
  }) {
    let query = this.supabase
      .from('designers')
      .select('*')
      .eq('is_approved', true)
      .eq('is_verified', true)

    if (searchParams.availability) {
      query = query.in('availability', searchParams.availability)
    }

    if (searchParams.location) {
      query = query.ilike('city', `%${searchParams.location}%`)
    }

    if (searchParams.experience) {
      query = query.gte('years_experience', searchParams.experience)
    }

    const { data, error } = await query

    if (error) {
      this.handleError(error, 'search designers')
    }

    return data || []
  }

  /**
   * Get designer statistics
   */
  async getDesignerStats(designerId: string) {
    const { data, error } = await this.supabase
      .from('designer_quick_stats')
      .select('*')
      .eq('designer_id', designerId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      this.handleError(error, 'get designer stats')
    }

    return data
  }
}

// Export singleton instance
export const designerService = new DesignerService()