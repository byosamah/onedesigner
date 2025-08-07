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

async function checkMatches() {
  // Get recent matches with designer info
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      designer:designers(first_name, last_name, availability),
      brief:briefs(project_type, industry)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\nFound ${matches.length} recent matches:\n`)
  
  matches.forEach(match => {
    console.log(`Match ID: ${match.id}`)
    console.log(`Brief: ${match.brief.project_type} - ${match.brief.industry}`)
    console.log(`Designer: ${match.designer.first_name} ${match.designer.last_name}`)
    console.log(`Score: ${match.score}`)
    console.log(`Status: ${match.status}`)
    console.log(`Created: ${new Date(match.created_at).toLocaleString()}`)
    console.log('---')
  })

  // Check for duplicate matches
  const { data: duplicates } = await supabase
    .from('matches')
    .select('brief_id, designer_id, count')
    .select('*', { count: 'exact', head: true })

  console.log(`\nTotal matches in database: ${duplicates}`)
}

checkMatches().catch(console.error)