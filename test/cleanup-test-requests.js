const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupTestRequests() {
  console.log('🧹 Cleaning Up Test Working Requests\n');
  
  try {
    // Find test requests (those with specific test patterns)
    const { data: testRequests, error: fetchError } = await supabase
      .from('project_requests')
      .select('id, message, created_at, status')
      .or('message.ilike.%test%,message.ilike.%TEST%')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching requests:', fetchError);
      return;
    }
    
    if (!testRequests || testRequests.length === 0) {
      console.log('✅ No test requests found. Database is clean!');
      return;
    }
    
    console.log(`Found ${testRequests.length} potential test requests:\n`);
    
    testRequests.forEach((req, index) => {
      console.log(`${index + 1}. Request ${req.id.substring(0, 8)}...`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Created: ${new Date(req.created_at).toLocaleString()}`);
      console.log(`   Message preview: "${req.message.substring(0, 50)}..."\n`);
    });
    
    // Ask for confirmation (in automated context, we'll skip)
    console.log('⚠️  To delete these test requests, run:');
    console.log('   node test/cleanup-test-requests.js --confirm\n');
    
    // Check for --confirm flag
    if (process.argv.includes('--confirm')) {
      console.log('🗑️  Deleting test requests...');
      
      const idsToDelete = testRequests.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('project_requests')
        .delete()
        .in('id', idsToDelete);
      
      if (deleteError) {
        console.error('❌ Error deleting requests:', deleteError);
      } else {
        console.log(`✅ Successfully deleted ${testRequests.length} test requests`);
      }
    }
    
    // Show current statistics
    console.log('\n📊 Current Project Requests Statistics:');
    
    const { data: stats } = await supabase
      .from('project_requests')
      .select('status');
    
    if (stats) {
      const statusCounts = stats.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('   Total requests:', stats.length);
      Object.entries(statusCounts).forEach(([status, count]) => {
        const emoji = status === 'pending' ? '⏳' : status === 'approved' ? '✅' : '❌';
        console.log(`   ${emoji} ${status}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run cleanup
cleanupTestRequests();