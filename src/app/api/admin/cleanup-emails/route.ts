import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

export async function DELETE(request: NextRequest) {
  // Check for admin secret
  const secret = request.headers.get('x-admin-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  
  // Emails to remove should be passed in request body, not hardcoded
  // This endpoint is for administrative cleanup purposes
  const body = await request.json().catch(() => ({}))
  const emailsToRemove: string[] = body.emails || []

  if (emailsToRemove.length === 0) {
    return NextResponse.json({ error: 'No emails provided in request body' }, { status: 400 })
  }

  try {
    // Get designer IDs first
    const { data: designers } = await supabase
      .from('designers')
      .select('id, email')
      .in('email', emailsToRemove)

    const designerIds = designers?.map(d => d.id) || []
    
    logger.info('Found designers to remove:', designers)

    if (designerIds.length > 0) {
      // Delete related records first (foreign key constraints)
      
      // Delete project_requests (replaces designer_requests)
      const { error: requestError } = await supabase
        .from('project_requests')
        .delete()
        .in('designer_id', designerIds)

      if (requestError) logger.error('Error deleting project_requests:', requestError)

      // Delete client_designers
      const { error: clientDesignersError } = await supabase
        .from('client_designers')
        .delete()
        .in('designer_id', designerIds)
      
      if (clientDesignersError) logger.error('Error deleting client_designers:', clientDesignersError)

      // Delete matches
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .in('designer_id', designerIds)
      
      if (matchesError) logger.error('Error deleting matches:', matchesError)

      // Delete designer_embeddings
      const { error: embeddingsError } = await supabase
        .from('designer_embeddings')
        .delete()
        .in('designer_id', designerIds)
      
      if (embeddingsError) logger.error('Error deleting designer_embeddings:', embeddingsError)

      // Note: match_analytics removed - analytics moved to centralized system

      // Finally delete designers
      const { error: designerError } = await supabase
        .from('designers')
        .delete()
        .in('id', designerIds)
      
      if (designerError) {
        logger.error('Error deleting designers:', designerError)
        throw designerError
      }
    }

    // Also remove from clients table
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .in('email', emailsToRemove)
    
    if (clientError) logger.error('Error deleting clients:', clientError)

    // Remove OTP records (using centralized auth_tokens)
    const { error: otpError } = await supabase
      .from('auth_tokens')
      .delete()
      .in('email', emailsToRemove)

    if (otpError) logger.error('Error deleting OTPs:', otpError)

    return NextResponse.json({ 
      success: true, 
      message: `Removed ${designerIds.length} designers and related records`,
      removedEmails: emailsToRemove
    })
  } catch (error) {
    logger.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to cleanup emails' 
    }, { status: 500 })
  }
}