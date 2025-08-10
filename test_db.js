const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Try to check the current schema of matches table
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error accessing matches table:', error)
    } else {
      console.log('✅ Database connection successful!')
      console.log('Sample match record structure:', Object.keys(data[0] || {}))
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()