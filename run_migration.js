const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addMatchDataColumn() {
  try {
    console.log('Adding match_data column to matches table...')
    
    // Add the column
    const { data, error } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_data JSONB DEFAULT '{}';
        CREATE INDEX IF NOT EXISTS idx_matches_match_data ON matches USING GIN (match_data);
        UPDATE matches SET match_data = '{}' WHERE match_data IS NULL;
      `
    })

    if (error) {
      console.error('Error running migration:', error)
    } else {
      console.log('✅ Migration completed successfully!')
      console.log('Result:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

addMatchDataColumn()