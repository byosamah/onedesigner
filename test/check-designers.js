const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDesigners() {
  console.log('🔍 Checking all designers...');
  
  try {
    const { data: designers, error } = await supabase
      .from('designers')
      .select('id, first_name, last_name, email, is_approved')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching designers:', error);
      return;
    }
    
    console.log(`\n📊 Found ${designers.length} designers:\n`);
    designers.forEach(d => {
      console.log(`- ${d.first_name} ${d.last_name} (${d.email}) - Approved: ${d.is_approved}`);
    });
    
    // Check for Paul specifically
    const { data: pauls } = await supabase
      .from('designers')
      .select('id, first_name, last_name, email')
      .ilike('first_name', '%paul%');
    
    if (pauls && pauls.length > 0) {
      console.log('\n🔍 Designers with "Paul" in name:');
      pauls.forEach(p => {
        console.log(`- ${p.first_name} ${p.last_name} (${p.email}) - ID: ${p.id}`);
      });
    } else {
      console.log('\n❌ No designers with "Paul" in name found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDesigners();