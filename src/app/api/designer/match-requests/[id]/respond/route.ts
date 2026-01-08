import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate designer session
    const sessionResult = await validateSession('DESIGNER')
    if (!sessionResult.success || !sessionResult.designerId) {
      return apiResponse.unauthorized()
    }

    const { response, message } = await request.json()
    
    if (!response || !['accept', 'decline'].includes(response)) {
      return apiResponse.error('Invalid response. Must be "accept" or "decline"')
    }

    const matchId = params.id
    const designerId = sessionResult.designerId
    const supabase = createServiceClient()

    // Verify the match belongs to this designer
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*, brief:briefs(*)')
      .eq('id', matchId)
      .eq('designer_id', designerId)
      .single()

    if (matchError || !match) {
      logger.error('Match not found:', matchError)
      return apiResponse.notFound('Match request')
    }

    // Update match status based on response
    const newStatus = response === 'accept' ? 'accepted' : 'declined'
    
    const { error: updateError } = await supabase
      .from('matches')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)

    if (updateError) {
      logger.error('Error updating match:', updateError)
      return apiResponse.error('Failed to update match status')
    }

    // If accepted, create a designer request record (if the table exists)
    if (response === 'accept') {
      // Try to create a designer request (will fail silently if table doesn't exist)
      const { error: requestError } = await supabase
        .from('project_requests')
        .insert({
          match_id: matchId,
          designer_id: designerId,
          client_id: match.brief?.client_id,
          brief_id: match.brief_id,
          status: 'accepted'
        })

      if (requestError) {
        logger.info('Could not create designer request (table may not exist):', requestError.message)
      }
    }

    // Send notification email to client (if we have their email)
    if (match.brief?.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('email')
        .eq('id', match.brief.client_id)
        .single()

      if (client?.email) {
        // TODO: Send email notification
        logger.info(`TODO: Send ${response} notification to client:`, client.email)
      }
    }

    logger.info(`✅ Match ${matchId} ${response}ed successfully`)

    return apiResponse.success({
      message: `Match request ${response}ed successfully`,
      status: newStatus
    })

  } catch (error) {
    return handleApiError(error, 'designer/match-requests/respond')
  }
}