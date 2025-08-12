async function testProductionAPI() {
  console.log('🌐 Testing Production API Response...\n');
  
  // Test the production API endpoint
  const matchId = 'd4a262ed-7dff-47e0-92ba-7a3be2cd8236';
  const apiUrl = `https://onedesigner2-j6wdtxcor-onedesigners-projects.vercel.app/api/client/matches/${matchId}`;
  
  console.log('Testing URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl);
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n📊 API Response Structure:');
      console.log('success:', data.success);
      console.log('match exists:', !!data.match);
      console.log('credits:', data.credits);
      
      if (data.match && data.match.designer) {
        console.log('\n👤 Designer Data in API Response:');
        console.log('ID:', data.match.designer.id);
        console.log('firstName:', data.match.designer.firstName);
        console.log('lastName:', data.match.designer.lastName);
        console.log('first_name (original):', data.match.designer.first_name);
        console.log('last_initial (original):', data.match.designer.last_initial);
        console.log('avatar_url:', data.match.designer.avatar_url);
        console.log('portfolioImages:', data.match.designer.portfolioImages);
        
        console.log('\n🔍 All Designer Keys:', Object.keys(data.match.designer));
        
        // Test avatar URL from the API response
        if (data.match.designer.avatar_url) {
          console.log('\n🖼️  Testing Avatar URL from API...');
          try {
            const avatarResponse = await fetch(data.match.designer.avatar_url);
            console.log(`Avatar Status: ${avatarResponse.status} ${avatarResponse.statusText}`);
            console.log(`Avatar Content-Type: ${avatarResponse.headers.get('content-type')}`);
            
            if (avatarResponse.ok) {
              console.log('✅ Avatar URL from API response is accessible');
            } else {
              console.log('❌ Avatar URL from API response is not accessible');
            }
          } catch (error) {
            console.error('❌ Error testing avatar URL from API:', error.message);
          }
        }
        
        console.log('\n🎯 Frontend Component Check:');
        const designer = data.match.designer;
        const hasFirstName = !!designer.firstName;
        const hasAvatarUrl = !!designer.avatar_url;
        
        console.log('Has firstName:', hasFirstName, '(value:', designer.firstName, ')');
        console.log('Has avatar_url:', hasAvatarUrl, '(value:', designer.avatar_url?.substring(0, 50) + '...)');
        
        if (hasFirstName && hasAvatarUrl) {
          console.log('✅ Frontend should be able to display the avatar image');
        } else {
          console.log('❌ Frontend would fall back to initials because:');
          if (!hasFirstName) console.log('  - Missing firstName');
          if (!hasAvatarUrl) console.log('  - Missing avatar_url');
        }
      } else {
        console.log('❌ No designer data in API response');
      }
    } else if (response.status === 401) {
      console.log('🔒 API returned 401 Unauthorized - this is expected for unauthenticated requests');
      console.log('💡 The avatar images should work when user is logged in');
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testProductionAPI().catch(console.error);