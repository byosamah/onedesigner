const { createClient } = require('@supabase/supabase-js')

async function debugMatchNotFound() {
  console.log('🔍 Debugging Match Not Found Issue...\n')
  
  const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const testMatchId = '68c1e6c3-face-437e-8740-eb7435394e66'
  
  console.log('📋 **STEP 1: Check if match exists in database**')
  
  // Check if this exact match ID exists
  const { data: matchExists, error: matchError } = await supabase
    .from('matches')
    .select('id, client_id, designer_id, status, created_at')
    .eq('id', testMatchId)
  
  console.log('Match query result:', { matchExists, matchError })
  
  if (matchExists && matchExists.length > 0) {
    console.log('✅ Match exists:', matchExists[0])
  } else {
    console.log('❌ Match with ID', testMatchId, 'does NOT exist')
  }
  
  console.log('\n📋 **STEP 2: Check recent matches in database**')
  
  // Get any recent matches to see what's available
  const { data: recentMatches, error: recentError } = await supabase
    .from('matches')
    .select('id, client_id, designer_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
  
  console.log('Recent matches:', { recentMatches, recentError })
  
  if (recentMatches && recentMatches.length > 0) {
    console.log('\n✅ **AVAILABLE MATCH IDs TO TEST:**')
    recentMatches.forEach((match, index) => {
      console.log(`${index + 1}. Match ID: ${match.id}`)
      console.log(`   Client ID: ${match.client_id}`)
      console.log(`   Status: ${match.status}`)
      console.log(`   Created: ${match.created_at}`)
      console.log('')
    })
  } else {
    console.log('❌ No matches found in database!')
  }
  
  console.log('\n📋 **STEP 3: Check clients table**')
  
  // Check if we have any clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, email, match_credits, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  
  console.log('Recent clients:', { clients, clientsError })
  
  console.log('\n🎯 **SOLUTION RECOMMENDATIONS:**')
  
  if (!matchExists || matchExists.length === 0) {
    console.log('1. ❌ The match ID 68c1e6c3-face-437e-8740-eb7435394e66 does NOT exist')
    console.log('2. 🔧 You need to use one of the actual match IDs shown above')
    console.log('3. 🔧 Or create a new match by going to /brief and submitting a brief first')
  }
  
  if (!recentMatches || recentMatches.length === 0) {
    console.log('4. ❌ There are NO matches in the database at all!')
    console.log('5. 🔧 You need to create matches by submitting a brief at /brief')
  }
  
  console.log('\n💡 **NEXT STEPS:**')
  console.log('1. Go to /brief and create a new project brief')
  console.log('2. This will create a match with a real match ID')
  console.log('3. Use that match ID to test the avatar functionality')
}

debugMatchNotFound().catch(console.error)