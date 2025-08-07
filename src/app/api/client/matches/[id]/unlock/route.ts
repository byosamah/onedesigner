import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔓 Unlock request for match:', params.id)
    
    // Get client session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('client-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const { clientId } = session

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID not found' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check client has enough credits
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, match_credits')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    console.log('📊 Client credits:', client.match_credits)
    
    if (!client.match_credits || client.match_credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits.' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Match status:', match.status)
    
    if (match.status === 'unlocked' || match.status === 'accepted') {
      return NextResponse.json({
        success: true,
        message: 'Match is already unlocked',
        remainingCredits: client.match_credits,
        alreadyUnlocked: true
      })
    }
    
    if (match.status !== 'pending') {
      return NextResponse.json(
        { error: 'Match unavailable' },
        { status: 400 }
      )
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

    return NextResponse.json({
      success: true,
      message: 'Match unlocked successfully',
      remainingCredits: client.match_credits - 1
    })
  } catch (error) {
    console.error('Error unlocking match:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlock match' },
      { status: 500 }
    )
  }
}