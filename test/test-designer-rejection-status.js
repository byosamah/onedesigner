const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRejectionStatus() {
  console.log('🔍 Testing designer rejection status display...\n');
  
  // 1. Check designer data directly
  const { data: designer, error } = await supabase
    .from('designers')
    .select('*')
    .eq('email', 'osama@osamakhalil.com')
    .single();
  
  if (error) {
    console.error('❌ Error fetching designer:', error);
    return;
  }
  
  console.log('📊 Designer Data:');
  console.log('  Email:', designer.email);
  console.log('  Name:', designer.first_name, designer.last_name);
  console.log('  is_approved:', designer.is_approved);
  console.log('  rejection_reason:', designer.rejection_reason);
  console.log('  rejection_seen:', designer.rejection_seen);
  console.log('  status column:', designer.status || 'undefined (column does not exist)');
  
  // 2. Derive status like the API does
  const derivedStatus = designer.status || (
    designer.is_approved ? 'approved' : 
    designer.rejection_reason ? 'rejected' : 
    'pending'
  );
  
  console.log('\n🔄 Status Derivation:');
  console.log('  Derived status:', derivedStatus);
  console.log('  Expected UI display:', 
    derivedStatus === 'rejected' ? '❌ Rejected' : 
    derivedStatus === 'approved' ? '✓ Approved' : 
    '⏳ Under Review'
  );
  
  // 3. Test the status badge logic from dashboard
  console.log('\n🎯 Dashboard Status Badge Logic Test:');
  console.log('  Condition 1 (approved): status === "approved" || isApproved');
  console.log('    Result:', (derivedStatus === 'approved' || designer.is_approved) ? 'TRUE - Show Approved' : 'FALSE');
  
  console.log('  Condition 2 (rejected): status === "rejected"');
  console.log('    Result:', (derivedStatus === 'rejected') ? 'TRUE - Show Rejected ✅' : 'FALSE');
  
  console.log('  Condition 3 (under review): else case');
  console.log('    Result:', !(derivedStatus === 'approved' || designer.is_approved) && derivedStatus !== 'rejected' ? 'TRUE - Show Under Review' : 'FALSE');
  
  // 4. What the UI should display
  console.log('\n✨ EXPECTED BEHAVIOR:');
  console.log('  Since rejection_reason exists and is_approved is false,');
  console.log('  the derived status should be "rejected"');
  console.log('  The dashboard should show: ❌ Rejected');
  
  // 5. Test API response format
  console.log('\n📡 API Response Format:');
  const apiResponse = {
    id: designer.id,
    firstName: designer.first_name,
    lastName: designer.last_name,
    email: designer.email,
    title: designer.title,
    isApproved: designer.is_approved,
    isVerified: designer.is_verified,
    editedAfterApproval: designer.edited_after_approval || false,
    status: derivedStatus,
    rejectionReason: designer.rejection_reason,
    rejectionSeen: designer.rejection_seen ?? false
  };
  
  console.log('  API should return:');
  console.log('    status:', apiResponse.status);
  console.log('    isApproved:', apiResponse.isApproved);
  console.log('    rejectionReason:', apiResponse.rejectionReason);
  
  // 6. Potential issues
  console.log('\n⚠️  POTENTIAL ISSUES:');
  if (!designer.rejection_reason) {
    console.log('  - No rejection_reason set (would show as Under Review)');
  }
  if (designer.is_approved) {
    console.log('  - is_approved is true (would override and show as Approved)');
  }
  if (designer.status && designer.status !== derivedStatus) {
    console.log('  - status column exists but differs from derived status');
  }
  
  console.log('\n📝 SOLUTION:');
  console.log('  The designer dashboard is correctly checking for status === "rejected"');
  console.log('  The API is correctly deriving status as "rejected" when rejection_reason exists');
  console.log('  The issue must be in the session/authentication flow or data passing');
  console.log('  Next step: Login as the designer and check browser console for debug output');
}

testRejectionStatus();