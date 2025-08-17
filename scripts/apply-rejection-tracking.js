const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Applying rejection tracking migration...\n');
  
  try {
    // First, check what columns already exist
    console.log('📊 Checking current table structure...');
    const { data: testData, error: testError } = await supabase
      .from('designers')
      .select('id, status, rejection_seen, rejection_count, last_rejection_at, resubmitted_at')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('column')) {
        console.log('❌ Some or all new columns do not exist yet');
        console.log('⚠️  The ALTER TABLE statements need to be run directly in Supabase SQL Editor\n');
        
        console.log('🔧 Please follow these steps:');
        console.log('1. Go to https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new');
        console.log('2. Copy and paste the SQL below');
        console.log('3. Click "Run" to execute the migration\n');
        
        console.log('━━━━━━━━━━━━ COPY THIS SQL ━━━━━━━━━━━━');
        console.log(`
-- Add status column to track designer application state
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Add columns for tracking rejection feedback visibility
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS rejection_seen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rejection_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_rejection_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP;

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_designers_status ON designers(status);
`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        console.log('After running the ALTER TABLE statements, run this script again to update the data.');
        return;
      }
    }
    
    console.log('✅ New columns exist! Now updating data...\n');
    
    // Update status based on current state
    console.log('📝 Updating status for approved designers...');
    const { data: approved, error: approvedError } = await supabase
      .from('designers')
      .update({ status: 'approved' })
      .eq('is_approved', true)
      .select();
    console.log(`✅ Updated ${approved?.length || 0} approved designers`);
    
    console.log('📝 Updating status for rejected designers...');
    const { data: rejected, error: rejectedError } = await supabase
      .from('designers')
      .update({ 
        status: 'rejected',
        rejection_count: 1,
        last_rejection_at: new Date().toISOString()
      })
      .eq('is_approved', false)
      .not('rejection_reason', 'is', null)
      .select();
    console.log(`✅ Updated ${rejected?.length || 0} rejected designers`);
    
    console.log('📝 Updating status for pending designers...');
    const { data: pending, error: pendingError } = await supabase
      .from('designers')
      .update({ status: 'pending' })
      .eq('is_approved', false)
      .is('rejection_reason', null)
      .select();
    console.log(`✅ Updated ${pending?.length || 0} pending designers`);
    
    // Verify the migration
    console.log('\n🔍 Verifying migration results...');
    const { data: stats, error: statsError } = await supabase
      .from('designers')
      .select('status');
    
    if (stats) {
      const statusCounts = stats.reduce((acc, item) => {
        acc[item.status || 'null'] = (acc[item.status || 'null'] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Designer status distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} designers`);
      });
    }
    
    console.log('\n✨ Migration completed successfully!');
    console.log('The rejection tracking system is now ready to use.');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

applyMigration();