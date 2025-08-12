const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running migration 009_project_requests_table.sql...');
    
    const migration = fs.readFileSync('/Users/osamakhalil/OneDesigner/migrations/009_project_requests_table.sql', 'utf8');
    
    // Split by semicolons and run each statement
    const statements = migration.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
        if (error) {
          console.error('Error executing statement:', error);
        }
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();