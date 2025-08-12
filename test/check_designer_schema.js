const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  // Get one designer row to check columns
  const { data, error } = await supabase
    .from('designers')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Current designer table columns:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('No designers found, inserting a test row to check schema...');
    
    const testDesigner = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'Designer',
      category: 'Graphic Design',
      is_approved: false,
      is_verified: false
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('designers')
      .insert([testDesigner])
      .select();
    
    if (insertError) {
      console.log('Insert error:', insertError);
    } else {
      console.log('Available columns:');
      console.log(Object.keys(insertData[0]));
      
      // Clean up test data
      await supabase
        .from('designers')
        .delete()
        .eq('email', 'test@example.com');
    }
  }
}

checkSchema();