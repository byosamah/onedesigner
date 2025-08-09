const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking designer tables and columns...\n');

  // Check if tables exist by trying to query them
  const tablesToCheck = [
    'designer_styles',
    'designer_project_types',
    'designer_industries',
    'designer_specializations',
    'designer_software_skills'
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' does not exist or is not accessible`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (e) {
      console.log(`❌ Table '${table}' check failed:`, e.message);
    }
  }

  // Check designers table columns
  console.log('\n🔍 Checking designers table columns...\n');
  
  try {
    const { data, error } = await supabase
      .from('designers')
      .select('id, portfolio_url, dribbble_url, behance_url, linkedin_url, previous_clients, project_preferences, working_style, communication_style, remote_experience, team_collaboration')
      .limit(1);

    if (error) {
      console.log('❌ Some enhanced columns might be missing:', error.message);
    } else {
      console.log('✅ All enhanced columns exist in designers table');
    }
  } catch (e) {
    console.log('❌ Failed to check designers table:', e.message);
  }
}

checkTables();