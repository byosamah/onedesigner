const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDesignerDashboardQuery() {
  console.log('🔍 Testing Designer Dashboard Query\n');
  console.log('=' . repeat(50));
  
  try {
    // Get the designer ID from the existing notification
    const designerId = '3e8f4c5c-113e-40ae-bf98-5f628a232c8c';
    console.log(`Testing with designer ID: ${designerId}\n`);
    
    // Test the corrected query (without description field)
    console.log('1️⃣ Testing corrected query (without description):');
    const { data: projectRequests, error } = await supabase
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
    
    if (error) {
      console.log('❌ Query error:', error);
    } else if (projectRequests && projectRequests.length > 0) {
      console.log(`✅ Query successful! Found ${projectRequests.length} request(s)\n`);
      
      projectRequests.forEach((req, index) => {
        console.log(`Request ${index + 1}:`);
        console.log('  ID:', req.id);
        console.log('  Message:', req.message);
        console.log('  Status:', req.status);
        console.log('  Client Email:', req.client_email || req.clients?.email || 'Not available');
        console.log('  Match Score:', req.matches?.score || 'N/A');
        console.log('  Project Type:', req.matches?.briefs?.project_type || 'N/A');
        console.log('  Timeline:', req.matches?.briefs?.timeline || 'N/A');
        console.log('  Budget:', req.matches?.briefs?.budget || 'N/A');
        console.log('-' . repeat(40));
      });
    } else {
      console.log('⚠️ No project requests found for this designer');
    }
    
    // Also check designer notifications
    console.log('\n2️⃣ Checking designer notifications:');
    const { data: notifications, error: notifError } = await supabase
      .from('designer_notifications')
      .select('*')
      .eq('designer_id', designerId)
      .eq('read', false)
      .order('created_at', { ascending: false });
    
    if (notifError) {
      console.log('❌ Notification query error:', notifError);
    } else if (notifications && notifications.length > 0) {
      console.log(`✅ Found ${notifications.length} unread notification(s):`);
      notifications.forEach(notif => {
        console.log(`  - ${notif.type}: ${notif.title}`);
      });
    } else {
      console.log('⚠️ No unread notifications');
    }
    
    console.log('\n' + '=' . repeat(50));
    console.log('📋 CONCLUSION:');
    
    if (projectRequests && projectRequests.length > 0) {
      console.log('✅ The corrected query works!');
      console.log('   The issue was the "description" field in briefs table');
      console.log('   Data is properly stored and can be retrieved');
      console.log('\n✨ The designer dashboard should now show messages!');
    } else {
      console.log('⚠️ Query works but no data found');
      console.log('   Try contacting a designer from the client dashboard');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testDesignerDashboardQuery().catch(console.error);