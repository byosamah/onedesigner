const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRejectionFlow() {
  console.log('🧪 Testing rejection flow with existing columns...\n');
  
  try {
    // Check what columns we have available
    console.log('📊 Checking available columns...');
    const { data: sample, error: sampleError } = await supabase
      .from('designers')
      .select('*')
      .limit(1);
    
    if (sample && sample.length > 0) {
      const columns = Object.keys(sample[0]);
      console.log('Available columns:', columns.filter(col => 
        col.includes('reject') || 
        col.includes('status') || 
        col.includes('approved') ||
        col.includes('update_token')
      ).join(', '));
    }
    
    // Test if we can work with existing columns
    console.log('\n📝 Testing rejection with existing columns...');
    
    // Find a test designer (non-approved)
    const { data: testDesigner, error: findError } = await supabase
      .from('designers')
      .select('id, email, first_name, is_approved, rejection_reason')
      .eq('is_approved', false)
      .limit(1)
      .single();
    
    if (testDesigner) {
      console.log(`Found test designer: ${testDesigner.first_name} (${testDesigner.email})`);
      
      // Simulate rejection using existing columns
      console.log('Simulating rejection...');
      const { data: updated, error: updateError } = await supabase
        .from('designers')
        .update({
          is_approved: false,
          rejection_reason: 'Test rejection - Please improve portfolio examples'
        })
        .eq('id', testDesigner.id)
        .select()
        .single();
      
      if (updated) {
        console.log('✅ Successfully updated designer with rejection');
        console.log('  - is_approved:', updated.is_approved);
        console.log('  - rejection_reason:', updated.rejection_reason);
      }
      
      // Check if we can determine status from existing columns
      console.log('\n📊 Deriving status from existing columns:');
      const derivedStatus = 
        updated.is_approved === true ? 'approved' :
        updated.rejection_reason ? 'rejected' :
        'pending';
      console.log(`  Derived status: ${derivedStatus}`);
      
      console.log('\n✨ The rejection flow can work with existing columns!');
      console.log('The app will derive the status from is_approved and rejection_reason.');
      
    } else {
      console.log('⚠️  No test designer found');
    }
    
    // Show how the app handles missing columns
    console.log('\n📝 Fallback strategy for missing columns:');
    console.log('1. status → derived from is_approved and rejection_reason');
    console.log('2. rejection_seen → stored in localStorage or session');
    console.log('3. rejection_count → calculated from rejection history');
    console.log('4. last_rejection_at → use updated_at when rejection_reason exists');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testRejectionFlow();