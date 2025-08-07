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

async function debugMatch() {
  console.log('\n=== Debug Match Flow ===\n')

  // Step 1: Check if we have clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .limit(1)

  if (clientsError) {
    console.error('Error fetching clients:', clientsError)
    return
  }

  let clientId
  if (!clients || clients.length === 0) {
    console.log('No clients found. Creating test client...')
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        email: 'test@example.com',
        match_credits: 10
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating client:', createError)
      return
    }
    clientId = newClient.id
    console.log('Created test client:', newClient.email)
  } else {
    clientId = clients[0].id
    console.log('Using existing client:', clients[0].email)
  }

  // Step 2: Create a test brief
  console.log('\n--- Creating test brief ---')
  const { data: brief, error: briefError } = await supabase
    .from('briefs')
    .insert({
      client_id: clientId,
      project_type: 'Mobile App',
      industry: 'Technology',
      timeline: '2-3 months',
      budget: '$5000-10000',
      styles: ['Modern', 'Minimalist'],
      inspiration: 'Like Airbnb and Linear',
      requirements: 'Need a clean mobile app design',
      status: 'active'
    })
    .select()
    .single()

  if (briefError) {
    console.error('Error creating brief:', briefError)
    return
  }
  console.log('Created brief:', brief.id)

  // Step 3: Check designers
  console.log('\n--- Checking designers ---')
  const { data: designers, error: designersError } = await supabase
    .from('designers')
    .select('id, first_name, last_name, is_verified, availability')
    .eq('is_verified', true)
    .in('availability', ['available', 'busy'])
    .limit(5)

  if (designersError) {
    console.error('Error fetching designers:', designersError)
    return
  }

  console.log(`Found ${designers?.length || 0} verified designers:`)
  designers?.forEach(d => {
    console.log(`- ${d.first_name} ${d.last_name} (${d.availability})`)
  })

  // Step 4: Test the match API
  console.log('\n--- Testing match API ---')
  try {
    const response = await fetch('http://localhost:3000/api/match/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId: brief.id })
    })

    const responseText = await response.text()
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      console.error('Match API failed:', responseText)
    } else {
      const data = JSON.parse(responseText)
      console.log('Match found successfully!')
      console.log('Designer:', data.match.designer.firstName, data.match.designer.lastInitial)
      console.log('Score:', data.match.score)
      console.log('Reasons:', data.match.reasons)
    }
  } catch (error) {
    console.error('Error calling match API:', error)
  }

  // Step 5: Check matches table
  console.log('\n--- Checking matches table ---')
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('brief_id', brief.id)

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
  } else {
    console.log(`Found ${matches?.length || 0} matches for this brief`)
  }
}

debugMatch().catch(console.error)