const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrationDirect() {
  try {
    const sqlPath = path.join(__dirname, '..', 'migrations', '009_blog_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running blog system migration using direct approach...');
    
    // For Supabase, we need to use the SQL editor approach
    // Since we can't directly execute DDL statements through the client
    console.log('\n📋 Please run the following SQL in Supabase SQL Editor:');
    console.log('=====================================');
    console.log(sql);
    console.log('=====================================');
    console.log('\nOr use the Supabase CLI: supabase db push');
    
    // Let's at least verify connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (!error) {
      console.log('\n✓ Supabase connection verified');
      console.log('Please run the migration SQL manually in Supabase dashboard');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the migration
runMigrationDirect();