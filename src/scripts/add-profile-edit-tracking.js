const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addProfileEditTracking() {
  console.log('Adding profile edit tracking fields...')
  
  try {
    // Run the migration via RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        -- Add fields to track profile edits after approval
        ALTER TABLE designers 
        ADD COLUMN IF NOT EXISTS last_approved_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS edited_after_approval BOOLEAN DEFAULT FALSE;
        
        -- Update existing approved designers to have last_approved_at
        UPDATE designers 
        SET last_approved_at = updated_at 
        WHERE is_approved = true AND last_approved_at IS NULL;
      `
    })
    
    if (error) {
      console.error('Migration error:', error)
      
      // Try alternative approach - check if columns exist
      const { data: designers, error: fetchError } = await supabase
        .from('designers')
        .select('id, is_approved, edited_after_approval')
        .limit(1)
      
      if (fetchError) {
        console.log('Columns might not exist yet. Please run the migration manually in Supabase SQL editor.')
      } else {
        console.log('Columns seem to exist already:', designers)
      }
    } else {
      console.log('Migration completed successfully!')
    }
    
    // Test the new fields
    const { data: testData, error: testError } = await supabase
      .from('designers')
      .select('first_name, last_name, is_approved, edited_after_approval, last_approved_at')
      .limit(5)
    
    if (!testError) {
      console.log('\nSample data with new fields:')
      console.table(testData)
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

addProfileEditTracking()