import { createServiceClientWithoutCookies } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

export interface ProjectRequest {
  id?: string
  match_id: string
  client_id: string
  designer_id: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  client_email?: string
  brief_details?: any
  brief_snapshot?: any // New: Complete brief snapshot
  viewed_at?: string // New: When designer viewed the request
  response_deadline?: string // New: 72-hour deadline
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  created_at?: string
  updated_at?: string
}

export interface ProjectRequestWithRelations extends ProjectRequest {
  clients?: {
    id: string
    email: string
  }
  designers?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  matches?: {
    id: string
    score: number
    reasons: string[]
    briefs?: {
      project_type: string
      timeline: string
      budget: string
      industry: string
      styles: any
    }
  }
}

class ProjectRequestService {
  async create(data: Omit<ProjectRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectRequest | null> {
    try {
      const supabase = createServiceClientWithoutCookies()
      const { data: projectRequest, error } = await supabase
        .from('project_requests')
        .insert(data)
        .select()
        .single()

      if (error) {
        logger.error('Error creating project request:', error)
        return null
      }

      return projectRequest
    } catch (error) {
      logger.error('Error in ProjectRequestService.create:', error)
      return null
    }
  }

  async getByDesigner(designerId: string): Promise<ProjectRequestWithRelations[]> {
    try {
      const supabase = createServiceClientWithoutCookies()
      const { data: projectRequests, error } = await supabase
        .from('project_requests')
        .select(`
          *,
          brief_snapshot,
          response_deadline,
          viewed_at,
          matches (
            id,
            score,
            reasons,
            briefs (
              project_type,
              timeline,
              budget,
              industry,
              styles
            )
          ),
          clients (
            id,
            email
          )
        `)
        .eq('designer_id', designerId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching designer project requests:', error)
        return []
      }

      return projectRequests || []
    } catch (error) {
      logger.error('Error in ProjectRequestService.getByDesigner:', error)
      return []
    }
  }

  async getById(id: string, designerId?: string): Promise<ProjectRequestWithRelations | null> {
    try {
      const supabase = createServiceClientWithoutCookies()
      let query = supabase
        .from('project_requests')
        .select(`
          *,
          clients (
            id,
            email
          ),
          designers (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', id)

      if (designerId) {
        query = query.eq('designer_id', designerId)
      }

      const { data: projectRequest, error } = await query.single()

      if (error) {
        logger.error('Error fetching project request by ID:', error)
        return null
      }

      return projectRequest
    } catch (error) {
      logger.error('Error in ProjectRequestService.getById:', error)
      return null
    }
  }

  async approve(id: string, designerId: string): Promise<boolean> {
    try {
      const supabase = createServiceClientWithoutCookies()
      const { error } = await supabase
        .from('project_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('designer_id', designerId)

      if (error) {
        logger.error('Error approving project request:', error)
        return false
      }

      return true
    } catch (error) {
      logger.error('Error in ProjectRequestService.approve:', error)
      return false
    }
  }

  async reject(id: string, designerId: string, rejectionReason?: string): Promise<boolean> {
    try {
      const supabase = createServiceClientWithoutCookies()
      const { error } = await supabase
        .from('project_requests')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason || 'Not available for this project',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('designer_id', designerId)

      if (error) {
        logger.error('Error rejecting project request:', error)
        return false
      }

      return true
    } catch (error) {
      logger.error('Error in ProjectRequestService.reject:', error)
      return false
    }
  }

  async checkExisting(matchId: string, clientId: string, designerId: string): Promise<boolean> {
    try {
      const supabase = createServiceClientWithoutCookies()
      const { data, error } = await supabase
        .from('project_requests')
        .select('id')
        .eq('match_id', matchId)
        .eq('client_id', clientId)
        .eq('designer_id', designerId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        logger.error('Error checking existing project request:', error)
        return false
      }

      return !!data
    } catch (error) {
      logger.error('Error in ProjectRequestService.checkExisting:', error)
      return false
    }
  }
}

export const projectRequestService = new ProjectRequestService()