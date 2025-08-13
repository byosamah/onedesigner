const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('📦 Running migration to add update token columns...')
  
  try {
    // Test if columns already exist by trying to select them
    const { data: testData, error: testError } = await supabase
      .from('designers')
      .select('update_token, update_token_expires')
      .limit(1)
    
    if (!testError) {
      console.log('✅ Update token columns already exist!')
      return
    }
    
    console.log('❌ Columns do not exist, need to add them manually in Supabase dashboard')
    console.log('\n📝 SQL to run in Supabase SQL Editor:')
    console.log(`
-- Add update token columns for designer application updates
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS update_token TEXT,
ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_designers_update_token ON designers(update_token) WHERE update_token IS NOT NULL;

-- Add comments
COMMENT ON COLUMN designers.update_token IS 'Unique token for updating rejected applications';
COMMENT ON COLUMN designers.update_token_expires IS 'Expiration time for the update token';
    `)
    
    console.log('\n🔗 Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new')
    console.log('Paste the SQL above and run it.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

runMigration()