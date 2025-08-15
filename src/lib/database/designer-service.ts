import { DatabaseService } from './base'
import { z } from 'zod'
import { logger } from '@/lib/core/logging-service'

// Centralized designer form schema - single page application
export const designerFormSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  profilePicture: z.string().min(1, 'Profile picture or logo is required'), // Now required
  
  // Professional Info
  title: z.string().min(1, 'Professional title is required'),
  portfolioUrl: z.string().min(1, 'Portfolio URL is required').refine((val) => {
    try {
      const urlToTest = val.match(/^https?:\/\//i) ? val : `https://${val}`
      new URL(urlToTest)
      return true
    } catch {
      return false
    }
  }, 'Invalid URL format'),
  dribbbleUrl: z.string().optional().nullable(),
  behanceUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  
  // Location & Availability
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  availability: z.enum(['immediate', '1-2weeks', '2-4weeks', '1-2months', 'unavailable']),
  
  // Bio & Portfolio
  bio: z.string().min(500, 'Bio must be at least 500 characters').max(1000, 'Bio must be less than 1000 characters'), // Updated limits
  portfolioImages: z.array(z.string()).max(3, 'Maximum 3 portfolio images').optional(),
})

export type DesignerFormData = z.infer<typeof designerFormSchema>

/**
 * Centralized designer database operations
 */
export class DesignerService extends DatabaseService {
  
  /**
   * Map database fields to form fields for consistent data access
   */
  private mapDatabaseToForm(dbData: any): DesignerFormData & { id: string, isApproved: boolean } {
    return {
      id: dbData.id,
      firstName: dbData.first_name || '',
      lastName: dbData.last_name || '',
      email: dbData.email || '',
      phone: dbData.phone,
      profilePicture: dbData.avatar_url,
      title: dbData.title || '',
      portfolioUrl: dbData.portfolio_url || dbData.website_url || '',
      dribbbleUrl: dbData.dribbble_url,
      behanceUrl: dbData.behance_url,
      linkedinUrl: dbData.linkedin_url,
      country: dbData.country || '',
      city: dbData.city || '',
      availability: dbData.availability || 'immediate',
      bio: dbData.bio || '',
      portfolioImages: Array.isArray(dbData.tools) ? dbData.tools : [],
      isApproved: dbData.is_approved || false
    }
  }

  /**
   * Map form fields to database fields
   */
  private mapFormToDatabase(formData: Partial<DesignerFormData>): any {
    const dbData: any = {}

    if (formData.firstName !== undefined) dbData.first_name = formData.firstName
    if (formData.lastName !== undefined) {
      dbData.last_name = formData.lastName
      dbData.last_initial = formData.lastName.charAt(0).toUpperCase()
    }
    if (formData.phone !== undefined) dbData.phone = formData.phone || null
    if (formData.profilePicture !== undefined) dbData.avatar_url = formData.profilePicture || null
    if (formData.title !== undefined) dbData.title = formData.title
    if (formData.portfolioUrl !== undefined) {
      // Ensure URL has protocol before saving
      const url = formData.portfolioUrl
      const urlWithProtocol = url?.match(/^https?:\/\//i) ? url : `https://${url}`
      dbData.portfolio_url = urlWithProtocol || null
      dbData.website_url = urlWithProtocol || null // Keep both fields in sync
    }
    if (formData.dribbbleUrl !== undefined) {
      const url = formData.dribbbleUrl
      dbData.dribbble_url = (url && url.trim()) 
        ? (url.match(/^https?:\/\//i) ? url : `https://${url}`)
        : null
    }
    if (formData.behanceUrl !== undefined) {
      const url = formData.behanceUrl
      dbData.behance_url = (url && url.trim())
        ? (url.match(/^https?:\/\//i) ? url : `https://${url}`)
        : null
    }
    if (formData.linkedinUrl !== undefined) {
      const url = formData.linkedinUrl
      dbData.linkedin_url = (url && url.trim())
        ? (url.match(/^https?:\/\//i) ? url : `https://${url}`)
        : null
    }
    if (formData.country !== undefined) dbData.country = formData.country
    if (formData.city !== undefined) dbData.city = formData.city
    if (formData.availability !== undefined) dbData.availability = formData.availability
    if (formData.bio !== undefined) dbData.bio = formData.bio

    // Store portfolio images in the 'tools' array column (repurposing unused field)
    // Since portfolio_image_1/2/3 columns don't exist yet
    if (formData.portfolioImages !== undefined) {
      // Store directly as array in the 'tools' field (which is currently unused)
      dbData.tools = formData.portfolioImages.length > 0 ? formData.portfolioImages : []
    }

    return dbData
  }

  /**
   * Get designer by email (returns form-compatible data)
   */
  async getDesignerByEmail(email: string) {
    try {
      const { data, error } = await this.supabase
        .from('designers')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? this.mapDatabaseToForm(data) : null
    } catch (error) {
      logger.error('Error fetching designer by email:', error)
      return null
    }
  }

  /**
   * Create or update designer with form data
   */
  async upsertDesignerFromForm(email: string, formData: Partial<DesignerFormData>) {
    try {
      const dbData = this.mapFormToDatabase(formData)
      
      logger.info('Mapped form data to database format:', {
        email,
        dbData: JSON.stringify(dbData, null, 2)
      })
      
      // Check if designer exists
      const existing = await this.getDesignerByEmail(email)
      
      if (existing) {
        logger.info('Updating existing designer:', email)
        
        // Update existing designer
        const { data, error } = await this.supabase
          .from('designers')
          .update({
            ...dbData,
            updated_at: new Date().toISOString(),
            is_approved: false, // Reset approval on update
            edited_after_approval: existing.isApproved ? true : false
          })
          .eq('email', email)
          .select()
          .single()

        if (error) {
          logger.error('Database update error:', {
            error,
            errorMessage: error.message,
            errorCode: error.code,
            errorDetails: error.details
          })
          throw error
        }
        
        logger.info('Designer updated via form:', email)
        return { success: true, data: this.mapDatabaseToForm(data), isUpdate: true }
      } else {
        logger.info('Creating new designer:', email)
        
        // Create new designer with default values
        const insertData = {
          email,
          ...dbData,
          is_approved: false,
          is_verified: true, // Already verified via auth
          years_experience: 2, // Default value as number
          rating: 4.5, // Default rating
          total_projects: 0,
          created_at: new Date().toISOString(),
        }
        
        logger.info('Insert data:', JSON.stringify(insertData, null, 2))
        
        const { data, error } = await this.supabase
          .from('designers')
          .insert(insertData)
          .select()
          .single()

        if (error) {
          logger.error('Database insert error:', {
            error,
            errorMessage: error.message,
            errorCode: error.code,
            errorDetails: error.details,
            errorHint: error.hint
          })
          throw error
        }
        
        logger.info('Designer created via form:', email)
        return { success: true, data: this.mapDatabaseToForm(data), isUpdate: false }
      }
    } catch (error: any) {
      logger.error('Error upserting designer from form:', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack
      })
      return { 
        success: false, 
        error: error?.message || 'Failed to save designer data' 
      }
    }
  }

  /**
   * Get designer form data by ID for editing
   */
  async getDesignerFormData(designerId: string) {
    try {
      if (!designerId) {
        return null
      }
      
      const { data, error } = await this.supabase
        .from('designers')
        .select('*')
        .eq('id', designerId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        logger.error('Error fetching designer by ID:', error)
        return null
      }
      
      return data ? this.mapDatabaseToForm(data) : null
    } catch (error) {
      logger.error('Error in getDesignerFormData:', error)
      return null
    }
  }

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