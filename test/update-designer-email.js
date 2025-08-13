const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDesignerEmail() {
  console.log('🔍 Finding Paul Rodriguez...');
  
  try {
    // First find Paul Rodriguez
    const { data: designers, error: findError } = await supabase
      .from('designers')
      .select('id, first_name, last_name, email')
      .eq('first_name', 'Paul')
      .eq('last_name', 'Rodriguez');
    
    if (findError) {
      console.error('❌ Error finding designer:', findError);
      return;
    }
    
    if (!designers || designers.length === 0) {
      console.log('❌ Paul Rodriguez not found');
      
      // Try finding just by first name
      const { data: pauls } = await supabase
        .from('designers')
        .select('id, first_name, last_name, email')
        .eq('first_name', 'Paul');
      
      if (pauls && pauls.length > 0) {
        console.log('Found designers named Paul:', pauls);
      }
      return;
    }
    
    const paul = designers[0];
    console.log('✅ Found Paul Rodriguez:', {
      id: paul.id,
      name: `${paul.first_name} ${paul.last_name}`,
      currentEmail: paul.email
    });
    
    // Update email
    const { data: updated, error: updateError } = await supabase
      .from('designers')
      .update({ email: 'asom.3ud@gmail.com' })
      .eq('id', paul.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating email:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated email to: asom.3ud@gmail.com');
    console.log('Updated designer:', {
      id: updated.id,
      name: `${updated.first_name} ${updated.last_name}`,
      newEmail: updated.email
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateDesignerEmail();