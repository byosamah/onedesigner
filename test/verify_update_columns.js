import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyColumns() {
  console.log('🔍 Checking designers table columns...\n')
  
  try {
    // Try to select the columns we need
    const { data, error } = await supabase
      .from('designers')
      .select('id, email, update_token, update_token_expires, rejection_reason')
      .limit(1)
    
    if (error) {
      // Check which specific columns are missing
      const missingColumns = []
      
      // Test each column individually
      const { error: tokenError } = await supabase
        .from('designers')
        .select('update_token')
        .limit(1)
      
      if (tokenError) {
        missingColumns.push('update_token')
      }
      
      const { error: expiresError } = await supabase
        .from('designers')
        .select('update_token_expires')
        .limit(1)
      
      if (expiresError) {
        missingColumns.push('update_token_expires')
      }
      
      const { error: reasonError } = await supabase
        .from('designers')
        .select('rejection_reason')
        .limit(1)
      
      if (reasonError) {
        missingColumns.push('rejection_reason')
      }
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing columns:', missingColumns.join(', '))
        console.log('\n📝 Please run this SQL in Supabase SQL Editor:\n')
        console.log('-- Add missing columns to designers table')
        console.log('ALTER TABLE designers')
        
        if (missingColumns.includes('update_token')) {
          console.log('ADD COLUMN IF NOT EXISTS update_token TEXT,')
        }
        if (missingColumns.includes('update_token_expires')) {
          console.log('ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE,')
        }
        if (missingColumns.includes('rejection_reason')) {
          console.log('ADD COLUMN IF NOT EXISTS rejection_reason TEXT;')
        } else {
          // Remove the last comma and add semicolon
          console.log('-- Note: Remove the trailing comma from the last ADD COLUMN line and add a semicolon')
        }
        
        console.log('\n-- Create index for faster token lookups')
        console.log('CREATE INDEX IF NOT EXISTS idx_designers_update_token')
        console.log('ON designers(update_token) WHERE update_token IS NOT NULL;')
        
        console.log('\n🔗 Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new')
        console.log('Copy and paste the SQL above, then run it.')
      } else {
        console.log('✅ All required columns exist!')
      }
    } else {
      console.log('✅ All required columns exist!')
      console.log('\nColumns verified:')
      console.log('  ✓ update_token')
      console.log('  ✓ update_token_expires')
      console.log('  ✓ rejection_reason')
      
      console.log('\n🎉 The designer update application feature is fully enabled!')
      console.log('\nYou can now:')
      console.log('  1. Reject designers from the admin dashboard with feedback')
      console.log('  2. Designers receive professional rejection emails')
      console.log('  3. Designers can update their applications via the link')
      console.log('  4. Updated applications appear for admin review')
    }
    
  } catch (error) {
    console.error('❌ Error checking columns:', error.message)
  }
}

verifyColumns()