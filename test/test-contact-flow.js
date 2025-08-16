const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testContactFlow() {
  console.log('🔍 Testing Contact Designer Flow\n');
  
  // 1. Check if project_requests table exists
  console.log('1️⃣ Checking project_requests table...');
  const { data: tableCheck, error: tableError } = await supabase
    .from('project_requests')
    .select('*')
    .limit(1);
  
  if (tableError) {
    console.log('❌ Table error:', tableError.message);
    console.log('   Code:', tableError.code);
    
    if (tableError.code === '42P01') {
      console.log('\n⚠️ PROBLEM: project_requests table does not exist!');
      console.log('   This is why messages are not being stored.\n');
      
      // Create the table
      console.log('2️⃣ Creating project_requests table...');
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS project_requests (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
            client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
            designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            client_email VARCHAR(255),
            brief_details JSONB,
            approved_at TIMESTAMP,
            rejected_at TIMESTAMP,
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_project_requests_designer ON project_requests(designer_id);
          CREATE INDEX IF NOT EXISTS idx_project_requests_client ON project_requests(client_id);
          CREATE INDEX IF NOT EXISTS idx_project_requests_match ON project_requests(match_id);
        `
      });
      
      if (createError) {
        console.log('❌ Failed to create table:', createError);
        
        // Try alternative method
        console.log('\n3️⃣ Trying alternative SQL execution...');
        const { error: altError } = await supabase
          .from('project_requests')
          .insert({
            match_id: '00000000-0000-0000-0000-000000000000',
            client_id: '00000000-0000-0000-0000-000000000000',
            designer_id: '00000000-0000-0000-0000-000000000000',
            message: 'test'
          });
        
        if (altError && altError.code === '42P01') {
          console.log('❌ Table definitely does not exist. Manual creation needed.');
        }
      } else {
        console.log('✅ Table created successfully!');
      }
    }
  } else {
    console.log('✅ Table exists');
    console.log('   Rows in table:', tableCheck ? tableCheck.length : 0);
  }
  
  // 2. Check recent project requests
  console.log('\n4️⃣ Checking recent project requests...');
  const { data: recentRequests, error: recentError } = await supabase
    .from('project_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (recentError) {
    console.log('❌ Error fetching recent requests:', recentError.message);
  } else {
    console.log(`✅ Found ${recentRequests?.length || 0} recent requests`);
    if (recentRequests && recentRequests.length > 0) {
      recentRequests.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req.status} - ${req.message?.substring(0, 50)}...`);
        console.log(`      Created: ${new Date(req.created_at).toLocaleString()}`);
      });
    }
  }
  
  // 3. Check if emails are being sent
  console.log('\n5️⃣ Checking email service configuration...');
  console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   USE_EMAIL_SERVICE:', process.env.USE_EMAIL_SERVICE || 'Not set');
  
  // 4. Check for unlock notifications
  console.log('\n6️⃣ Checking unlock notification system...');
  const { data: unlockTable, error: unlockError } = await supabase
    .from('designer_notifications')
    .select('*')
    .limit(1);
  
  if (unlockError && unlockError.code === '42P01') {
    console.log('❌ designer_notifications table does not exist');
    console.log('   Unlock notifications are not being stored');
  } else {
    console.log('✅ designer_notifications table exists');
  }
  
  // 5. Test with a real match
  console.log('\n7️⃣ Finding a real unlocked match to test...');
  const { data: unlockedMatch, error: matchError } = await supabase
    .from('matches')
    .select(`
      id,
      client_id,
      designer_id,
      status,
      designers (
        id,
        email,
        first_name
      ),
      clients (
        id,
        email
      )
    `)
    .eq('status', 'unlocked')
    .limit(1)
    .single();
  
  if (matchError || !unlockedMatch) {
    console.log('⚠️ No unlocked matches found to test with');
  } else {
    console.log('✅ Found unlocked match:', unlockedMatch.id);
    console.log('   Client:', unlockedMatch.clients?.email);
    console.log('   Designer:', unlockedMatch.designers?.email);
    
    // Check if a project request exists for this match
    const { data: existingRequest } = await supabase
      .from('project_requests')
      .select('*')
      .eq('match_id', unlockedMatch.id)
      .single();
    
    if (existingRequest) {
      console.log('   ✅ Project request exists for this match');
      console.log('      Status:', existingRequest.status);
      console.log('      Message:', existingRequest.message?.substring(0, 50));
    } else {
      console.log('   ⚠️ No project request found for this unlocked match');
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Problems found:');
  if (tableError && tableError.code === '42P01') {
    console.log('• project_requests table is missing - needs to be created');
  }
  if (!process.env.RESEND_API_KEY) {
    console.log('• RESEND_API_KEY is not set - emails cannot be sent');
  }
  if (unlockError && unlockError.code === '42P01') {
    console.log('• designer_notifications table is missing - unlock notifications not working');
  }
}

// Run the test
testContactFlow().catch(console.error);