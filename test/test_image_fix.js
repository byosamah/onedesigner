const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testImageFix() {
  console.log('🧪 Testing Image Fix...\n');
  
  // Get a match to test with
  const { data: matches, error } = await supabase
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
    .limit(1);
  
  if (error || !matches || matches.length === 0) {
    console.error('❌ No matches found for testing');
    return;
  }
  
  const match = matches[0];
  const matchId = match.id;
  const designer = match.designer;
  
  console.log('✅ Testing with:');
  console.log(`   Match ID: ${matchId}`);
  console.log(`   Designer: ${designer.first_name} ${designer.last_name}`);
  console.log(`   Avatar URL: ${designer.avatar_url}`);
  console.log('');
  
  // Test the production URL
  const testUrl = `https://onedesigner2-fs7dfx199-onedesigners-projects.vercel.app/client/match/${matchId}`;
  console.log('🌐 Test URL for manual verification:');
  console.log(testUrl);
  console.log('');
  
  console.log('🔍 Expected behavior:');
  console.log('1. Avatar should display as a circular image, not initials');
  console.log('2. Portfolio images should display as actual images, not placeholders');
  console.log('3. Avatar should be blurred if match is not unlocked');
  console.log('4. Designer name should show full name if unlocked, partial if locked');
  console.log('');
  
  // Test avatar URL accessibility
  try {
    const response = await fetch(designer.avatar_url);
    if (response.ok) {
      console.log('✅ Avatar URL is accessible');
    } else {
      console.log(`❌ Avatar URL returned ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Avatar URL failed: ${error.message}`);
  }
  
  console.log('\n🎯 Manual Testing Steps:');
  console.log('1. Open the test URL above in a browser');
  console.log('2. Check if avatar displays as image instead of initials');
  console.log('3. Check if portfolio section shows actual images');
  console.log('4. If match is locked, avatar should be blurred');
  console.log('5. Unlock the match and verify images display clearly');
}

testImageFix().catch(console.error);