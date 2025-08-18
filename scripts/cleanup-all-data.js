const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupAllData() {
  console.log('🧹 Starting comprehensive data cleanup...');
  
  try {
    // Step 1: Get current counts
    console.log('\n📊 Current data counts:');
    const counts = await getCurrentCounts();
    console.log(`  - Designers: ${counts.designers}`);
    console.log(`  - Clients: ${counts.clients}`);
    console.log(`  - Briefs: ${counts.briefs}`);
    console.log(`  - Matches: ${counts.matches}`);
    console.log(`  - Project Requests: ${counts.projectRequests}`);
    console.log(`  - Client Designers: ${counts.clientDesigners}`);
    console.log(`  - Auth Tokens: ${counts.authTokens}`);
    console.log(`  - Portfolio Images: ${counts.portfolioImages}`);

    // Step 2: Confirmation prompt
    console.log('\n⚠️  WARNING: This will delete ALL designers and clients data!');
    console.log('This action cannot be undone.');
    
    // For safety, require environment variable confirmation
    if (process.env.CONFIRM_CLEANUP !== 'yes') {
      console.log('\n❌ Cleanup aborted. Set CONFIRM_CLEANUP=yes to proceed.');
      return;
    }

    // Step 3: Delete in correct order (child tables first)
    console.log('\n🗑️  Starting deletion process...');

    // Delete project requests first (references matches and designers)
    const { error: prError, count: prCount } = await supabase
      .from('project_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (prError) {
      console.error('❌ Error deleting project_requests:', prError);
    } else {
      console.log(`✅ Deleted ${prCount || 'all'} project requests`);
    }

    // Delete client_designers (relationship table)
    const { error: cdError, count: cdCount } = await supabase
      .from('client_designers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (cdError) {
      console.error('❌ Error deleting client_designers:', cdError);
    } else {
      console.log(`✅ Deleted ${cdCount || 'all'} client_designers relationships`);
    }

    // Delete matches (references briefs and designers)
    const { error: matchError, count: matchCount } = await supabase
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (matchError) {
      console.error('❌ Error deleting matches:', matchError);
    } else {
      console.log(`✅ Deleted ${matchCount || 'all'} matches`);
    }

    // Delete briefs (references clients)
    const { error: briefError, count: briefCount } = await supabase
      .from('briefs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (briefError) {
      console.error('❌ Error deleting briefs:', briefError);
    } else {
      console.log(`✅ Deleted ${briefCount || 'all'} briefs`);
    }

    // Delete portfolio images (references designers)
    const { error: piError, count: piCount } = await supabase
      .from('portfolio_images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (piError) {
      console.error('❌ Error deleting portfolio_images:', piError);
    } else {
      console.log(`✅ Deleted ${piCount || 'all'} portfolio images`);
    }

    // Delete auth tokens for designers and clients
    const { error: atError, count: atCount } = await supabase
      .from('auth_tokens')
      .delete()
      .in('user_type', ['designer', 'client']);
    
    if (atError) {
      console.error('❌ Error deleting auth_tokens:', atError);
    } else {
      console.log(`✅ Deleted ${atCount || 'all'} auth tokens for designers/clients`);
    }

    // Delete designers
    const { error: designerError, count: designerCount } = await supabase
      .from('designers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (designerError) {
      console.error('❌ Error deleting designers:', designerError);
    } else {
      console.log(`✅ Deleted ${designerCount || 'all'} designers`);
    }

    // Delete clients
    const { error: clientError, count: clientCount } = await supabase
      .from('clients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (clientError) {
      console.error('❌ Error deleting clients:', clientError);
    } else {
      console.log(`✅ Deleted ${clientCount || 'all'} clients`);
    }

    // Step 4: Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const finalCounts = await getCurrentCounts();
    console.log(`  - Designers remaining: ${finalCounts.designers}`);
    console.log(`  - Clients remaining: ${finalCounts.clients}`);
    console.log(`  - Briefs remaining: ${finalCounts.briefs}`);
    console.log(`  - Matches remaining: ${finalCounts.matches}`);
    console.log(`  - Project Requests remaining: ${finalCounts.projectRequests}`);
    console.log(`  - Client Designers remaining: ${finalCounts.clientDesigners}`);
    console.log(`  - Auth Tokens remaining: ${finalCounts.authTokens}`);
    console.log(`  - Portfolio Images remaining: ${finalCounts.portfolioImages}`);

    const totalRemaining = finalCounts.designers + finalCounts.clients + 
                          finalCounts.briefs + finalCounts.matches + 
                          finalCounts.projectRequests + finalCounts.clientDesigners;

    if (totalRemaining === 0) {
      console.log('\n🎉 Cleanup completed successfully! All data has been removed.');
    } else {
      console.log('\n⚠️  Cleanup completed with some remaining records. This might be expected for system data.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during cleanup:', error);
    process.exit(1);
  }
}

async function getCurrentCounts() {
  const results = await Promise.all([
    supabase.from('designers').select('id', { count: 'exact', head: true }),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('briefs').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }),
    supabase.from('project_requests').select('id', { count: 'exact', head: true }),
    supabase.from('client_designers').select('id', { count: 'exact', head: true }),
    supabase.from('auth_tokens').select('id', { count: 'exact', head: true }),
    supabase.from('portfolio_images').select('id', { count: 'exact', head: true })
  ]);

  return {
    designers: results[0].count || 0,
    clients: results[1].count || 0,
    briefs: results[2].count || 0,
    matches: results[3].count || 0,
    projectRequests: results[4].count || 0,
    clientDesigners: results[5].count || 0,
    authTokens: results[6].count || 0,
    portfolioImages: results[7].count || 0
  };
}

// Run the cleanup
if (require.main === module) {
  cleanupAllData().catch(console.error);
}

module.exports = { cleanupAllData };