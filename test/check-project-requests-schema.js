const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProjectRequestsSchema() {
  console.log('🔍 Checking project_requests table schema...');
  
  try {
    // Get a sample row to see the structure
    const { data: sample, error } = await supabase
      .from('project_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing project_requests:', error);
      
      // Try designer_requests as fallback
      console.log('\n🔍 Checking designer_requests table...');
      const { data: designerSample, error: designerError } = await supabase
        .from('designer_requests')
        .select('*')
        .limit(1);
      
      if (designerError) {
        console.error('❌ Error accessing designer_requests:', designerError);
      } else if (designerSample && designerSample.length > 0) {
        console.log('✅ designer_requests table columns:', Object.keys(designerSample[0]));
        console.log('Sample data:', designerSample[0]);
      } else {
        console.log('✅ designer_requests table exists but is empty');
      }
      
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('✅ project_requests table columns:', Object.keys(sample[0]));
      console.log('\nSample data:', sample[0]);
    } else {
      console.log('✅ project_requests table exists but is empty');
      
      // Try to insert a test row to see what columns are required
      console.log('\n🧪 Testing insert...');
      const testId = require('crypto').randomUUID();
      
      const { data: testInsert, error: insertError } = await supabase
        .from('project_requests')
        .insert({
          id: testId,
          client_id: 'test-client-id',
          designer_id: 'test-designer-id',
          match_id: 'test-match-id',
          message: 'Test message',
          status: 'pending'
        })
        .select();
      
      if (insertError) {
        console.error('❌ Insert test failed:', insertError);
        console.log('Error details:', insertError.details || 'No details');
      } else {
        console.log('✅ Test insert successful:', testInsert);
        
        // Clean up
        await supabase
          .from('project_requests')
          .delete()
          .eq('id', testId);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProjectRequestsSchema();