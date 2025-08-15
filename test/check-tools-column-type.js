const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkToolsColumn() {
  console.log('🔍 Checking tools column type and content...\n');
  
  // Get a designer with tools field
  const { data, error } = await supabase
    .from('designers')
    .select('id, email, tools')
    .limit(5);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Sample designers:');
  data.forEach(designer => {
    console.log(`\n${designer.email}:`);
    console.log('  tools type:', typeof designer.tools);
    console.log('  tools value:', designer.tools);
    console.log('  is array:', Array.isArray(designer.tools));
  });
  
  // Try to insert with array directly
  console.log('\n📝 Testing insert with array...');
  const testData = {
    email: 'tools-test-' + Date.now() + '@example.com',
    first_name: 'Tools',
    last_name: 'Test',
    last_initial: 'T',
    title: 'Test',
    country: 'USA',
    city: 'NYC',
    availability: 'immediate',
    bio: 'x'.repeat(500),
    is_approved: false,
    is_verified: true,
    years_experience: 2,
    rating: 4.5,
    total_projects: 0,
    tools: ['tool1', 'tool2', 'tool3'], // Try array directly
    created_at: new Date().toISOString()
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('designers')
    .insert(testData)
    .select()
    .single();
    
  if (insertError) {
    console.error('❌ Insert with array failed:', insertError.message);
  } else {
    console.log('✅ Insert with array succeeded');
    console.log('   Stored tools:', insertData.tools);
    
    // Clean up
    await supabase.from('designers').delete().eq('id', insertData.id);
  }
}

checkToolsColumn();