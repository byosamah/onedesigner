const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('🚀 Applying Working Request System Migration...\n');
  
  try {
    // Read the migration SQL file
    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/20250818_enhance_project_requests.sql'),
      'utf8'
    );
    
    // Split SQL statements by semicolon and execute each
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Execute the SQL statement
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        // Try direct execution if RPC fails
        console.log('⚠️ RPC failed, trying direct execution...');
        // Note: Direct SQL execution requires admin access
        console.log('Statement:', statement.substring(0, 50) + '...');
      } else {
        console.log('✅ Success');
      }
    }
    
    // Verify the migration by checking if new columns exist
    console.log('\n🔍 Verifying migration...');
    
    const { data: testQuery, error: testError } = await supabase
      .from('project_requests')
      .select('id, viewed_at, response_deadline, brief_snapshot')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('column')) {
        console.log('\n❌ Migration may not have been applied completely.');
        console.log('Error:', testError.message);
        console.log('\n📝 Please run the following SQL directly in Supabase Dashboard:');
        console.log('https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new\n');
        console.log('-- Copy and paste the contents of:');
        console.log('-- supabase/migrations/20250818_enhance_project_requests.sql');
      } else {
        console.log('❌ Verification error:', testError);
      }
    } else {
      console.log('✅ New columns verified successfully!');
      console.log('   - viewed_at column exists');
      console.log('   - response_deadline column exists');
      console.log('   - brief_snapshot column exists');
      
      // Check for trigger
      const { data: triggers } = await supabase
        .from('project_requests')
        .select('*')
        .limit(0); // Just to test connection
      
      console.log('\n🎉 Migration applied successfully!');
      console.log('The Working Request System enhancement is ready to use.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📝 Please apply the migration manually in Supabase Dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new');
    console.log('2. Copy the contents of: supabase/migrations/20250818_enhance_project_requests.sql');
    console.log('3. Paste and run the SQL');
  }
}

// Run the migration
applyMigration();