const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function approveAllDesigners() {
  console.log('Approving all designers...');
  
  // Update all designers to be approved
  const { data, error } = await supabase
    .from('designers')
    .update({ 
      is_approved: true,
      is_verified: true,
      edited_after_approval: false
    })
    .gte('id', '00000000-0000-0000-0000-000000000000'); // Update all rows
  
  if (error) {
    console.error('Error approving designers:', error);
    return;
  }
  
  // Verify the update
  const { count: approvedCount } = await supabase
    .from('designers')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true);
  
  const { count: totalCount } = await supabase
    .from('designers')
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ Successfully approved ${approvedCount} out of ${totalCount} designers`);
  
  // Show distribution of approved designers by category
  console.log('\n📊 Approved Designers by Category:');
  const categories = ['Graphic Design', 'Web Design', 'UI/UX Design', 'Product Design', 'Motion Design', 'Interior Design'];
  
  for (const category of categories) {
    const { count } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .ilike('title', `%${category}%`)
      .eq('is_approved', true);
    console.log(`  ${category}: ${count} approved designers`);
  }
}

approveAllDesigners().catch(console.error);