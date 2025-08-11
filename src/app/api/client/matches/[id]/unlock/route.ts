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

    // First, check if the match exists at all
    const { data: matchExists, error: matchExistsError } = await supabase
      .from('matches')
      .select('id, status, designer_id, client_id, brief_id')
      .eq('id', params.id)
      .single()

    if (matchExistsError || !matchExists) {
      console.error('❌ Match does not exist at all:', matchExistsError)
      console.error('❌ Match ID:', params.id)
      return apiResponse.notFound('Match')
    }

    console.log('📋 Match found:', {
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
        console.log('✅ Match authorized via brief ownership')
      }
    }

    if (!isAuthorized) {
      console.error('❌ Match does not belong to this client')
      console.error('❌ Match client_id:', matchExists.client_id)
      console.error('❌ Current client_id:', clientId)
      return apiResponse.error('You are not authorized to unlock this match')
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

    // Update match status and ensure client_id is set
    const updateData: any = { status: 'unlocked' }
    
    // If the match doesn't have a client_id, set it now
    if (!match.client_id) {
      updateData.client_id = clientId
      console.log('📝 Setting client_id on match record')
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
      console.error('Error recording unlock:', unlockError)
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
        console.error('Error tracking unlocked designer:', clientDesignerError)
      } else {
        console.log('✅ Tracked designer as unlocked for client')
      }
    } else {
      console.log('✅ Designer already tracked as unlocked for this client')
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