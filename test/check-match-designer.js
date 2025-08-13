const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMatchDesigner() {
  console.log('🔍 Checking recent matches with Paul Rodriguez...');
  
  try {
    // Get all Paul Rodriguez IDs
    const { data: pauls } = await supabase
      .from('designers')
      .select('id, first_name, last_name, email')
      .eq('first_name', 'Paul')
      .eq('last_name', 'Rodriguez');
    
    if (!pauls || pauls.length === 0) {
      console.log('❌ No Paul Rodriguez found');
      return;
    }
    
    console.log(`Found ${pauls.length} Paul Rodriguez entries:`);
    pauls.forEach(p => {
      console.log(`- ID: ${p.id}, Email: ${p.email}`);
    });
    
    // Get recent matches for any Paul Rodriguez
    const paulIds = pauls.map(p => p.id);
    
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        id,
        designer_id,
        client_id,
        created_at,
        designer:designers(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .in('designer_id', paulIds)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (matches && matches.length > 0) {
      console.log(`\n📊 Recent matches with Paul Rodriguez:`);
      matches.forEach(m => {
        console.log(`\nMatch ID: ${m.id}`);
        console.log(`Designer: ${m.designer.first_name} ${m.designer.last_name}`);
        console.log(`Designer Email: ${m.designer.email}`);
        console.log(`Designer ID: ${m.designer_id}`);
        console.log(`Created: ${new Date(m.created_at).toLocaleString()}`);
      });
      
      // Update the most recent Paul Rodriguez to have the correct email
      const mostRecentMatch = matches[0];
      if (mostRecentMatch.designer.email !== 'asom.3ud@gmail.com') {
        console.log(`\n🔄 Updating designer ${mostRecentMatch.designer_id} email to asom.3ud@gmail.com...`);
        
        const { error: updateError } = await supabase
          .from('designers')
          .update({ email: 'asom.3ud@gmail.com' })
          .eq('id', mostRecentMatch.designer_id);
        
        if (updateError) {
          console.error('❌ Error updating email:', updateError);
        } else {
          console.log('✅ Email updated successfully!');
        }
      } else {
        console.log('\n✅ Most recent Paul Rodriguez already has correct email');
      }
    } else {
      console.log('❌ No matches found with Paul Rodriguez');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkMatchDesigner();