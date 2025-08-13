const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProjectRequestInsert() {
  console.log('🧪 Testing project_requests table insert...');
  
  try {
    // Get Paul Rodriguez
    const { data: designer } = await supabase
      .from('designers')
      .select('id, first_name, last_name')
      .eq('first_name', 'Paul')
      .eq('last_name', 'Rodriguez')
      .single();
    
    if (!designer) {
      console.log('❌ Paul Rodriguez not found');
      return;
    }
    
    console.log('✅ Found Paul Rodriguez:', designer.id);
    
    // Get a match with Paul
    const { data: match } = await supabase
      .from('matches')
      .select('id, client_id, brief_id')
      .eq('designer_id', designer.id)
      .limit(1)
      .single();
    
    if (!match) {
      console.log('❌ No match found for Paul Rodriguez');
      return;
    }
    
    console.log('✅ Found match:', match.id);
    
    // Test insert into project_requests
    const testMessage = `Hi Paul, I'm excited to work with you on my project. I'd love to discuss the details and get started as soon as possible.`;
    
    const { data: projectRequest, error: insertError } = await supabase
      .from('project_requests')
      .insert({
        client_id: match.client_id,
        designer_id: designer.id,
        match_id: match.id,
        brief_id: match.brief_id,
        message: testMessage,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting project request:', insertError);
      
      // Try to see what columns exist
      const { data: sample, error: sampleError } = await supabase
        .from('project_requests')
        .select('*')
        .limit(1);
      
      if (sample && sample.length > 0) {
        console.log('📊 Sample project_request structure:', Object.keys(sample[0]));
      }
    } else {
      console.log('✅ Successfully created project request:', projectRequest.id);
      
      // Clean up test data
      await supabase
        .from('project_requests')
        .delete()
        .eq('id', projectRequest.id);
      
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProjectRequestInsert();