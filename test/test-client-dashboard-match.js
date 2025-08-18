const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testClientDashboard() {
  console.log('🔍 Testing Client Dashboard Match Display\n');
  
  const clientEmail = 'osamah96@gmail.com';
  
  // Get client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, email, match_credits')
    .eq('email', clientEmail)
    .single();
    
  if (clientError) {
    console.error('Error fetching client:', clientError);
    return;
  }
  
  console.log('✅ Client found:');
  console.log('  - Email:', client.email);
  console.log('  - Credits:', client.match_credits);
  console.log('  - ID:', client.id);
  
  // Get client's matches with full details
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select(`
      id,
      status,
      score,
      reasons,
      created_at,
      designers (
        id,
        first_name,
        last_name,
        title,
        city,
        country,
        email,
        portfolio_url,
        avatar_url,
        tools
      ),
      briefs (
        id,
        project_type,
        timeline,
        budget,
        industry
      )
    `)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });
    
  if (matchError) {
    console.error('Error fetching matches:', matchError);
    return;
  }
  
  console.log('\n📊 Client Matches:');
  if (matches && matches.length > 0) {
    matches.forEach((match, index) => {
      console.log(`\n${index + 1}. Match ID: ${match.id}`);
      console.log('   Status:', match.status);
      console.log('   Score:', match.score + '%');
      console.log('   Designer:', match.designers?.first_name, match.designers?.last_name);
      console.log('   Project Type:', match.briefs?.project_type);
      console.log('   Created:', new Date(match.created_at).toLocaleString());
      
      // Check ID format
      if (!match.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('   ⚠️ WARNING: Invalid UUID format!');
      } else {
        console.log('   ✅ Valid UUID format');
      }
    });
  } else {
    console.log('No matches found for this client');
  }
  
  // Check for project requests
  console.log('\n📬 Checking Project Requests:');
  const { data: requests, error: requestError } = await supabase
    .from('project_requests')
    .select('id, match_id, status, created_at, response_deadline')
    .eq('client_id', client.id);
    
  if (requests && requests.length > 0) {
    requests.forEach(req => {
      console.log('- Request ID:', req.id);
      console.log('  Match ID:', req.match_id);
      console.log('  Status:', req.status);
      console.log('  Deadline:', new Date(req.response_deadline).toLocaleString());
    });
  } else {
    console.log('No project requests found');
  }
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. If match ID appears truncated, check browser console for errors');
  console.log('2. Clear browser cache and cookies');
  console.log('3. Try logging out and back in');
  console.log('4. The correct match ID is:', matches[0]?.id || 'No matches found');
}

testClientDashboard();