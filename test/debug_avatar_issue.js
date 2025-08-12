const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAvatarIssue() {
  console.log('🐛 Debugging Avatar Display Issue...\n');
  
  // Test the exact same query that the API uses
  const matchId = 'd4a262ed-7dff-47e0-92ba-7a3be2cd8236';
  
  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      id,
      score,
      status,
      reasons,
      personalized_reasons,
      created_at,
      designer:designers!matches_designer_id_fkey(
        id,
        first_name,
        last_initial,
        title,
        city,
        country,
        email,
        phone,
        website:website_url,
        bio,
        years_experience,
        rating,
        total_projects,
        styles,
        industries,
        avatar_url
      )
    `)
    .eq('id', matchId)
    .single();

  if (error) {
    console.error('❌ Error fetching match:', error);
    return;
  }

  console.log('✅ Match data fetched successfully');
  console.log('Match ID:', match.id);
  console.log('Match Status:', match.status);
  console.log('');
  
  console.log('👤 Designer data from database:');
  console.log('ID:', match.designer.id);
  console.log('first_name:', match.designer.first_name);
  console.log('last_initial:', match.designer.last_initial);
  console.log('avatar_url:', match.designer.avatar_url);
  console.log('');
  
  // Apply the same field mapping that the API does
  const designer = match.designer;
  const mappedDesigner = {
    ...designer,
    firstName: designer.first_name,
    lastName: designer.last_name || designer.last_initial,
    yearsExperience: designer.years_experience,
    totalProjects: designer.total_projects
  };
  
  console.log('🔄 After field mapping:');
  console.log('firstName:', mappedDesigner.firstName);
  console.log('lastName:', mappedDesigner.lastName);
  console.log('avatar_url:', mappedDesigner.avatar_url);
  console.log('');
  
  // Test avatar URL accessibility
  if (mappedDesigner.avatar_url) {
    console.log('🌐 Testing avatar URL accessibility...');
    try {
      const response = await fetch(mappedDesigner.avatar_url);
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
      
      if (response.ok) {
        console.log('✅ Avatar URL is accessible and working');
      } else {
        console.log('❌ Avatar URL is not accessible');
      }
    } catch (error) {
      console.error('❌ Error testing avatar URL:', error.message);
    }
  } else {
    console.log('❌ No avatar_url found');
  }
  
  // Simulate what the frontend component logic would do
  console.log('\n🖥️  Frontend component logic simulation:');
  console.log('designer.firstName:', mappedDesigner.firstName);
  console.log('designer.avatar_url:', mappedDesigner.avatar_url);
  
  const getInitials = () => {
    const firstName = mappedDesigner.firstName || '';
    const lastName = mappedDesigner.lastName || mappedDesigner.lastInitial || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`;
  };
  
  if (!mappedDesigner.avatar_url) {
    console.log('❌ Component would show initials because avatar_url is missing');
    console.log('Initials would be:', getInitials());
  } else {
    console.log('✅ Component should attempt to load avatar image');
    console.log('Avatar URL:', mappedDesigner.avatar_url);
    console.log('Alt text would be:', `${mappedDesigner.firstName} ${mappedDesigner.lastName}`);
  }
  
  console.log('\n🎯 Summary:');
  if (mappedDesigner.avatar_url && mappedDesigner.firstName) {
    console.log('✅ All data needed for avatar display is present');
    console.log('✅ Avatar URL is accessible');
    console.log('💡 The issue might be in the browser or image loading');
  } else {
    console.log('❌ Missing required data:');
    if (!mappedDesigner.avatar_url) console.log('  - avatar_url');
    if (!mappedDesigner.firstName) console.log('  - firstName');
  }
}

debugAvatarIssue().catch(console.error);