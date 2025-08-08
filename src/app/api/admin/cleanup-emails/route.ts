import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  // Check for admin secret
  const secret = request.headers.get('x-admin-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  
  const emailsToRemove = [
    'osamah96@gmail.com',
    'ftoordesignerpodcast@gmail.com',
    'osama.k@meemain.org'
  ]

  try {
    // Get designer IDs first
    const { data: designers } = await supabase
      .from('designers')
      .select('id, email')
      .in('email', emailsToRemove)

    const designerIds = designers?.map(d => d.id) || []
    
    console.log('Found designers to remove:', designers)

    if (designerIds.length > 0) {
      // Delete related records first (foreign key constraints)
      
      // Delete designer_requests
      const { error: requestError } = await supabase
        .from('designer_requests')
        .delete()
        .in('designer_id', designerIds)
      
      if (requestError) console.error('Error deleting designer_requests:', requestError)

      // Delete client_designers
      const { error: clientDesignersError } = await supabase
        .from('client_designers')
        .delete()
        .in('designer_id', designerIds)
      
      if (clientDesignersError) console.error('Error deleting client_designers:', clientDesignersError)

      // Delete matches
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .in('designer_id', designerIds)
      
      if (matchesError) console.error('Error deleting matches:', matchesError)

      // Delete designer_embeddings
      const { error: embeddingsError } = await supabase
        .from('designer_embeddings')
        .delete()
        .in('designer_id', designerIds)
      
      if (embeddingsError) console.error('Error deleting designer_embeddings:', embeddingsError)

      // Delete match_analytics
      const { error: analyticsError } = await supabase
        .from('match_analytics')
        .delete()
        .in('designer_id', designerIds)
      
      if (analyticsError) console.error('Error deleting match_analytics:', analyticsError)

      // Finally delete designers
      const { error: designerError } = await supabase
        .from('designers')
        .delete()
        .in('id', designerIds)
      
      if (designerError) {
        console.error('Error deleting designers:', designerError)
        throw designerError
      }
    }

    // Also remove from clients table
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .in('email', emailsToRemove)
    
    if (clientError) console.error('Error deleting clients:', clientError)

    // Remove OTP records
    const { error: otpError } = await supabase
      .from('custom_otps')
      .delete()
      .in('email', emailsToRemove)
    
    if (otpError) console.error('Error deleting OTPs:', otpError)

    return NextResponse.json({ 
      success: true, 
      message: `Removed ${designerIds.length} designers and related records`,
      removedEmails: emailsToRemove
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to cleanup emails' 
    }, { status: 500 })
  }
}