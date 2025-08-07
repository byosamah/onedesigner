import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get client session from cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('client-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const { clientId, email } = session

    // Get brief data from request
    const briefData = await request.json()

    // Validate required fields
    if (!briefData.projectType || !briefData.industry || !briefData.timeline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get or create client if needed
    let finalClientId = clientId
    if (!finalClientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single()
      
      finalClientId = client?.id
    }

    if (!finalClientId) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Create the brief
    const { data: brief, error } = await supabase
      .from('briefs')
      .insert({
        client_id: finalClientId,
        project_type: briefData.projectType,
        industry: briefData.industry,
        timeline: briefData.timeline,
        budget: briefData.budget,
        styles: briefData.styles || [],
        inspiration: briefData.inspiration,
        requirements: briefData.requirements,
        timezone: briefData.timezone,
        communication: briefData.communication || ['email'],
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating brief:', error)
      throw error
    }

    console.log('Brief created successfully:', brief)

    // Trigger matching process
    try {
      const matchResponse = await fetch(`${request.nextUrl.origin}/api/match/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId: brief.id }),
      })

      if (matchResponse.ok) {
        const matchData = await matchResponse.json()
        console.log('Match found:', matchData)
      }
    } catch (matchError) {
      console.error('Error creating match:', matchError)
      // Don't fail the whole request if matching fails
    }

    return NextResponse.json({ 
      success: true, 
      brief 
    })
  } catch (error) {
    console.error('Error in create brief:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create brief' },
      { status: 500 }
    )
  }
}