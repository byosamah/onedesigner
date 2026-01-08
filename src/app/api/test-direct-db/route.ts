import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Direct database test without cookies
export async function GET() {
  try {
    console.log('🔍 Testing direct database connection')
    
    // Use direct client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const matchId = 'd4a262ed-7dff-47e0-92ba-7a3be2cd8236'
    const clientId = '52cc18a2-8aaf-40c6-971a-4a4f876e1ff5'

    console.log('🔍 Querying match directly with service role key')
    console.log('Match ID:', matchId)
    console.log('Client ID:', clientId)

    // Direct query without the cookie-based client
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        id,
        score,
        status,
        reasons,
        personalized_reasons,
        created_at,
        designer:designers!matches_designer_id_fkey(
          id,
          first_name,
          last_initial,
          title,
          city,
          country,
          email,
          phone,
          website:website_url,
          bio,
          years_experience,
          rating,
          total_projects,
          styles,
          industries,
          avatar_url
        )
      `)
      .eq('id', matchId)
      .eq('client_id', clientId)
      .single()

    console.log('🔍 Direct query result:', { match, error })

    if (error || !match) {
      console.error('❌ Error with direct query:', error)
      return NextResponse.json({ 
        success: false, 
        error: error?.message || 'Match not found',
        debug: { matchId, clientId, queryError: error }
      })
    }

    // Test avatar URL accessibility
    let avatarAccessible = false
    if (match.designer?.avatar_url) {
      try {
        const avatarResponse = await fetch(match.designer.avatar_url, { method: 'HEAD' })
        avatarAccessible = avatarResponse.ok
        console.log('🔍 Avatar URL test:', match.designer.avatar_url, '→', avatarResponse.status)
      } catch (error) {
        console.log('🔍 Avatar URL test failed:', error)
      }
    }

    console.log('✅ Successfully fetched match with direct connection')
    console.log('🔍 Designer info:', {
      id: match.designer.id,
      firstName: match.designer.first_name,
      lastName: match.designer.last_initial,
      avatar_url: match.designer.avatar_url,
      avatarAccessible
    })

    return NextResponse.json({
      success: true,
      match,
      debug: {
        matchId,
        clientId,
        designerName: `${match.designer.first_name} ${match.designer.last_initial}`,
        avatarUrl: match.designer.avatar_url,
        avatarAccessible,
        databaseConnectionWorking: true
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error in direct DB test:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        databaseConnectionWorking: false
      }
    })
  }
}