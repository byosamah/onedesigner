const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key
const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'
);

// Create anonymous client to test public access
const anonSupabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTYzNTgsImV4cCI6MjA2OTk5MjM1OH0.Pohf9_wQoL7cx95lj1MBk-yGqrAmpcEDmNXP-Ju5BkI'
);

async function verifyRLSMigration() {
  console.log('🔍 Verifying RLS Migration on Designers Table');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Service role should have full access
    console.log('\n1️⃣ Testing Service Role Access...');
    const { data: allDesigners, error: serviceError } = await supabase
      .from('designers')
      .select('id, first_name, last_name, is_approved')
      .limit(5);
    
    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError.message);
    } else {
      console.log(`✅ Service role can access ${allDesigners.length} designers`);
      console.log('📊 Sample data:', allDesigners.map(d => ({
        id: d.id,
        name: `${d.first_name} ${d.last_name}`,
        approved: d.is_approved
      })));
    }
    
    // Test 2: Anonymous role should only see approved designers
    console.log('\n2️⃣ Testing Anonymous Access (should only see approved)...');
    const { data: publicDesigners, error: anonError } = await anonSupabase
      .from('designers')
      .select('id, first_name, last_name, is_approved')
      .limit(10);
    
    if (anonError) {
      console.log('❌ Anonymous access failed:', anonError.message);
    } else {
      console.log(`✅ Anonymous role can see ${publicDesigners.length} designers`);
      const approvedCount = publicDesigners.filter(d => d.is_approved).length;
      const unapprovedCount = publicDesigners.filter(d => !d.is_approved).length;
      
      console.log(`📊 Approved: ${approvedCount}, Unapproved: ${unapprovedCount}`);
      
      if (unapprovedCount > 0) {
        console.log('⚠️  WARNING: Anonymous users can see unapproved designers!');
        console.log('🔧 This suggests RLS policy may not be working correctly');
      } else if (approvedCount > 0) {
        console.log('✅ RLS policy working correctly - only approved designers visible');
      } else {
        console.log('ℹ️  No approved designers found to test policy');
      }
    }
    
    // Test 3: Try to insert as anonymous (should work with "Anyone can register" policy)
    console.log('\n3️⃣ Testing Anonymous Insert (should be allowed)...');
    const testDesigner = {
      id: 'test-' + Date.now(),
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'Designer',
      is_approved: false
    };
    
    const { data: insertData, error: insertError } = await anonSupabase
      .from('designers')
      .insert(testDesigner)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Anonymous insert failed:', insertError.message);
      if (insertError.message.includes('violates row-level security policy')) {
        console.log('🔧 This suggests the INSERT policy may not be configured correctly');
      }
    } else {
      console.log('✅ Anonymous insert successful');
      console.log('📝 Created test designer:', insertData.id);
      
      // Clean up test data
      await supabase
        .from('designers')
        .delete()
        .eq('id', testDesigner.id);
      console.log('🧹 Cleaned up test data');
    }
    
    // Test 4: Check if RLS is actually enabled
    console.log('\n4️⃣ Checking RLS Status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('tablename', 'designers')
      .eq('schemaname', 'public')
      .single();
    
    if (rlsError) {
      console.log('❌ Could not check RLS status:', rlsError.message);
    } else {
      console.log(`✅ RLS Status for designers table: ${rlsStatus.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
      if (!rlsStatus.rowsecurity) {
        console.log('🔧 RLS is not enabled! Migration may have failed.');
      }
    }
    
    // Test 5: List all policies
    console.log('\n5️⃣ Checking Policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, cmd, qual, with_check')
      .eq('tablename', 'designers');
    
    if (policyError) {
      console.log('❌ Could not fetch policies:', policyError.message);
    } else {
      console.log(`✅ Found ${policies.length} policies:`);
      policies.forEach(policy => {
        console.log(`   📋 ${policy.policyname} (${policy.cmd})`);
      });
      
      const expectedPolicies = [
        'Public can view approved designers',
        'Designers can view own profile',
        'Designers can update own profile',
        'Anyone can register as designer',
        'Service role has full access'
      ];
      
      const foundPolicyNames = policies.map(p => p.policyname);
      const missingPolicies = expectedPolicies.filter(name => !foundPolicyNames.includes(name));
      
      if (missingPolicies.length > 0) {
        console.log('⚠️  Missing policies:', missingPolicies);
      } else {
        console.log('✅ All expected policies are present');
      }
    }
    
    // Test 6: Check indexes
    console.log('\n6️⃣ Checking Indexes...');
    const { data: indexes, error: indexError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .eq('tablename', 'designers')
      .like('indexname', 'idx_designers_%');
    
    if (indexError) {
      console.log('❌ Could not check indexes:', indexError.message);
    } else {
      console.log(`✅ Found ${indexes.length} custom indexes:`);
      indexes.forEach(idx => {
        console.log(`   📇 ${idx.indexname}`);
      });
      
      const expectedIndexes = ['idx_designers_approved', 'idx_designers_id'];
      const foundIndexNames = indexes.map(i => i.indexname);
      const missingIndexes = expectedIndexes.filter(name => !foundIndexNames.includes(name));
      
      if (missingIndexes.length > 0) {
        console.log('⚠️  Missing indexes:', missingIndexes);
      } else {
        console.log('✅ All expected indexes are present');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 RLS Migration Verification Complete!');
    
  } catch (error) {
    console.error('❌ Verification failed with error:', error);
  }
}

verifyRLSMigration();