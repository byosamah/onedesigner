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

async function getRecentBrief() {
  const { data: briefs, error } = await supabase
    .from('briefs')
    .select('id, project_type, industry, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('\nRecent Briefs:')
  briefs.forEach(brief => {
    console.log(`\nID: ${brief.id}`)
    console.log(`Project: ${brief.project_type}`)
    console.log(`Industry: ${brief.industry}`)
    console.log(`Created: ${new Date(brief.created_at).toLocaleString()}`)
  })

  if (briefs.length > 0) {
    console.log(`\n✅ Use this ID for testing: ${briefs[0].id}`)
  }
}

getRecentBrief().catch(console.error)