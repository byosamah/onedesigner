const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running migration to add missing columns...');
  
  try {
    // First, check if columns already exist by trying to select them
    const { data: checkData, error: checkError } = await supabase
      .from('designers')
      .select('id, project_types, specializations, software_skills, rejection_reason')
      .limit(1);
    
    if (checkError) {
      console.log('Some columns are missing, will add them now...');
      console.log('Error details:', checkError.message);
    } else {
      console.log('Columns might already exist. Current structure:', checkData);
    }
    
    // Run the migration using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        -- Add missing array columns to designers table
        ALTER TABLE designers
        ADD COLUMN IF NOT EXISTS project_types TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS software_skills TEXT[] DEFAULT '{}';
        
        -- Also add the rejection_reason column if it doesn't exist
        ALTER TABLE designers
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
      `
    });
    
    if (error) {
      // Try alternative approach - add columns one by one
      console.log('Direct SQL failed, trying alternative approach...');
      
      // Since we can't run ALTER TABLE directly, let's verify what columns exist
      const { data: tableInfo, error: infoError } = await supabase
        .from('designers')
        .select('*')
        .limit(1);
      
      if (infoError) {
        console.error('Error checking table structure:', infoError);
      } else {
        console.log('Current table structure (sample row):', Object.keys(tableInfo[0] || {}));
      }
      
      console.log('\nIMPORTANT: The columns need to be added manually via Supabase dashboard:');
      console.log('1. Go to https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/editor');
      console.log('2. Run this SQL:');
      console.log(`
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS project_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS software_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
      `);
    } else {
      console.log('Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration();