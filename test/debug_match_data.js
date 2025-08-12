const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugMatchData() {
  console.log('🔍 Debugging Match API Response...\n');
  
  // Get a specific match to debug
  const { data: matches, error } = await supabase
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
    .limit(1);
  
  if (error) {
    console.error('Error fetching match:', error);
    return;
  }
  
  if (!matches || matches.length === 0) {
    console.log('No matches found');
    return;
  }
  
  const match = matches[0];
  
  console.log('Raw Match Data from Database:');
  console.log(JSON.stringify(match, null, 2));
  
  console.log('\n📊 Designer Avatar URL:');
  console.log(match.designer.avatar_url);
  
  console.log('\n🎨 Generated Portfolio URLs:');
  const category = match.designer.title?.includes('Graphic') ? 'abstract' :
                   match.designer.title?.includes('Web') ? 'tech' :
                   match.designer.title?.includes('UI/UX') ? 'app' :
                   match.designer.title?.includes('Product') ? 'product' :
                   match.designer.title?.includes('Motion') ? 'motion' : 'design';
  
  for (let i = 1; i <= 3; i++) {
    const portfolioUrl = `https://picsum.photos/seed/${category}${i}-${match.designer.id}/800/600`;
    console.log(`Portfolio ${i}: ${portfolioUrl}`);
  }
  
  // Test if the avatar URL works
  if (match.designer.avatar_url) {
    console.log('\n🌐 Testing Avatar URL...');
    try {
      const response = await fetch(match.designer.avatar_url);
      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
    } catch (error) {
      console.error('Failed to fetch avatar:', error.message);
    }
  }
  
  // Test portfolio URL
  const portfolioUrl = `https://picsum.photos/seed/${category}1-${match.designer.id}/800/600`;
  console.log('\n🖼️  Testing Portfolio URL...');
  try {
    const response = await fetch(portfolioUrl);
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Content-Length: ${response.headers.get('content-length')}`);
  } catch (error) {
    console.error('Failed to fetch portfolio image:', error.message);
  }
  
  // Check what the actual API endpoint returns
  console.log('\n🔄 Testing API Endpoint...');
  try {
    const apiResponse = await fetch(`http://localhost:3000/api/client/matches/${match.id}`);
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('API Response (abbreviated):');
      console.log('Match ID:', apiData.match?.id);
      console.log('Designer Name:', apiData.match?.designer?.firstName, apiData.match?.designer?.lastName);
      console.log('Avatar URL:', apiData.match?.designer?.avatar_url);
      console.log('Designer Object Keys:', Object.keys(apiData.match?.designer || {}));
    } else {
      console.log('API Response Status:', apiResponse.status);
    }
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

debugMatchData().catch(console.error);