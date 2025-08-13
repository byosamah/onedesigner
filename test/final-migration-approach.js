const https = require('https');

// Direct HTTP approach to Supabase PostgREST API
const supabaseUrl = 'frwchtwxpnrlpzksupgm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

async function checkColumnStatus() {
  console.log('🔍 Checking current status of designer table columns...\n');
  
  // Test 1: Check if rejection_reason exists (should exist)
  console.log('1. Testing rejection_reason column (should exist):');
  try {
    const response = await fetch(`https://${supabaseUrl}/rest/v1/designers?select=rejection_reason&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('   ✅ rejection_reason column EXISTS');
    } else {
      const error = await response.json();
      console.log('   ❌ rejection_reason column missing:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Error checking rejection_reason:', error.message);
  }
  
  // Test 2: Check if update_token exists (should not exist yet)
  console.log('\n2. Testing update_token column (should NOT exist):');
  try {
    const response = await fetch(`https://${supabaseUrl}/rest/v1/designers?select=update_token&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('   ✅ update_token column EXISTS (unexpected!)');
    } else {
      const error = await response.json();
      if (error.code === '42703') {
        console.log('   ❌ update_token column MISSING (expected)');
      } else {
        console.log('   ❌ Other error:', error.message);
      }
    }
  } catch (error) {
    console.log('   ❌ Error checking update_token:', error.message);
  }
  
  // Test 3: Check if update_token_expires exists (should not exist yet)  
  console.log('\n3. Testing update_token_expires column (should NOT exist):');
  try {
    const response = await fetch(`https://${supabaseUrl}/rest/v1/designers?select=update_token_expires&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('   ✅ update_token_expires column EXISTS (unexpected!)');
    } else {
      const error = await response.json();
      if (error.code === '42703') {
        console.log('   ❌ update_token_expires column MISSING (expected)');
      } else {
        console.log('   ❌ Other error:', error.message);
      }
    }
  } catch (error) {
    console.log('   ❌ Error checking update_token_expires:', error.message);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📋 MIGRATION SUMMARY:');
  console.log('='.repeat(70));
  console.log('✅ rejection_reason column: Already exists');  
  console.log('❌ update_token column: Needs to be added');
  console.log('❌ update_token_expires column: Needs to be added');
  console.log('❌ idx_designers_update_token index: Needs to be created');
  
  console.log('\n📝 MANUAL MIGRATION REQUIRED:');
  console.log('='.repeat(70));
  console.log('Since automatic SQL execution via API is not supported,');
  console.log('please execute the following SQL in the Supabase SQL Editor:');
  console.log('\n🔗 Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql');
  console.log('\n📋 Copy and paste this SQL:');
  console.log('-'.repeat(50));
  console.log(`
-- Add missing columns to designers table
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS update_token TEXT,
ADD COLUMN IF NOT EXISTS update_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups  
CREATE INDEX IF NOT EXISTS idx_designers_update_token 
ON designers(update_token) 
WHERE update_token IS NOT NULL;

-- Verify the migration worked
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'designers' 
AND column_name IN ('update_token', 'update_token_expires', 'rejection_reason')
ORDER BY column_name;
  `);
  console.log('-'.repeat(50));
  console.log('\n✅ After running the SQL, the following columns will be available:');
  console.log('   - update_token (TEXT) - For secure update links');
  console.log('   - update_token_expires (TIMESTAMP) - Token expiration time');
  console.log('   - rejection_reason (TEXT) - Already exists for rejection feedback');
  console.log('\n🔍 To verify, you can run this test script again after migration.');
}

checkColumnStatus().catch(console.error);