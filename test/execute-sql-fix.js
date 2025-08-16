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

async function executeSQLFix() {
  console.log('🚀 Executing SQL fix for contact and notification tables...\n');
  
  try {
    // Since we can't execute raw SQL directly, we'll use Supabase's rpc function
    // First, let's check if the tables exist by trying to query them
    
    console.log('1️⃣ Checking if project_requests table exists...');
    const { data: prCheck, error: prError } = await supabase
      .from('project_requests')
      .select('count')
      .limit(0);
    
    if (prError && prError.code === 'PGRST205') {
      console.log('❌ project_requests table does not exist');
      console.log('   Creating it now...');
      
      // We need to use the Supabase dashboard or API with admin privileges
      // Let's try using the management API if available
      const createTableResult = await fetch('https://frwchtwxpnrlpzksupgm.supabase.co/rest/v1/rpc/exec_raw_sql', {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
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
            
            -- Create indexes
            CREATE INDEX IF NOT EXISTS idx_project_requests_designer ON public.project_requests(designer_id);
            CREATE INDEX IF NOT EXISTS idx_project_requests_client ON public.project_requests(client_id);
            CREATE INDEX IF NOT EXISTS idx_project_requests_match ON public.project_requests(match_id);
            CREATE INDEX IF NOT EXISTS idx_project_requests_status ON public.project_requests(status);
            
            -- Enable RLS
            ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
            
            -- Create RLS policy
            CREATE POLICY "Service role full access" ON public.project_requests
              FOR ALL USING (true) WITH CHECK (true);
          `
        })
      });
      
      if (!createTableResult.ok) {
        console.log('⚠️ Could not create table via API');
        console.log('   Manual creation required in Supabase dashboard');
      } else {
        console.log('✅ project_requests table created successfully!');
      }
    } else {
      console.log('✅ project_requests table already exists');
    }
    
    console.log('\n2️⃣ Checking if designer_notifications table exists...');
    const { data: dnCheck, error: dnError } = await supabase
      .from('designer_notifications')
      .select('count')
      .limit(0);
    
    if (dnError && dnError.code === 'PGRST205') {
      console.log('❌ designer_notifications table does not exist');
      console.log('   Creating it now...');
      
      const createNotificationsResult = await fetch('https://frwchtwxpnrlpzksupgm.supabase.co/rest/v1/rpc/exec_raw_sql', {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            -- Create designer_notifications table
            CREATE TABLE IF NOT EXISTS public.designer_notifications (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE NOT NULL,
              type VARCHAR(50) NOT NULL CHECK (type IN ('unlock', 'contact', 'approval', 'system')),
              title TEXT NOT NULL,
              message TEXT NOT NULL,
              data JSONB,
              read BOOLEAN DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Create indexes
            CREATE INDEX IF NOT EXISTS idx_designer_notifications_designer ON public.designer_notifications(designer_id);
            CREATE INDEX IF NOT EXISTS idx_designer_notifications_read ON public.designer_notifications(read);
            CREATE INDEX IF NOT EXISTS idx_designer_notifications_type ON public.designer_notifications(type);
            
            -- Enable RLS
            ALTER TABLE public.designer_notifications ENABLE ROW LEVEL SECURITY;
            
            -- Create RLS policy
            CREATE POLICY "Service role full access" ON public.designer_notifications
              FOR ALL USING (true) WITH CHECK (true);
          `
        })
      });
      
      if (!createNotificationsResult.ok) {
        console.log('⚠️ Could not create table via API');
        console.log('   Manual creation required in Supabase dashboard');
      } else {
        console.log('✅ designer_notifications table created successfully!');
      }
    } else {
      console.log('✅ designer_notifications table already exists');
    }
    
    // Alternative approach: Try to use database functions if they exist
    console.log('\n3️⃣ Attempting alternative SQL execution method...');
    
    // Check if we have a SQL execution function
    const { data: funcCheck, error: funcError } = await supabase
      .rpc('exec_sql', { 
        sql_query: 'SELECT 1' 
      });
    
    if (!funcError) {
      console.log('✅ SQL execution function available!');
      
      // Read the SQL file
      const fs = require('fs');
      const sqlContent = fs.readFileSync('test/fix-contact-and-notifications.sql', 'utf8');
      
      // Execute the SQL
      const { data: execResult, error: execError } = await supabase
        .rpc('exec_sql', { 
          sql_query: sqlContent 
        });
      
      if (!execError) {
        console.log('✅ SQL executed successfully!');
      } else {
        console.log('❌ SQL execution error:', execError.message);
      }
    } else {
      console.log('⚠️ No SQL execution function available');
      console.log('   You need to run the SQL manually in Supabase dashboard');
    }
    
    // Final check
    console.log('\n4️⃣ Final verification...');
    
    // Try to count rows in both tables
    const { count: prCount, error: prCountError } = await supabase
      .from('project_requests')
      .select('*', { count: 'exact', head: true });
    
    const { count: dnCount, error: dnCountError } = await supabase
      .from('designer_notifications')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📊 Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!prCountError) {
      console.log('✅ project_requests table EXISTS');
      console.log(`   Rows: ${prCount || 0}`);
    } else {
      console.log('❌ project_requests table MISSING');
      console.log('   Error:', prCountError.message);
    }
    
    if (!dnCountError) {
      console.log('✅ designer_notifications table EXISTS');
      console.log(`   Rows: ${dnCount || 0}`);
    } else {
      console.log('❌ designer_notifications table MISSING');
      console.log('   Error:', dnCountError.message);
    }
    
    if (prCountError || dnCountError) {
      console.log('\n⚠️ MANUAL ACTION REQUIRED:');
      console.log('1. Go to: https://app.supabase.com/project/frwchtwxpnrlpzksupgm/sql');
      console.log('2. Copy the SQL from: test/fix-contact-and-notifications.sql');
      console.log('3. Paste and run it in the SQL editor');
      console.log('\nThis will create the missing tables and enable the contact/notification system.');
    } else {
      console.log('\n✅ All tables exist! The system should be working now.');
      console.log('Test it by:');
      console.log('1. Contacting a designer from the client dashboard');
      console.log('2. Unlocking a designer to trigger notifications');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
executeSQLFix().catch(console.error);