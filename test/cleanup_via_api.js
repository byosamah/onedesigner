const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDatabase() {
  console.log('Starting database cleanup...\n');
  
  try {
    // Order matters due to foreign key constraints
    const tables = [
      'project_requests',
      'client_designers', 
      'matches',
      'briefs',
      'designer_quick_stats',
      'designer_embeddings',
      'match_cache',
      'auth_tokens',
      'clients',
      'designers'
    ];
    
    for (const table of tables) {
      console.log(`Cleaning ${table}...`);
      
      // Special handling for tables without id column or that don't exist
      if (table === 'project_requests') {
        // Table doesn't exist, skip
        console.log(`✓ ${table} skipped (table not found)`);
        continue;
      }
      
      if (table === 'designer_quick_stats') {
        // This is a view or table without id column
        const { data, error } = await supabase
          .from(table)
          .delete()
          .gte('created_at', '1900-01-01'); // Delete all by using a date that matches all
        
        if (error) {
          console.error(`Error cleaning ${table}:`, error.message);
        } else {
          console.log(`✓ ${table} cleaned successfully`);
        }
        continue;
      }
      
      // For tables with UUID id columns
      const { data, error } = await supabase
        .from(table)
        .delete()
        .not('id', 'is', null); // Delete all rows where id is not null
      
      if (error) {
        console.error(`Error cleaning ${table}:`, error.message);
      } else {
        console.log(`✓ ${table} cleaned successfully`);
      }
    }
    
    console.log('\n--- Verification ---');
    
    // Verify cleanup
    const verifyTables = ['clients', 'designers', 'briefs', 'matches'];
    for (const table of verifyTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error verifying ${table}:`, error.message);
      } else {
        console.log(`${table}: ${count || 0} rows remaining`);
      }
    }
    
    console.log('\n✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanDatabase();