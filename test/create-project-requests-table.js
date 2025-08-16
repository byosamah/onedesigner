const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createProjectRequestsTable() {
  console.log('📦 Creating project_requests table...\n');
  
  try {
    // Create the table using raw SQL
    const { data, error } = await supabase
      .from('_migrations')
      .select('*')
      .limit(1);
    
    // If we can query any table, the connection works
    if (!error) {
      console.log('✅ Database connection successful\n');
    }
    
    // Now create the project_requests table
    console.log('Creating project_requests table...');
    
    // We'll insert a test record to force table creation via Supabase's auto-schema
    // Then delete it immediately
    const testData = {
      id: '00000000-0000-0000-0000-000000000001',
      match_id: '94e47939-2532-485c-80e4-7bc7dc8b7a2e', // Real match from test
      client_id: '52cc18a2-8aaf-40c6-971a-4a4f876e1ff5', // Real client
      designer_id: 'f7cf9b1e-79f8-4f9e-b25f-f03b02f8bb46', // Real designer
      message: 'Initial table creation test',
      status: 'pending',
      client_email: 'test@example.com',
      brief_details: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // First, let's check if we can create via insert
    const { data: insertData, error: insertError } = await supabase
      .from('project_requests')
      .insert(testData)
      .select();
    
    if (insertError) {
      if (insertError.code === '42P01' || insertError.message.includes('relation')) {
        console.log('Table does not exist. Creating it now...\n');
        
        // Use SQL Editor approach via RPC if available
        const createTableSQL = `
          -- Create project_requests table
          CREATE TABLE IF NOT EXISTS public.project_requests (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
            client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
            designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            client_email VARCHAR(255),
            brief_details JSONB,
            approved_at TIMESTAMP WITH TIME ZONE,
            rejected_at TIMESTAMP WITH TIME ZONE,
            rejection_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create indexes for performance
          CREATE INDEX IF NOT EXISTS idx_project_requests_designer ON public.project_requests(designer_id);
          CREATE INDEX IF NOT EXISTS idx_project_requests_client ON public.project_requests(client_id);
          CREATE INDEX IF NOT EXISTS idx_project_requests_match ON public.project_requests(match_id);
          CREATE INDEX IF NOT EXISTS idx_project_requests_status ON public.project_requests(status);
          CREATE INDEX IF NOT EXISTS idx_project_requests_created ON public.project_requests(created_at DESC);
          
          -- Enable RLS
          ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
          
          -- Create RLS policies
          CREATE POLICY "Service role can do everything" ON public.project_requests
            FOR ALL USING (true) WITH CHECK (true);
        `;
        
        console.log('📝 SQL to create table:');
        console.log(createTableSQL);
        console.log('\n⚠️ Please run this SQL in your Supabase SQL Editor:');
        console.log('   1. Go to https://app.supabase.com/project/frwchtwxpnrlpzksupgm/sql');
        console.log('   2. Paste the SQL above');
        console.log('   3. Click "Run"');
        console.log('\n');
        
        // Also create SQL file for easy execution
        const fs = require('fs');
        fs.writeFileSync('test/create_project_requests_table.sql', createTableSQL);
        console.log('💾 SQL saved to: test/create_project_requests_table.sql');
        
      } else {
        console.log('❌ Insert error:', insertError);
      }
    } else {
      console.log('✅ Table already exists! Test record created.');
      
      // Clean up test record
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('project_requests')
          .delete()
          .eq('id', insertData[0].id);
        
        if (!deleteError) {
          console.log('✅ Test record cleaned up');
        }
      }
    }
    
    // Check current state
    console.log('\n📊 Checking current project requests...');
    const { data: requests, error: fetchError } = await supabase
      .from('project_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!fetchError) {
      console.log(`Found ${requests?.length || 0} project requests`);
      if (requests && requests.length > 0) {
        requests.forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.status} - "${req.message?.substring(0, 50)}..."`);
        });
      }
    } else {
      console.log('Cannot fetch requests:', fetchError.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Also create unlock notifications table if missing
async function createUnlockNotificationsTable() {
  console.log('\n📦 Checking unlock notifications table...\n');
  
  const { data, error } = await supabase
    .from('designer_notifications')
    .select('*')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.log('❌ designer_notifications table missing');
    
    const createNotificationsSQL = `
      -- Create designer_notifications table
      CREATE TABLE IF NOT EXISTS public.designer_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_designer_notifications_designer ON public.designer_notifications(designer_id);
      CREATE INDEX IF NOT EXISTS idx_designer_notifications_read ON public.designer_notifications(read);
      CREATE INDEX IF NOT EXISTS idx_designer_notifications_created ON public.designer_notifications(created_at DESC);
      
      -- Enable RLS
      ALTER TABLE public.designer_notifications ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies
      CREATE POLICY "Service role can do everything" ON public.designer_notifications
        FOR ALL USING (true) WITH CHECK (true);
    `;
    
    console.log('📝 SQL to create notifications table:');
    console.log(createNotificationsSQL);
    
    const fs = require('fs');
    fs.writeFileSync('test/create_designer_notifications_table.sql', createNotificationsSQL);
    console.log('💾 SQL saved to: test/create_designer_notifications_table.sql');
  } else if (!error) {
    console.log('✅ designer_notifications table already exists');
  }
}

// Run both
async function main() {
  await createProjectRequestsTable();
  await createUnlockNotificationsTable();
  
  console.log('\n✨ Setup complete!');
  console.log('Next steps:');
  console.log('1. Run the SQL files in Supabase SQL Editor if tables are missing');
  console.log('2. Test the contact flow again');
}

main().catch(console.error);