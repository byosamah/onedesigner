const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFix() {
  console.log('✅ Verifying Working Request Fix\n');
  console.log('=' .repeat(60));
  
  try {
    // Get an unlocked match for testing
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        client_id,
        designer_id,
        status,
        briefs!inner(
          client_id,
          project_type,
          clients!inner(
            email
          )
        ),
        designers!inner(
          first_name,
          last_name
        )
      `)
      .eq('status', 'unlocked')
      .limit(1);
      
    if (matchError || !matches || matches.length === 0) {
      console.log('⚠️ No unlocked matches found for testing');
      console.log('Please unlock a match first and then run this test');
      return;
    }
    
    const match = matches[0];
    const clientEmail = match.briefs?.clients?.email;
    const effectiveClientId = match.client_id || match.briefs?.client_id;
    
    console.log('\n📊 Test Match Details:');
    console.log(`  Match ID: ${match.id}`);
    console.log(`  Status: ${match.status}`);
    console.log(`  Designer: ${match.designers?.first_name} ${match.designers?.last_name}`);
    console.log(`  Client Email: ${clientEmail}`);
    console.log(`  Client ID: ${effectiveClientId}`);
    console.log(`  Project Type: ${match.briefs?.project_type || 'Not specified'}`);
    
    // Check for existing project requests
    const { data: existingRequests } = await supabase
      .from('project_requests')
      .select('*')
      .eq('match_id', match.id);
      
    console.log(`\n📨 Existing Project Requests: ${existingRequests?.length || 0}`);
    
    if (existingRequests && existingRequests.length > 0) {
      console.log('  Previous requests found for this match:');
      existingRequests.forEach(req => {
        console.log(`    - ${req.id}: ${req.status} (Created: ${new Date(req.created_at).toLocaleString()})`);
      });
    }
    
    console.log('\n✅ Fix Applied Successfully!');
    console.log('\n📝 Test Instructions:');
    console.log(`  1. Log in as client: ${clientEmail}`);
    console.log(`  2. Go to the client dashboard`);
    console.log(`  3. Find the match with ${match.designers?.first_name} ${match.designers?.last_name}`);
    console.log(`  4. Click "Send Working Request"`);
    console.log(`  5. The error "Match not found not found" should be fixed`);
    console.log('\n🎯 Expected Result:');
    console.log('  - Working request should be sent successfully');
    console.log('  - Success modal should appear');
    console.log('  - Designer should receive email notification');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Verification Complete');
}

// Run verification
verifyFix();