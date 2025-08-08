import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔓 Unlock request for match:', params.id)
    
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

    console.log('📊 Client credits:', client.match_credits)
    
    if (!client.match_credits || client.match_credits < 1) {
      return apiResponse.error('Insufficient credits. Please purchase more credits.')
    }

    // Verify the match belongs to this client and is pending
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, status, designer_id')
      .eq('id', params.id)
      .eq('client_id', clientId)
      .single()

    if (matchError || !match) {
      console.error('❌ Match not found:', matchError)
      console.error('❌ Match ID:', params.id)
      console.error('❌ Client ID:', clientId)
      return apiResponse.notFound('Match')
    }

    console.log('🔍 Match status:', match.status)
    
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

    // Update match status
    const { error: matchUpdateError } = await supabase
      .from('matches')
      .update({ status: 'unlocked' })
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
      console.error('Error recording unlock:', unlockError)
    }

    return apiResponse.success({
      success: true,
      message: 'Match unlocked successfully',
      remainingCredits: client.match_credits - 1
    })
  } catch (error) {
    return handleApiError(error, 'client/matches/[id]/unlock')
  }
}