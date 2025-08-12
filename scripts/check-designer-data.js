const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDesignerData() {
  console.log('Checking designer data for Osama Khalil...\n');
  
  try {
    // Find designer by email or name
    const { data: designers, error } = await supabase
      .from('designers')
      .select('*')
      .or('email.eq.osamah96@gmail.com,first_name.ilike.%osama%')
      .limit(5);
    
    if (error) {
      console.error('Error fetching designers:', error);
      return;
    }
    
    if (!designers || designers.length === 0) {
      console.log('No designer found with that email or name');
      return;
    }
    
    console.log(`Found ${designers.length} designer(s):\n`);
    
    for (const designer of designers) {
      console.log('='.repeat(80));
      console.log('Designer ID:', designer.id);
      console.log('Email:', designer.email);
      console.log('Name:', designer.first_name, designer.last_name);
      console.log('Title:', designer.title);
      console.log('Bio:', designer.bio);
      console.log('City:', designer.city);
      console.log('Country:', designer.country);
      console.log('Availability:', designer.availability);
      console.log('Years Experience:', designer.years_experience);
      console.log('Communication Style:', designer.communication_style);
      console.log('Working Style:', designer.working_style);
      console.log('Project Preferences:', designer.project_preferences);
      console.log('Remote Experience:', designer.remote_experience);
      console.log('Website URL:', designer.website_url);
      console.log('Portfolio URL:', designer.portfolio_url);
      console.log('Approved:', designer.is_approved);
      console.log('Verified:', designer.is_verified);
      console.log('Styles (array):', designer.styles);
      console.log('Industries (array):', designer.industries);
      
      // Check normalized tables
      console.log('\n--- Normalized Tables Data ---');
      
      // Check styles
      const { data: styles } = await supabase
        .from('designer_styles')
        .select('style')
        .eq('designer_id', designer.id);
      console.log('Styles (normalized):', styles?.map(s => s.style) || []);
      
      // Check project types
      const { data: projectTypes } = await supabase
        .from('designer_project_types')
        .select('project_type')
        .eq('designer_id', designer.id);
      console.log('Project Types:', projectTypes?.map(pt => pt.project_type) || []);
      
      // Check industries
      const { data: industries } = await supabase
        .from('designer_industries')
        .select('industry')
        .eq('designer_id', designer.id);
      console.log('Industries (normalized):', industries?.map(i => i.industry) || []);
      
      // Check specializations
      const { data: specializations } = await supabase
        .from('designer_specializations')
        .select('specialization')
        .eq('designer_id', designer.id);
      console.log('Specializations:', specializations?.map(s => s.specialization) || []);
      
      // Check software skills
      const { data: software } = await supabase
        .from('designer_software_skills')
        .select('software')
        .eq('designer_id', designer.id);
      console.log('Software Skills:', software?.map(s => s.software) || []);
      
      console.log('\n--- Important Fields Status ---');
      console.log('Has Basic Info:', !!(designer.first_name && designer.last_name && designer.title));
      console.log('Has Bio:', !!designer.bio);
      console.log('Has Location:', !!(designer.city && designer.country));
      console.log('Has Work Info:', !!(designer.working_style && designer.communication_style));
      console.log('Has Styles:', (designer.styles && designer.styles.length > 0) || (styles && styles.length > 0));
      console.log('Has Project Types:', projectTypes && projectTypes.length > 0);
      console.log('Has Industries:', (designer.industries && designer.industries.length > 0) || (industries && industries.length > 0));
      console.log('='.repeat(80));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDesignerData();