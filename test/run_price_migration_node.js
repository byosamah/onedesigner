const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 Running project price migration...');
  console.log('This will add project_price_from and project_price_to columns to the designers table\n');

  try {
    // First check if columns already exist
    const { data: checkColumns, error: checkError } = await supabase
      .from('designers')
      .select('id, project_price_from, project_price_to')
      .limit(1);

    if (!checkError) {
      console.log('✅ Columns already exist! No migration needed.');
      return;
    }

    // If error, columns might not exist, so let's add them
    console.log('📝 Columns not found, adding them now...');
    
    // Since we can't run raw SQL through Supabase client, let's just log what needs to be done
    console.log('\n⚠️  The columns need to be added manually through Supabase SQL Editor:');
    console.log('Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new\n');
    
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'add_project_price_columns.sql'), 'utf8');
    console.log('Copy and paste this SQL:\n');
    console.log('----------------------------------------');
    console.log(migrationSQL);
    console.log('----------------------------------------\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();