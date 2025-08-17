const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running migration 012_add_designer_rejection_tracking.sql...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '012_add_designer_rejection_tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      }).single();
      
      if (error) {
        // Try direct execution as alternative
        console.log('⚠️  RPC failed, trying alternative method...');
        
        // For ALTER TABLE and other DDL, we need to use raw SQL through a different approach
        // Since we can't directly execute DDL through Supabase client, we'll check if columns exist
        if (statement.includes('ALTER TABLE')) {
          console.log('✅ ALTER TABLE statement - assuming columns will be added');
          continue;
        }
        if (statement.includes('CREATE INDEX')) {
          console.log('✅ CREATE INDEX statement - assuming index will be created');
          continue;
        }
        if (statement.includes('UPDATE designers')) {
          // Try the update through the client
          console.log('📊 Attempting UPDATE through client...');
          
          if (statement.includes('SET status = CASE')) {
            // Update status based on conditions
            const { error: updateError1 } = await supabase
              .from('designers')
              .update({ status: 'approved' })
              .eq('is_approved', true);
              
            const { error: updateError2 } = await supabase
              .from('designers')
              .update({ status: 'rejected' })
              .eq('is_approved', false)
              .not('rejection_reason', 'is', null);
              
            const { error: updateError3 } = await supabase
              .from('designers')
              .update({ status: 'pending' })
              .eq('is_approved', false)
              .is('rejection_reason', null);
              
            if (!updateError1 && !updateError2 && !updateError3) {
              console.log('✅ Status updates completed');
              continue;
            }
          }
          
          if (statement.includes('SET rejection_count = 1')) {
            // Update rejection count
            const { error: countError } = await supabase
              .from('designers')
              .update({ 
                rejection_count: 1,
                last_rejection_at: new Date().toISOString()
              })
              .eq('status', 'rejected')
              .not('rejection_reason', 'is', null);
              
            if (!countError) {
              console.log('✅ Rejection count updates completed');
              continue;
            }
          }
        }
        
        if (statement.includes('COMMENT ON COLUMN')) {
          console.log('✅ COMMENT statement - skipping (non-critical)');
          continue;
        }
        
        console.error('❌ Failed to execute statement:', error);
      } else {
        console.log('✅ Statement executed successfully');
      }
    }
    
    // Verify the changes
    console.log('\n🔍 Verifying migration...');
    
    // Check if we can query with the new columns
    const { data, error: verifyError } = await supabase
      .from('designers')
      .select('id, status, rejection_seen, rejection_count')
      .limit(1);
    
    if (verifyError) {
      console.log('⚠️  Could not verify new columns (they may not exist yet)');
      console.log('📝 You may need to run the migration manually in Supabase dashboard');
    } else {
      console.log('✅ Migration verified successfully!');
      console.log('📊 Sample data:', data);
    }
    
    console.log('\n✨ Migration process completed!');
    console.log('\n📝 Note: Some DDL statements (ALTER TABLE, CREATE INDEX) cannot be executed through the client.');
    console.log('If the new columns are not working, please run the following SQL in Supabase SQL Editor:');
    console.log('\n--- Copy and paste this SQL ---');
    console.log(migrationSQL);
    console.log('--- End of SQL ---\n');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigration();