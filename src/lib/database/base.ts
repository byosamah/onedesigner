import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

/**
 * Base database service with common functionality
 * All database services should extend this class
 */
export abstract class DatabaseService {
  protected supabase = createServiceClient()
  
  /**
   * Handle database errors consistently
   */
  protected handleError(error: any, operation: string): never {
    logger.error(`Database error in ${operation}:`, error)
    
    // Handle specific PostgreSQL error codes
    if (error?.code === 'PGRST116') {
      throw new Error(`Record not found during ${operation}`)
    }
    
    if (error?.code === '23505') {
      throw new Error(`Duplicate record during ${operation}`)
    }
    
    if (error?.code === '23503') {
      throw new Error(`Foreign key constraint violation during ${operation}`)
    }
    
    throw new Error(`Failed to ${operation}: ${error?.message || 'Unknown error'}`)
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, fields: string[], operation: string): void {
    const missing = fields.filter(field => !data[field])
    if (missing.length > 0) {
      throw new Error(`Missing required fields for ${operation}: ${missing.join(', ')}`)
    }
  }

  /**
   * Standard pagination
   */
  protected applyPagination(query: any, page?: number, limit?: number) {
    if (page && limit) {
      const offset = (page - 1) * limit
      return query.range(offset, offset + limit - 1)
    }
    return query
  }

  /**
   * Standard ordering
   */
  protected applyOrdering(query: any, orderBy?: string, ascending = true) {
    if (orderBy) {
      return query.order(orderBy, { ascending })
    }
    return query
  }
}