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

async function checkDatabase() {
  // Check briefs
  const { data: briefs, error: briefsError } = await supabase
    .from('briefs')
    .select('id, project_type, industry, created_at, client_id')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('\n=== Recent Briefs ===')
  if (briefsError) {
    console.error('Error fetching briefs:', briefsError)
  } else {
    console.log('Total briefs found:', briefs?.length || 0)
    briefs?.forEach(brief => {
      console.log(`- ID: ${brief.id}, Project: ${brief.project_type}, Industry: ${brief.industry}`)
    })
  }

  // Check matches
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, brief_id, designer_id, score, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('\n=== Recent Matches ===')
  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
  } else {
    console.log('Total matches found:', matches?.length || 0)
    matches?.forEach(match => {
      console.log(`- Match ID: ${match.id}, Brief: ${match.brief_id}, Score: ${match.score}`)
    })
  }

  // Check designers
  const { data: designers, error: designersError } = await supabase
    .from('designers')
    .select('id, first_name, last_name, is_verified')
    .eq('is_verified', true)
    .limit(5)

  console.log('\n=== Verified Designers ===')
  if (designersError) {
    console.error('Error fetching designers:', designersError)
  } else {
    console.log('Total verified designers found:', designers?.length || 0)
    designers?.forEach(designer => {
      console.log(`- ${designer.first_name} ${designer.last_name} (ID: ${designer.id})`)
    })
  }
}

checkDatabase().catch(console.error)