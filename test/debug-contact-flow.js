const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugContactFlow() {
  console.log('🔍 Debugging Contact Flow\n');
  console.log('=' . repeat(50));
  
  try {
    // Step 1: Check if tables exist
    console.log('\n1️⃣ Checking if tables exist...');
    
    const { data: prData, error: prError } = await supabase
      .from('project_requests')
      .select('*')
      .limit(1);
    
    if (prError) {
      console.log('❌ project_requests table error:', prError.message);
    } else {
      console.log('✅ project_requests table exists');
    }
    
    const { data: dnData, error: dnError } = await supabase
      .from('designer_notifications')
      .select('*')
      .limit(1);
    
    if (dnError) {
      console.log('❌ designer_notifications table error:', dnError.message);
    } else {
      console.log('✅ designer_notifications table exists');
    }
    
    // Step 2: Count existing records
    console.log('\n2️⃣ Counting existing records...');
    
    const { count: prCount } = await supabase
      .from('project_requests')
      .select('*', { count: 'exact', head: true });
    
    const { count: dnCount } = await supabase
      .from('designer_notifications')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 project_requests: ${prCount || 0} records`);
    console.log(`📊 designer_notifications: ${dnCount || 0} records`);
    
    // Step 3: Test direct insert
    console.log('\n3️⃣ Testing direct insert into project_requests...');
    
    // First, get a real match, client, and designer
    const { data: match } = await supabase
      .from('matches')
      .select('id, client_id, designer_id')
      .eq('status', 'unlocked')
      .limit(1)
      .single();
    
    if (!match) {
      console.log('⚠️ No unlocked matches found to test with');
      
      // Try to find any match
      const { data: anyMatch } = await supabase
        .from('matches')
        .select('id, client_id, designer_id')
        .limit(1)
        .single();
      
      if (anyMatch) {
        console.log('📝 Found a match (not unlocked):', anyMatch.id);
        
        // Test insert with this match
        const testRequest = {
          match_id: anyMatch.id,
          client_id: anyMatch.client_id,
          designer_id: anyMatch.designer_id,
          message: 'Test message from debug script',
          status: 'pending',
          client_email: 'test@example.com'
        };
        
        console.log('📤 Attempting insert with:', testRequest);
        
        const { data: inserted, error: insertError } = await supabase
          .from('project_requests')
          .insert(testRequest)
          .select()
          .single();
        
        if (insertError) {
          console.log('❌ Insert failed:', insertError.message);
          console.log('   Error details:', insertError);
        } else {
          console.log('✅ Insert successful! Created record:', inserted.id);
          
          // Check if trigger created notification
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger
          
          const { data: notification } = await supabase
            .from('designer_notifications')
            .select('*')
            .eq('designer_id', anyMatch.designer_id)
            .eq('type', 'contact')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (notification) {
            console.log('✅ Trigger worked! Notification created:', notification.id);
          } else {
            console.log('❌ Trigger did not create notification');
          }
          
          // Clean up test data
          await supabase.from('project_requests').delete().eq('id', inserted.id);
          if (notification) {
            await supabase.from('designer_notifications').delete().eq('id', notification.id);
          }
          console.log('🧹 Test data cleaned up');
        }
      } else {
        console.log('❌ No matches found in database at all');
      }
    } else {
      console.log('✅ Found unlocked match:', match.id);
      // Similar test with unlocked match...
    }
    
    // Step 4: Check triggers
    console.log('\n4️⃣ Checking if triggers exist...');
    
    const { data: triggers } = await supabase.rpc('get_triggers', {
      table_name: 'project_requests'
    }).catch(() => ({ data: null }));
    
    if (triggers) {
      console.log('✅ Triggers found:', triggers);
    } else {
      console.log('⚠️ Could not check triggers (function may not exist)');
      
      // Try alternative method
      const { data: triggerCheck, error: triggerError } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name')
        .eq('event_object_table', 'project_requests');
      
      if (!triggerError && triggerCheck) {
        console.log('✅ Triggers via information_schema:', triggerCheck);
      } else {
        console.log('⚠️ Could not verify triggers');
      }
    }
    
    // Step 5: Test the API endpoint
    console.log('\n5️⃣ Testing API endpoint (simulation)...');
    console.log('📝 The API endpoint at /api/client/matches/[id]/contact should:');
    console.log('   1. Validate client session');
    console.log('   2. Check match is unlocked');
    console.log('   3. Call projectRequestService.create()');
    console.log('   4. Send email notification');
    
    // Step 6: Check for any project_requests
    console.log('\n6️⃣ Fetching all project_requests...');
    const { data: allRequests, error: allError } = await supabase
      .from('project_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (allError) {
      console.log('❌ Error fetching requests:', allError);
    } else if (allRequests && allRequests.length > 0) {
      console.log(`✅ Found ${allRequests.length} project requests:`);
      allRequests.forEach(req => {
        console.log(`   - ${req.id}: ${req.message.substring(0, 50)}...`);
      });
    } else {
      console.log('⚠️ No project requests found in database');
    }
    
    // Final diagnosis
    console.log('\n' + '=' . repeat(50));
    console.log('📋 DIAGNOSIS:');
    
    if (prError || dnError) {
      console.log('❌ CRITICAL: Tables are missing or inaccessible');
      console.log('   ACTION: Run the SQL migration in Supabase dashboard');
    } else if (prCount === 0) {
      console.log('⚠️ Tables exist but no data is being saved');
      console.log('   POSSIBLE CAUSES:');
      console.log('   - API endpoint not creating records');
      console.log('   - Service client permissions issue');
      console.log('   - Validation failing before insert');
      console.log('   ACTION: Check API logs and service role key');
    } else {
      console.log('✅ System appears to be working');
      console.log(`   Found ${prCount} project requests`);
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the debug
debugContactFlow().catch(console.error);