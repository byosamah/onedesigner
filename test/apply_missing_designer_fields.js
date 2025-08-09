const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔄 Applying missing designer fields...\n');

  // Since we can't execute SQL directly, let's create the tables using Supabase operations
  
  // Create designer_specializations table
  try {
    console.log('Creating designer_specializations table...');
    // We'll test if it exists by trying to insert
    const { error } = await supabase
      .from('designer_specializations')
      .insert({ designer_id: '00000000-0000-0000-0000-000000000000', specialization: 'test' });
    
    if (error && error.code === '42P01') {
      console.log('❌ Table designer_specializations needs to be created manually');
    } else {
      // Delete the test record
      await supabase
        .from('designer_specializations')
        .delete()
        .eq('designer_id', '00000000-0000-0000-0000-000000000000');
      console.log('✅ Table designer_specializations already exists');
    }
  } catch (e) {
    console.log('❌ Error with designer_specializations:', e.message);
  }

  // Create designer_software_skills table
  try {
    console.log('Creating designer_software_skills table...');
    const { error } = await supabase
      .from('designer_software_skills')
      .insert({ designer_id: '00000000-0000-0000-0000-000000000000', software: 'test' });
    
    if (error && error.code === '42P01') {
      console.log('❌ Table designer_software_skills needs to be created manually');
    } else {
      // Delete the test record
      await supabase
        .from('designer_software_skills')
        .delete()
        .eq('designer_id', '00000000-0000-0000-0000-000000000000');
      console.log('✅ Table designer_software_skills already exists');
    }
  } catch (e) {
    console.log('❌ Error with designer_software_skills:', e.message);
  }

  console.log('\n📝 To complete the migration, please run these SQL commands in Supabase SQL Editor:\n');
  
  console.log(`-- Add missing columns to designers table
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS dribbble_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS behance_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS previous_clients TEXT,
ADD COLUMN IF NOT EXISTS project_preferences TEXT,
ADD COLUMN IF NOT EXISTS working_style TEXT,
ADD COLUMN IF NOT EXISTS communication_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS remote_experience TEXT,
ADD COLUMN IF NOT EXISTS team_collaboration TEXT;

-- Create designer specializations table
CREATE TABLE IF NOT EXISTS designer_specializations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  specialization VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(designer_id, specialization)
);

-- Create designer software skills table
CREATE TABLE IF NOT EXISTS designer_software_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  software VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(designer_id, software)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_designer_specializations_designer_id ON designer_specializations(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_software_skills_designer_id ON designer_software_skills(designer_id);`);

  console.log('\n\n🔗 Go to: https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new');
  console.log('📋 Copy and paste the SQL above, then click "Run"\n');
}

applyMigration();