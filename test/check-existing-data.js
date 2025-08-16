const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingData() {
  console.log('📊 Checking Existing Data\n');
  console.log('=' . repeat(50));
  
  try {
    // Check project_requests
    console.log('\n1️⃣ Project Requests:');
    const { data: requests, error: reqError } = await supabase
      .from('project_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (reqError) {
      console.log('❌ Error:', reqError);
    } else if (requests && requests.length > 0) {
      console.log(`Found ${requests.length} request(s):\n`);
      requests.forEach(req => {
        console.log(`ID: ${req.id}`);
        console.log(`Match ID: ${req.match_id}`);
        console.log(`Client ID: ${req.client_id}`);
        console.log(`Designer ID: ${req.designer_id}`);
        console.log(`Message: ${req.message}`);
        console.log(`Status: ${req.status}`);
        console.log(`Created: ${req.created_at}`);
        console.log('-' . repeat(30));
      });
    } else {
      console.log('No project requests found');
    }
    
    // Check designer_notifications
    console.log('\n2️⃣ Designer Notifications:');
    const { data: notifications, error: notError } = await supabase
      .from('designer_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (notError) {
      console.log('❌ Error:', notError);
    } else if (notifications && notifications.length > 0) {
      console.log(`Found ${notifications.length} notification(s):\n`);
      notifications.forEach(notif => {
        console.log(`ID: ${notif.id}`);
        console.log(`Designer ID: ${notif.designer_id}`);
        console.log(`Type: ${notif.type}`);
        console.log(`Title: ${notif.title}`);
        console.log(`Message: ${notif.message}`);
        console.log(`Read: ${notif.read}`);
        console.log(`Data: ${JSON.stringify(notif.data)}`);
        console.log(`Created: ${notif.created_at}`);
        console.log('-' . repeat(30));
      });
    } else {
      console.log('No notifications found');
    }
    
    // Check if we can fetch them joined
    console.log('\n3️⃣ Testing Designer Dashboard Query:');
    
    // Pick a designer ID from the notifications if available
    if (notifications && notifications.length > 0) {
      const designerId = notifications[0].designer_id;
      console.log(`Testing with designer ID: ${designerId}`);
      
      // Test the exact query the dashboard uses
      const { data: dashboardRequests, error: dashError } = await supabase
        .from('project_requests')
        .select(`
          *,
          matches (
            id,
            score,
            reasons,
            briefs (
              project_type,
              timeline,
              budget,
              description,
              industry,
              design_styles
            )
          ),
          clients (
            id,
            email
          )
        `)
        .eq('designer_id', designerId)
        .order('created_at', { ascending: false });
      
      if (dashError) {
        console.log('❌ Dashboard query error:', dashError);
      } else if (dashboardRequests && dashboardRequests.length > 0) {
        console.log(`✅ Dashboard query successful! Found ${dashboardRequests.length} request(s)`);
        console.log('First request:', JSON.stringify(dashboardRequests[0], null, 2));
      } else {
        console.log('⚠️ Dashboard query returned no results for this designer');
      }
    }
    
    // Check recent matches to understand the flow
    console.log('\n4️⃣ Recent Unlocked Matches:');
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, client_id, designer_id, status, created_at')
      .eq('status', 'unlocked')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (matchError) {
      console.log('❌ Error:', matchError);
    } else if (matches && matches.length > 0) {
      console.log(`Found ${matches.length} unlocked match(es):`);
      matches.forEach(match => {
        console.log(`  - ${match.id} (Designer: ${match.designer_id})`);
      });
    } else {
      console.log('No unlocked matches found');
    }
    
    console.log('\n' + '=' . repeat(50));
    console.log('📋 ANALYSIS:');
    
    if (requests && requests.length > 0) {
      console.log('✅ Contact messages ARE being saved to the database');
      console.log(`   Total: ${requests.length} message(s)`);
      
      if (notifications && notifications.length > 0) {
        console.log('✅ Notifications ARE being created');
        console.log(`   Total: ${notifications.length} notification(s)`);
        console.log('\n⚠️ Issue is likely in the designer dashboard display');
      } else {
        console.log('❌ Notifications are NOT being created');
        console.log('   The trigger might not be working');
      }
    } else {
      console.log('❌ Contact messages are NOT being saved');
      console.log('   Issue is in the API endpoint or service');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkExistingData().catch(console.error);