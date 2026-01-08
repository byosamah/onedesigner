const { createClient } = require('@supabase/supabase-js')

// Load environment variables - NO FALLBACK SECRETS for security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing required environment variables')
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Example: SUPABASE_SERVICE_ROLE_KEY=your_key node src/scripts/add-profile-edit-tracking.js')
  process.exit(1)
}

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