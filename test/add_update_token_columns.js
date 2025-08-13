import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addUpdateTokenColumns() {
  console.log('📦 Adding update token columns to designers table...')
  
  try {
    // Use RPC to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add update token columns if they don't exist
        ALTER TABLE designers
        ADD COLUMN IF NOT EXISTS update_token TEXT,
        ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
        
        -- Create index for faster token lookups
        CREATE INDEX IF NOT EXISTS idx_designers_update_token ON designers(update_token) WHERE update_token IS NOT NULL;
      `
    })
    
    if (error) {
      // Try a different approach - add columns one by one
      console.log('📝 Direct SQL execution failed, trying alternative approach...')
      
      // Test if columns already exist
      const { data: testData, error: testError } = await supabase
        .from('designers')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('❌ Cannot access designers table:', testError)
        return
      }
      
      console.log(`
❗ The columns need to be added manually. Please run this SQL in the Supabase dashboard:

-- Add update token columns for designer application updates
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS update_token TEXT,
ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_designers_update_token ON designers(update_token) WHERE update_token IS NOT NULL;

-- Add comments
COMMENT ON COLUMN designers.update_token IS 'Unique token for updating rejected applications';
COMMENT ON COLUMN designers.update_token_expires IS 'Expiration time for the update token';
COMMENT ON COLUMN designers.rejection_reason IS 'Reason for rejection provided by admin';

🔗 Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new
      `)
    } else {
      console.log('✅ Update token columns added successfully!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log(`
Please add the columns manually in Supabase SQL Editor:

ALTER TABLE designers
ADD COLUMN IF NOT EXISTS update_token TEXT,
ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_designers_update_token ON designers(update_token) WHERE update_token IS NOT NULL;
    `)
  }
}

addUpdateTokenColumns()