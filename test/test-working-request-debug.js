const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugWorkingRequest() {
  console.log('🔍 Debugging Working Request Issue\n');
  console.log('=' .repeat(60));
  
  try {
    // Check for any existing matches in the database
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        client_id,
        designer_id,
        status,
        created_at,
        briefs!inner(
          id,
          client_id,
          project_type,
          clients!inner(
            id,
            email
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (matchError) {
      console.error('❌ Error fetching matches:', matchError);
      return;
    }
    
    console.log('📊 Recent Matches:', matches?.length || 0);
    
    if (matches && matches.length > 0) {
      console.log('\n🔍 Analyzing Matches:\n');
      
      for (const match of matches) {
        console.log(`Match ID: ${match.id}`);
        console.log(`  Status: ${match.status}`);
        console.log(`  Created: ${new Date(match.created_at).toLocaleString()}`);
        console.log(`  Match client_id: ${match.client_id || 'NULL'}`);
        console.log(`  Brief client_id: ${match.briefs?.client_id || 'NULL'}`);
        console.log(`  Client email: ${match.briefs?.clients?.email || 'Unknown'}`);
        console.log(`  Designer ID: ${match.designer_id}`);
        
        // Determine effective client ID
        const effectiveClientId = match.client_id || match.briefs?.client_id;
        console.log(`  ✅ Effective client_id: ${effectiveClientId}`);
        
        if (match.status === 'unlocked') {
          console.log(`  🔓 This match is UNLOCKED and ready for contact`);
        } else {
          console.log(`  🔒 This match needs to be unlocked first (status: ${match.status})`);
        }
        
        console.log('---');
      }
      
      // Check for unlocked matches specifically
      const unlockedMatches = matches.filter(m => m.status === 'unlocked');
      console.log(`\n📊 Unlocked matches: ${unlockedMatches.length} of ${matches.length}`);
      
      if (unlockedMatches.length > 0) {
        const match = unlockedMatches[0];
        console.log('\n✅ Test match for working request:');
        console.log(`  Match ID: ${match.id}`);
        console.log(`  Client ID: ${match.client_id || match.briefs?.client_id}`);
        console.log(`  Designer ID: ${match.designer_id}`);
        console.log(`  Status: ${match.status}`);
        console.log('\n📝 To test working request:');
        console.log(`  1. Log in as client: ${match.briefs?.clients?.email}`);
        console.log(`  2. Navigate to the match page`);
        console.log(`  3. Click "Send Working Request"`);
      }
    } else {
      console.log('\n⚠️ No matches found in database');
      console.log('\n📝 To create test data:');
      console.log('  1. Create a designer account and get it approved');
      console.log('  2. Create a client account');
      console.log('  3. Create a brief as the client');
      console.log('  4. A match will be created automatically');
      console.log('  5. Unlock the match');
      console.log('  6. Then try sending a working request');
    }
    
    // Check for any project requests
    const { data: requests } = await supabase
      .from('project_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log('\n📨 Recent Project Requests:', requests?.length || 0);
    
    if (requests && requests.length > 0) {
      console.log('\nRecent requests:');
      for (const req of requests) {
        console.log(`  - ${req.id}: ${req.status} (Match: ${req.match_id})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Debug Complete');
}

// Run the debug
debugWorkingRequest();