const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndApplyMigration() {
  console.log('🔍 Checking Working Request System Migration Status...\n');
  
  try {
    // First, check if columns already exist
    const { data: existingRequest, error: checkError } = await supabase
      .from('project_requests')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('❌ Error checking table:', checkError.message);
      return;
    }
    
    // Check which columns exist
    const columns = existingRequest && existingRequest.length > 0 ? Object.keys(existingRequest[0]) : [];
    
    const requiredColumns = ['viewed_at', 'response_deadline', 'brief_snapshot'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist!');
      console.log('   - viewed_at ✓');
      console.log('   - response_deadline ✓');
      console.log('   - brief_snapshot ✓');
      console.log('\n🎉 Working Request System is ready to use!');
      return;
    }
    
    console.log('⚠️ Missing columns:', missingColumns.join(', '));
    console.log('\n📝 Migration needed. Please follow these steps:\n');
    console.log('1. Go to Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new\n');
    console.log('2. Copy and paste this SQL:\n');
    console.log('----------------------------------------');
    
    // Generate only the needed SQL
    if (missingColumns.includes('viewed_at')) {
      console.log('ALTER TABLE public.project_requests ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE;');
    }
    if (missingColumns.includes('response_deadline')) {
      console.log('ALTER TABLE public.project_requests ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP WITH TIME ZONE;');
    }
    if (missingColumns.includes('brief_snapshot')) {
      console.log('ALTER TABLE public.project_requests ADD COLUMN IF NOT EXISTS brief_snapshot JSONB;');
    }
    
    console.log('\n-- Add indexes for better performance');
    console.log('CREATE INDEX IF NOT EXISTS idx_project_requests_deadline ON public.project_requests(response_deadline) WHERE status = \'pending\';');
    console.log('CREATE INDEX IF NOT EXISTS idx_project_requests_viewed ON public.project_requests(viewed_at) WHERE viewed_at IS NOT NULL;');
    
    console.log('\n-- Create trigger for auto-setting deadline');
    console.log(`CREATE OR REPLACE FUNCTION set_response_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.response_deadline IS NULL THEN
    NEW.response_deadline := NEW.created_at + INTERVAL '72 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_response_deadline ON public.project_requests;
CREATE TRIGGER trigger_set_response_deadline
  BEFORE INSERT ON public.project_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_response_deadline();`);
    
    console.log('----------------------------------------\n');
    console.log('3. Click "Run" to execute the SQL');
    console.log('4. Come back and run this script again to verify');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test if we can create a project request with new fields
async function testNewFields() {
  console.log('\n📊 Testing new fields functionality...\n');
  
  try {
    // Try to create a test entry with new fields
    const testData = {
      match_id: '00000000-0000-0000-0000-000000000000',
      client_id: '00000000-0000-0000-0000-000000000000',
      designer_id: '00000000-0000-0000-0000-000000000000',
      message: 'TEST - Working Request System Check',
      status: 'pending',
      brief_snapshot: { test: true },
      response_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
    };
    
    const { data, error } = await supabase
      .from('project_requests')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ New columns not yet added to database');
      } else if (error.message.includes('violates foreign key constraint')) {
        console.log('✅ New columns exist! (Test insert failed due to foreign keys, which is expected)');
      } else {
        console.log('⚠️ Unexpected error:', error.message);
      }
    } else {
      console.log('✅ Test entry created successfully with new fields!');
      // Clean up test entry
      if (data?.id) {
        await supabase.from('project_requests').delete().eq('id', data.id);
        console.log('   (Test entry cleaned up)');
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run checks
async function main() {
  await checkAndApplyMigration();
  await testNewFields();
}

main();