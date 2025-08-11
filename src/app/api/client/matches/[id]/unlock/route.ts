import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'
import { Features } from '@/lib/features'
import { DataService, InsufficientCreditsError, ValidationError, NotFoundError } from '@/lib/services/data-service'
import { ErrorManager, handleApiError as handleApiErrorNew } from '@/lib/core/error-manager'
import { getBusinessRules } from '@/lib/core/business-rules'
import { logger } from '@/lib/core/logging-service'
import { 
  withPipeline, 
  createAuthenticatedPipeline, 
  AuthenticatedRequest,
  rateLimitMiddleware 
} from '@/lib/core/pipeline'

// Pipeline handler for unlock match
async function unlockMatchHandler(
  req: AuthenticatedRequest,
  context?: { params: { id: string } }
) {
  const matchId = context?.params?.id
  if (!matchId) {
    return apiResponse.error('Match ID is required')
  }

  logger.info('🔓 Pipeline unlock request for match:', matchId)
  logger.info('👤 Client ID from pipeline:', req.clientId)

  // Use BusinessRules validation if enabled
  if (Features.USE_BUSINESS_RULES && req.clientId) {
    logger.info('✨ Using BusinessRules validation in pipeline')
    
    const businessRules = getBusinessRules()
    const dataService = DataService.getInstance()
    
    // Get client and match details for validation
    const client = await dataService.getClientWithCredits(req.clientId)
    const match = await dataService.getMatchWithDetails(matchId)
    
    // Get unlocked designers for this client
    const { data: unlockedDesigners } = await dataService['supabase']
      .from('client_designers')
      .select('designer_id')
      .eq('client_id', req.clientId)
    
    const unlockedDesignerIds = unlockedDesigners?.map(d => d.designer_id) || []
    
    // Validate the entire unlock workflow
    const validation = businessRules.validateMatchUnlock(
      client.match_credits,
      match.designer_id,
      unlockedDesignerIds,
      match.score
    )
    
    if (!validation.isValid) {
      return apiResponse.error(validation.message!, 400, validation.code)
    }
    
    logger.info('✅ BusinessRules validation passed')
  }

  // Use DataService if enabled
  if (Features.USE_NEW_DATA_SERVICE && req.clientId) {
    logger.info('✨ Using DataService in pipeline')
    const dataService = DataService.getInstance()
    const result = await dataService.unlockMatch(matchId, req.clientId)
    
    return apiResponse.success({
      success: result.success,
      message: result.alreadyUnlocked 
        ? 'Match is already unlocked' 
        : 'Match unlocked successfully',
      remainingCredits: result.remainingCredits,
      alreadyUnlocked: result.alreadyUnlocked,
      requestId: req.context?.requestId
    })
  }

  // Legacy implementation would go here
  return apiResponse.error('DataService required for pipeline unlock')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use new RequestPipeline if feature flag is enabled
  if (Features.USE_REQUEST_PIPELINE) {
    logger.info('✨ Using new RequestPipeline for unlock operation')
    
    const pipeline = createAuthenticatedPipeline('client', {
      enableRateLimit: true,
      enableLogging: true,
      rateLimit: {
        windowMs: 60 * 1000, // 1 minute window for unlock operations
        max: 10 // Max 10 unlocks per minute per client
      }
    })

    return pipeline.execute(request, unlockMatchHandler, { params })
  }

  // Legacy implementation (existing code)
  try {
    logger.info('🔓 Unlock request for match:', params.id)
    logger.info('📊 DataService enabled:', Features.USE_NEW_DATA_SERVICE)
    logger.info('🚨 ErrorManager enabled:', Features.USE_ERROR_MANAGER)
    
    // Get client session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(AUTH_COOKIES.CLIENT)
    
    if (!sessionCookie) {
      return apiResponse.unauthorized()
    }

    const session = JSON.parse(sessionCookie.value)
    const { clientId } = session

    if (!clientId) {
      return apiResponse.error('Client ID not found')
    }

    // Use new DataService if feature flag is enabled
    if (Features.USE_NEW_DATA_SERVICE) {
      logger.info('✨ Using new DataService for unlock operation')
      
      try {
        const dataService = DataService.getInstance()
        const result = await dataService.unlockMatch(params.id, clientId)
        
        return apiResponse.success({
          success: result.success,
          message: result.alreadyUnlocked 
            ? 'Match is already unlocked' 
            : 'Match unlocked successfully',
          remainingCredits: result.remainingCredits,
          alreadyUnlocked: result.alreadyUnlocked
        })
      } catch (error) {
        // Handle specific error types
        if (error instanceof InsufficientCreditsError) {
          return apiResponse.error('Insufficient credits. Please purchase more credits.')
        }
        if (error instanceof ValidationError) {
          return apiResponse.error(error.message)
        }
        if (error instanceof NotFoundError) {
          return apiResponse.notFound('Match')
        }
        
        // For any other errors, fall back to legacy if in development
        if (process.env.NODE_ENV === 'development') {
          logger.error('❌ DataService error, falling back to legacy:', error)
          // Continue to legacy code below
        } else {
          throw error // Re-throw in production
        }
      }
    }

    // ========== LEGACY CODE (to be removed after full migration) ==========
    logger.info('📦 Using legacy database operations')
    
    const supabase = createServiceClient()

    // Check client has enough credits
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, match_credits')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return apiResponse.notFound('Client')
    }

    logger.info('📊 Client credits:', client.match_credits)
    
    if (!client.match_credits || client.match_credits < 1) {
      return apiResponse.error('Insufficient credits. Please purchase more credits.')
    }

    // First, check if the match exists at all
    const { data: matchExists, error: matchExistsError } = await supabase
      .from('matches')
      .select('id, status, designer_id, client_id, brief_id')
      .eq('id', params.id)
      .single()

    if (matchExistsError || !matchExists) {
      logger.error('❌ Match does not exist at all:', matchExistsError)
      logger.error('❌ Match ID:', params.id)
      return apiResponse.notFound('Match')
    }

    logger.info('📋 Match found:', {
      matchId: matchExists.id,
      matchClientId: matchExists.client_id,
      currentClientId: clientId,
      briefId: matchExists.brief_id,
      status: matchExists.status
    })

    // Check if the match belongs to this client OR if it's associated with a brief created by this client
    let match = matchExists
    let isAuthorized = false

    // Direct client_id match
    if (matchExists.client_id === clientId) {
      isAuthorized = true
    } else if (matchExists.brief_id) {
      // Check if the brief belongs to this client
      const { data: brief } = await supabase
        .from('briefs')
        .select('client_id')
        .eq('id', matchExists.brief_id)
        .single()

      if (brief && brief.client_id === clientId) {
        isAuthorized = true
        logger.info('✅ Match authorized via brief ownership')
      }
    }

    if (!isAuthorized) {
      logger.error('❌ Match does not belong to this client')
      logger.error('❌ Match client_id:', matchExists.client_id)
      logger.error('❌ Current client_id:', clientId)
      return apiResponse.error('You are not authorized to unlock this match')
    }

    logger.info('🔍 Match status:', match.status)
    
    if (match.status === 'unlocked' || match.status === 'accepted') {
      return apiResponse.success({
        success: true,
        message: 'Match is already unlocked',
        remainingCredits: client.match_credits,
        alreadyUnlocked: true
      })
    }
    
    if (match.status !== 'pending') {
      return apiResponse.error('Match unavailable')
    }

    // Start transaction: deduct credit and unlock match
    // Deduct credit
    const { error: creditError } = await supabase
      .from('clients')
      .update({ match_credits: client.match_credits - 1 })
      .eq('id', clientId)

    if (creditError) {
      throw creditError
    }

    // Update match status and ensure client_id is set
    const updateData: any = { status: 'unlocked' }
    
    // If the match doesn't have a client_id, set it now
    if (!match.client_id) {
      updateData.client_id = clientId
      logger.info('📝 Setting client_id on match record')
    }
    
    const { error: matchUpdateError } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', params.id)

    if (matchUpdateError) {
      // Rollback credit deduction
      await supabase
        .from('clients')
        .update({ match_credits: client.match_credits })
        .eq('id', clientId)
      
      throw matchUpdateError
    }

    // Record the unlock
    const { error: unlockError } = await supabase
      .from('match_unlocks')
      .insert({
        match_id: params.id,
        client_id: clientId,
        amount: 0, // Using credit, not direct payment
      })

    if (unlockError) {
      logger.error('Error recording unlock:', unlockError)
    }

    // Track this designer as unlocked by this client to prevent future matches
    // First check if the record already exists
    const { data: existingRecord } = await supabase
      .from('client_designers')
      .select('id')
      .eq('client_id', clientId)
      .eq('designer_id', match.designer_id)
      .single()
    
    if (!existingRecord) {
      // Only insert if it doesn't exist
      const { error: clientDesignerError } = await supabase
        .from('client_designers')
        .insert({
          client_id: clientId,
          designer_id: match.designer_id,
          unlocked_at: new Date().toISOString()
        })
      
      if (clientDesignerError) {
        logger.error('Error tracking unlocked designer:', clientDesignerError)
      } else {
        logger.info('✅ Tracked designer as unlocked for client')
      }
    } else {
      logger.info('✅ Designer already tracked as unlocked for this client')
    }

    return apiResponse.success({
      success: true,
      message: 'Match unlocked successfully',
      remainingCredits: client.match_credits - 1
    })
  } catch (error) {
    // Use new ErrorManager if feature flag is enabled
    if (Features.USE_ERROR_MANAGER) {
      logger.info('✨ Using new ErrorManager for error handling')
      return handleApiErrorNew(error, 'client/matches/[id]/unlock', {
        clientId,
        matchId: params.id,
        operation: 'unlock_match'
      })
    }
    
    // Legacy error handling
    return handleApiError(error, 'client/matches/[id]/unlock')
  }
}