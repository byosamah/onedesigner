const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAvatarData() {
  console.log('🔍 Checking Avatar Data...\n');
  
  // Check if designers have avatar_url
  const { data: designers, error } = await supabase
    .from('designers')
    .select('id, first_name, last_name, avatar_url')
    .limit(5);
  
  if (error) {
    console.error('Error fetching designers:', error);
    return;
  }
  
  console.log('Sample designers with avatar data:');
  designers.forEach(designer => {
    console.log(`  ${designer.first_name} ${designer.last_name}:`);
    console.log(`    ID: ${designer.id}`);
    console.log(`    Avatar URL: ${designer.avatar_url || 'NULL'}`);
    console.log('');
  });
  
  // Check if matches are returning designer data with avatar_url
  console.log('📊 Checking Match API Response...\n');
  
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select(`
      id,
      designer:designers!matches_designer_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .limit(3);
  
  if (matchError) {
    console.error('Error fetching matches:', matchError);
    return;
  }
  
  console.log('Sample matches with designer avatar data:');
  matches.forEach(match => {
    console.log(`  Match ID: ${match.id}`);
    console.log(`  Designer: ${match.designer.first_name} ${match.designer.last_name}`);
    console.log(`  Avatar URL: ${match.designer.avatar_url || 'NULL'}`);
    console.log('');
  });
  
  // Check if avatar URLs are working
  if (designers[0]?.avatar_url) {
    console.log('🌐 Testing avatar URL accessibility...');
    console.log(`First designer's avatar: ${designers[0].avatar_url}`);
    
    try {
      const response = await fetch(designers[0].avatar_url);
      console.log(`Avatar URL status: ${response.status} ${response.statusText}`);
      console.log(`Content type: ${response.headers.get('content-type')}`);
    } catch (error) {
      console.error('Error accessing avatar URL:', error.message);
    }
  }
}

checkAvatarData().catch(console.error);