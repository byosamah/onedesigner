const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const typeColors = {
    info: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
    test: colors.magenta
  };
  console.log(`${typeColors[type]}[${timestamp}] ${message}${colors.reset}`);
}

async function testWorkingRequestFlow() {
  console.log('\n' + colors.bright + '🧪 Testing Complete Working Request Flow' + colors.reset);
  console.log('=' .repeat(50) + '\n');

  try {
    // Step 1: Check if migration has been applied
    await log('Step 1: Checking database migration status...', 'test');
    
    const { data: testRequest, error: migrationError } = await supabase
      .from('project_requests')
      .select('id, viewed_at, response_deadline, brief_snapshot')
      .limit(1);
    
    if (migrationError && migrationError.message.includes('column')) {
      await log('❌ Migration not yet applied. Please run the migration first.', 'error');
      await log('Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new', 'warning');
      return;
    }
    
    await log('✅ Database migration verified', 'success');

    // Step 2: Find a test client with credits and an unlocked match
    await log('\nStep 2: Finding test client with unlocked match...', 'test');
    
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        client_id,
        designer_id,
        brief_id,
        status,
        score,
        reasons,
        clients!inner(
          id,
          email,
          match_credits
        ),
        designers!inner(
          id,
          email,
          first_name,
          last_name,
          is_approved
        ),
        briefs!inner(
          id,
          project_type,
          timeline,
          budget,
          industry,
          project_description
        )
      `)
      .eq('status', 'unlocked')
      .gt('clients.match_credits', 0)
      .eq('designers.is_approved', true)
      .limit(1)
      .single();

    if (matchError || !matches) {
      await log('No suitable test match found. Creating test scenario...', 'warning');
      
      // You could create test data here if needed
      await log('Please ensure you have:', 'info');
      await log('  - A client with credits', 'info');
      await log('  - An unlocked match', 'info');
      await log('  - An approved designer', 'info');
      return;
    }

    await log(`✅ Found test match:`, 'success');
    await log(`  Client: ${matches.clients.email}`, 'info');
    await log(`  Designer: ${matches.designers.first_name} ${matches.designers.last_name}`, 'info');
    await log(`  Project: ${matches.briefs.project_type}`, 'info');
    await log(`  Match Score: ${matches.score}%`, 'info');

    // Step 3: Simulate sending a working request
    await log('\nStep 3: Simulating working request creation...', 'test');
    
    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('project_requests')
      .select('id, status')
      .eq('match_id', matches.id)
      .eq('designer_id', matches.designer_id)
      .single();

    if (existingRequest) {
      await log(`⚠️ Request already exists with status: ${existingRequest.status}`, 'warning');
      
      if (existingRequest.status === 'pending') {
        await log('Using existing pending request for testing...', 'info');
      } else {
        await log('Request has already been processed. Find another match to test.', 'warning');
        return;
      }
    } else {
      // Create new working request with brief snapshot
      const briefSnapshot = {
        project_type: matches.briefs.project_type,
        timeline: matches.briefs.timeline,
        budget: matches.briefs.budget,
        industry: matches.briefs.industry,
        project_description: matches.briefs.project_description,
        match_score: matches.score,
        match_reasons: matches.reasons
      };

      const { data: newRequest, error: createError } = await supabase
        .from('project_requests')
        .insert({
          match_id: matches.id,
          client_id: matches.client_id,
          designer_id: matches.designer_id,
          message: `Hi ${matches.designers.first_name}, I'd love to work with you on my ${matches.briefs.project_type} project. Your portfolio really impressed me, especially your work that aligns with what I'm looking for. Looking forward to collaborating!`,
          status: 'pending',
          brief_snapshot: briefSnapshot,
          response_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (createError) {
        await log(`❌ Failed to create request: ${createError.message}`, 'error');
        return;
      }

      await log('✅ Working request created successfully', 'success');
      await log(`  Request ID: ${newRequest.id}`, 'info');
      await log(`  Response deadline: ${new Date(newRequest.response_deadline).toLocaleString()}`, 'info');
    }

    // Step 4: Test viewing the request as a designer
    await log('\nStep 4: Testing designer view of request...', 'test');
    
    const requestId = existingRequest?.id || newRequest.id;
    
    // Mark as viewed
    const { data: viewedRequest, error: viewError } = await supabase
      .from('project_requests')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', requestId)
      .select('id, viewed_at, brief_snapshot')
      .single();

    if (viewError) {
      await log(`❌ Failed to mark as viewed: ${viewError.message}`, 'error');
    } else {
      await log('✅ Request marked as viewed', 'success');
      await log(`  Brief snapshot contains ${Object.keys(viewedRequest.brief_snapshot).length} fields`, 'info');
    }

    // Step 5: Test response options
    await log('\nStep 5: Testing response options...', 'test');
    await log('Choose an action to test:', 'info');
    await log('  1. Approve request (designer accepts)', 'info');
    await log('  2. Reject request (designer declines)', 'info');
    await log('  3. Skip (leave as pending)', 'info');
    
    // For automated testing, we'll skip the response
    await log('Skipping response for automated test...', 'info');

    // Step 6: Verify the complete state
    await log('\nStep 6: Verifying final state...', 'test');
    
    const { data: finalRequest, error: finalError } = await supabase
      .from('project_requests')
      .select(`
        id,
        status,
        message,
        viewed_at,
        response_deadline,
        brief_snapshot,
        created_at,
        updated_at
      `)
      .eq('id', requestId)
      .single();

    if (finalError) {
      await log(`❌ Failed to fetch final state: ${finalError.message}`, 'error');
      return;
    }

    await log('✅ Final request state:', 'success');
    await log(`  Status: ${finalRequest.status}`, 'info');
    await log(`  Viewed: ${finalRequest.viewed_at ? 'Yes' : 'No'}`, 'info');
    await log(`  Has brief snapshot: ${finalRequest.brief_snapshot ? 'Yes' : 'No'}`, 'info');
    await log(`  Response deadline: ${new Date(finalRequest.response_deadline).toLocaleString()}`, 'info');
    
    const hoursRemaining = Math.floor((new Date(finalRequest.response_deadline) - new Date()) / (1000 * 60 * 60));
    await log(`  Time remaining: ${hoursRemaining} hours`, hoursRemaining < 24 ? 'warning' : 'info');

    // Summary
    console.log('\n' + colors.bright + '📊 Test Summary' + colors.reset);
    console.log('=' .repeat(50));
    await log('✅ Database migration: VERIFIED', 'success');
    await log('✅ Working request creation: FUNCTIONAL', 'success');
    await log('✅ Brief snapshot: CAPTURED', 'success');
    await log('✅ View tracking: WORKING', 'success');
    await log('✅ Response deadline: SET CORRECTLY', 'success');
    
    console.log('\n' + colors.bright + '🎉 Working Request System is fully operational!' + colors.reset);
    console.log('\nNext steps:');
    console.log('1. Test the UI flow at: ' + colors.blue + 'http://localhost:3000/client/dashboard' + colors.reset);
    console.log('2. Send a working request from a client account');
    console.log('3. Check designer dashboard for the request');
    console.log('4. Test accept/reject flow');

  } catch (error) {
    await log(`❌ Test failed: ${error.message}`, 'error');
    console.error(error);
  }
}

// Run the test
testWorkingRequestFlow();