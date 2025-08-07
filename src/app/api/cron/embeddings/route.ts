import { NextRequest, NextResponse } from 'next/server'
import { EmbeddingService } from '@/lib/matching/embedding-service'
import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// This endpoint should be called by a cron job service (e.g., Vercel Cron, GitHub Actions, or external service)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const headersList = headers()
    const cronSecret = headersList.get('x-cron-secret')
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[CRON] Starting embedding precomputation job...')
    
    const embeddingService = new EmbeddingService()
    const supabase = createServiceClient()
    
    // Task 1: Precompute designer embeddings
    await embeddingService.precomputeDesignerEmbeddings()
    
    // Task 2: Refresh materialized view for quick stats
    await supabase.rpc('refresh_designer_quick_stats')
    
    // Task 3: Clean expired cache entries
    const { data: cleanedEntries } = await supabase.rpc('clean_expired_cache')
    
    // Task 4: Update embedding for designers with changed metadata
    const { data: needsUpdate } = await supabase
      .from('designer_embeddings')
      .select('designer_id')
      .like('metadata_hash', 'needs_update_%')
      .limit(50) // Process in batches
    
    if (needsUpdate && needsUpdate.length > 0) {
      console.log(`[CRON] Updating ${needsUpdate.length} designer embeddings...`)
      
      for (const row of needsUpdate) {
        await embeddingService.calculateEmbeddingScore(row.designer_id, {
          styles: [], // Dummy brief for embedding generation
          industry: '',
          project_type: ''
        })
      }
    }
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      tasks: {
        embeddings_updated: needsUpdate?.length || 0,
        cache_entries_cleaned: cleanedEntries || 0,
        materialized_view_refreshed: true
      }
    }
    
    console.log('[CRON] Embedding job completed:', response)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('[CRON] Embedding job failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    service: 'embedding-cron',
    timestamp: new Date().toISOString()
  })
}