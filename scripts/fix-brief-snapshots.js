const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixBriefSnapshots() {
  console.log('🔧 Fixing brief snapshots in project_requests...\n');
  
  try {
    // Get all project requests with incomplete brief_snapshot
    const { data: requests, error: fetchError } = await supabase
      .from('project_requests')
      .select(`
        id,
        match_id,
        brief_snapshot,
        brief_details,
        matches (
          id,
          brief_id,
          score,
          reasons,
          briefs (
            project_type,
            timeline,
            budget,
            industry,
            requirements,
            styles,
            inspiration,
            communication,
            timezone
          )
        )
      `);
    
    if (fetchError) {
      console.error('Error fetching requests:', fetchError);
      return;
    }
    
    console.log(`Found ${requests.length} project requests to check\n`);
    
    let fixedCount = 0;
    
    for (const request of requests) {
      // Check if brief_snapshot is missing core fields
      const snapshot = request.brief_snapshot || {};
      const needsFix = !snapshot.project_type || !snapshot.timeline || !snapshot.budget;
      
      if (needsFix) {
        console.log(`Fixing request ${request.id.substring(0, 8)}...`);
        
        // Get brief data from the match relationship or brief_details
        const briefData = request.matches?.briefs || request.brief_details || {};
        
        // Create a proper brief snapshot
        const fixedSnapshot = {
          // Preserve existing data
          ...snapshot,
          
          // Add missing core fields
          project_type: snapshot.project_type || briefData.project_type || 'Design Project',
          timeline: snapshot.timeline || briefData.timeline || 'Not specified',
          budget: snapshot.budget || briefData.budget || 'Not specified',
          
          // Add description (use requirements field as that's what the briefs table uses)
          project_description: snapshot.project_description || briefData.requirements || briefData.industry || '',
          
          // Add other important fields
          industry: snapshot.industry || briefData.industry || '',
          styles: snapshot.styles || briefData.styles || [],
          inspiration: snapshot.inspiration || briefData.inspiration || '',
          communication: snapshot.communication || briefData.communication || [],
          timezone: snapshot.timezone || briefData.timezone || '',
          
          // Keep match context
          match_score: snapshot.match_score || request.matches?.score,
          match_reasons: snapshot.match_reasons || request.matches?.reasons || [],
          match_id: snapshot.match_id || request.match_id
        };
        
        // Update the project request
        const { error: updateError } = await supabase
          .from('project_requests')
          .update({ brief_snapshot: fixedSnapshot })
          .eq('id', request.id);
        
        if (updateError) {
          console.error(`  ❌ Failed to update: ${updateError.message}`);
        } else {
          console.log(`  ✅ Fixed with project_type: ${fixedSnapshot.project_type}`);
          fixedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} project requests with incomplete brief snapshots`);
    
    // Verify the fix
    console.log('\n📊 Verification:');
    const { data: verifyData } = await supabase
      .from('project_requests')
      .select('id, brief_snapshot')
      .limit(3);
    
    if (verifyData) {
      verifyData.forEach((req, index) => {
        if (req.brief_snapshot) {
          console.log(`\nRequest ${index + 1}:`);
          console.log('  - project_type:', req.brief_snapshot.project_type || 'MISSING');
          console.log('  - timeline:', req.brief_snapshot.timeline || 'MISSING');
          console.log('  - budget:', req.brief_snapshot.budget || 'MISSING');
          console.log('  - Has description:', !!req.brief_snapshot.project_description);
        }
      });
    }
    
  } catch (error) {
    console.error('Error in fixBriefSnapshots:', error);
  }
}

// Run the fix
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

fixBriefSnapshots().catch(console.error);