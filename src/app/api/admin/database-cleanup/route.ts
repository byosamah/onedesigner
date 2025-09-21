import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  // Check for admin secret
  const secret = request.headers.get('x-admin-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const cleanupResults = []

  try {
    logger.info('🧹 Starting database cleanup...')

    // Phase 1: Safe removal of clearly legacy tables
    const legacyTables = [
      'custom_otps',      // Replaced by auth_tokens (OTPService)
      'match_unlocks',    // Functionality moved to client_designers
      'designer_requests', // Replaced by project_requests
      'credit_purchases', // Purchase tracking moved to payments
      'match_analytics',  // Analytics moved to centralized system
      'activity_log',     // Replaced by centralized LoggingService
      'conversations',    // Replaced by Working Request System
      'messages',         // Messaging replaced by Working Requests
      'admin_users',      // Admin hardcoded as osamah96@gmail.com
      'blog_posts'        // Blog feature marked for removal
    ]

    // Check which tables actually exist before trying to drop them
    const { data: existingTables } = await supabase
      .rpc('get_table_list') // This won't work, let's try a different approach

    // Try to drop each table if it exists
    for (const tableName of legacyTables) {
      try {
        // Check if table exists by trying to select from it
        const { error: checkError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (checkError) {
          if (checkError.message.includes('does not exist')) {
            cleanupResults.push(`✅ ${tableName}: Already removed`)
            continue
          } else {
            cleanupResults.push(`⚠️ ${tableName}: Error checking existence - ${checkError.message}`)
            continue
          }
        }

        // Table exists, so we can't drop it via Supabase client
        // We'll just log this for manual cleanup
        cleanupResults.push(`📋 ${tableName}: Exists - needs manual removal via SQL`)

      } catch (error) {
        cleanupResults.push(`❌ ${tableName}: Error - ${error}`)
      }
    }

    // Analyze remaining tables
    const { data: tablesInfo, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')

    if (!tablesError && tablesInfo) {
      cleanupResults.push(`📊 Current tables count: ${tablesInfo.length}`)
      cleanupResults.push(`📋 Remaining tables: ${tablesInfo.map(t => t.table_name).join(', ')}`)
    }

    logger.info('✅ Database cleanup analysis complete')

    return NextResponse.json({
      success: true,
      message: 'Database cleanup analysis completed',
      results: cleanupResults,
      note: 'Table drops require direct SQL access - use Supabase dashboard for actual cleanup'
    })

  } catch (error) {
    logger.error('❌ Database cleanup error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Database cleanup failed',
      results: cleanupResults
    }, { status: 500 })
  }
}