const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupAllData() {
  console.log('🧹 Starting cleanup of all test data...\n')
  
  try {
    // Get all designers
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('id, email')
    
    if (designersError) {
      console.error('Error fetching designers:', designersError)
    } else {
      console.log(`Found ${designers.length} designers to delete:`)
      designers.forEach(d => console.log(`  - ${d.email}`))
      
      if (designers.length > 0) {
        // Delete all designers
        const { error: deleteDesignersError } = await supabase
          .from('designers')
          .delete()
          .in('id', designers.map(d => d.id))
        
        if (deleteDesignersError) {
          console.error('Error deleting designers:', deleteDesignersError)
        } else {
          console.log(`✅ Deleted ${designers.length} designers\n`)
        }
      }
    }
    
    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, email')
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
    } else {
      console.log(`Found ${clients.length} clients to delete:`)
      clients.forEach(c => console.log(`  - ${c.email}`))
      
      if (clients.length > 0) {
        // Delete all clients
        const { error: deleteClientsError } = await supabase
          .from('clients')
          .delete()
          .in('id', clients.map(c => c.id))
        
        if (deleteClientsError) {
          console.error('Error deleting clients:', deleteClientsError)
        } else {
          console.log(`✅ Deleted ${clients.length} clients\n`)
        }
      }
    }
    
    // Clean up auth_tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('auth_tokens')
      .select('id, email, type')
    
    if (tokensError) {
      console.error('Error fetching auth tokens:', tokensError)
    } else {
      console.log(`Found ${tokens.length} auth tokens to delete`)
      
      if (tokens.length > 0) {
        const { error: deleteTokensError } = await supabase
          .from('auth_tokens')
          .delete()
          .in('id', tokens.map(t => t.id))
        
        if (deleteTokensError) {
          console.error('Error deleting auth tokens:', deleteTokensError)
        } else {
          console.log(`✅ Deleted ${tokens.length} auth tokens\n`)
        }
      }
    }
    
    // Clean up briefs
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('id')
    
    if (briefsError) {
      console.error('Error fetching briefs:', briefsError)
    } else if (briefs.length > 0) {
      console.log(`Found ${briefs.length} briefs to delete`)
      
      const { error: deleteBriefsError } = await supabase
        .from('briefs')
        .delete()
        .in('id', briefs.map(b => b.id))
      
      if (deleteBriefsError) {
        console.error('Error deleting briefs:', deleteBriefsError)
      } else {
        console.log(`✅ Deleted ${briefs.length} briefs\n`)
      }
    }
    
    // Clean up matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id')
    
    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
    } else if (matches.length > 0) {
      console.log(`Found ${matches.length} matches to delete`)
      
      const { error: deleteMatchesError } = await supabase
        .from('matches')
        .delete()
        .in('id', matches.map(m => m.id))
      
      if (deleteMatchesError) {
        console.error('Error deleting matches:', deleteMatchesError)
      } else {
        console.log(`✅ Deleted ${matches.length} matches\n`)
      }
    }
    
    console.log('\n🎉 Cleanup completed successfully!')
    console.log('All test data has been removed from the database.')
    
  } catch (error) {
    console.error('Unexpected error during cleanup:', error)
  }
}

// Ask for confirmation
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('⚠️  WARNING: This will delete ALL data from the following tables:')
console.log('  - designers')
console.log('  - clients')
console.log('  - auth_tokens')
console.log('  - briefs')
console.log('  - matches')
console.log('')

rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    cleanupAllData().then(() => {
      rl.close()
    })
  } else {
    console.log('Cleanup cancelled.')
    rl.close()
  }
})