const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPortfolioSchema() {
  console.log('🔍 Checking Portfolio Schema...\n');
  
  // Check if designer_portfolio_images table exists
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%portfolio%');
  
  if (tableError) {
    console.error('Error checking tables:', tableError.message);
  } else {
    console.log('Tables with "portfolio" in name:', tables.map(t => t.table_name));
  }
  
  // Check designers table structure  
  const { data: columns, error: columnError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'designers')
    .ilike('column_name', '%portfolio%');
  
  if (columnError) {
    console.error('Error checking columns:', columnError.message);
  } else {
    console.log('Portfolio-related columns in designers table:', columns);
  }
  
  // Check a sample designer record to see what fields exist
  const { data: sampleDesigner, error: designerError } = await supabase
    .from('designers')
    .select('*')
    .limit(1)
    .single();
  
  if (designerError) {
    console.error('Error getting sample designer:', designerError.message);
  } else {
    console.log('\nSample designer fields:');
    console.log(Object.keys(sampleDesigner));
    
    // Check if portfolio_projects field exists and what it contains
    if (sampleDesigner.portfolio_projects) {
      console.log('\nportfolio_projects field exists:', typeof sampleDesigner.portfolio_projects);
      console.log('Value:', sampleDesigner.portfolio_projects);
    } else {
      console.log('\nNo portfolio_projects field found');
    }
  }
}

checkPortfolioSchema().catch(console.error);