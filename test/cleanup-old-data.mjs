import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanupOldData() {
  console.log('\n=== Cleaning up old test data ===\n')

  // Delete old auth tokens
  const { error: authError } = await supabase
    .from('auth_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString())

  if (!authError) {
    console.log('✓ Cleaned up expired auth tokens')
  }

  // Delete old matches without unlocks (older than 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  const { data: oldMatches } = await supabase
    .from('matches')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', oneHourAgo)

  if (oldMatches && oldMatches.length > 0) {
    console.log(`Found ${oldMatches.length} old pending matches to clean up`)
    
    // Delete related designer requests first
    for (const match of oldMatches) {
      await supabase
        .from('designer_requests')
        .delete()
        .eq('match_id', match.id)
    }
    
    // Then delete the matches
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', oneHourAgo)
      
    if (!matchError) {
      console.log('✓ Cleaned up old matches')
    }
  }

  console.log('\n✅ Cleanup completed')
}

cleanupOldData().catch(console.error)