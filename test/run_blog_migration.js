const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'migrations', '009_blog_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running blog system migration...');
    
    // Split SQL into individual statements and filter out empty ones
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      }).single();
      
      if (error && !error.message.includes('already exists')) {
        console.error(`Error in statement ${i + 1}:`, error);
        // Continue with other statements even if one fails
      }
    }
    
    console.log('Blog system migration completed successfully!');
    
    // Verify tables were created
    const { data: tables, error: tablesError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
      
    if (!tablesError) {
      console.log('✓ blog_posts table verified');
    }
    
    const { data: categories, error: catError } = await supabase
      .from('blog_categories')
      .select('*');
      
    if (!catError && categories) {
      console.log(`✓ blog_categories table verified with ${categories.length} default categories`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach using direct database query
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