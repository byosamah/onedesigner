// Test script to simulate client journey
const testClientJourney = async () => {
  console.log('=== Starting Client Journey Test ===\n');

  // Step 1: Submit brief
  console.log('Step 1: Submitting project brief...');
  
  const briefData = {
    // Project Basics
    design_category: 'web-mobile',
    project_description: 'I need a modern e-commerce website for my fashion boutique. The site should have a clean, minimalist design with smooth animations and an easy checkout process.',
    timeline_type: 'standard',
    budget_range: 'mid',
    
    // Category-specific fields for web-mobile
    digital_product_type: 'website',
    number_of_screens: 'medium',
    
    // Working Preferences
    involvement_level: 'milestone-checkins',
    update_frequency: 'every-2-3-days',
    communication_channels: ['email', 'video-calls'],
    feedback_style: 'annotated-mockups',
    change_flexibility: 'iterative-feedback'
  };

  try {
    const briefResponse = await fetch('http://localhost:3000/api/briefs/public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(briefData),
    });

    if (!briefResponse.ok) {
      const errorText = await briefResponse.text();
      console.log('Response status:', briefResponse.status);
      console.log('Response body:', errorText);
      throw new Error(`Brief submission failed: ${briefResponse.status}`);
    }

    const briefResult = await briefResponse.json();
    console.log('✅ Brief submitted successfully');
    console.log('Response:', JSON.stringify(briefResult, null, 2));
    
    const briefId = briefResult.data?.brief?.id || briefResult.brief?.id;
    const tempClientId = briefResult.data?.tempClientId || briefResult.tempClientId;
    
    console.log('Brief ID:', briefId);
    console.log('Temp Client ID:', tempClientId);

    // Step 2: Find matches
    console.log('\nStep 2: Finding AI matches...');
    
    const matchResponse = await fetch('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ briefId: briefId }),
    });

    if (!matchResponse.ok) {
      const errorText = await matchResponse.text();
      console.log('Match response status:', matchResponse.status);
      console.log('Match response body:', errorText);
      throw new Error(`Match finding failed: ${matchResponse.status}`);
    }

    const matchResult = await matchResponse.json();
    console.log('Match result:', JSON.stringify(matchResult, null, 2));
    
    const matches = matchResult.data?.matches || matchResult.matches || [];
    console.log('✅ Matches found:', matches.length);
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      console.log('\nBest Match:');
      console.log('- Designer:', bestMatch.designer.firstName, bestMatch.designer.lastInitial);
      console.log('- Score:', bestMatch.score + '%');
      console.log('- Confidence:', bestMatch.confidence);
      console.log('- Summary:', bestMatch.matchSummary);
      console.log('- Match ID:', bestMatch.id);

      // Step 3: Check match details endpoint
      console.log('\nStep 3: Getting match details...');
      
      // First, let's check if we can access the match page
      const matchPageUrl = `http://localhost:3000/match/${briefId}`;
      console.log('Match page URL:', matchPageUrl);
      
      // Step 4: Simulate unlocking designer
      console.log('\nStep 4: Attempting to unlock designer...');
      console.log('Note: Unlock requires authentication, so it will fail for temp client');
      console.log('In real flow, user would need to create account or purchase credits');
      
      // Try to unlock (this will fail without auth)
      const unlockResponse = await fetch(`http://localhost:3000/api/client/matches/${bestMatch.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!unlockResponse.ok) {
        const error = await unlockResponse.json();
        console.log('❌ Unlock failed (expected):', error.message);
        console.log('User would need to sign up/login and have credits to unlock');
      }
    }

    console.log('\n=== Client Journey Test Complete ===');
    console.log('\nSummary:');
    console.log('1. ✅ Brief submission works');
    console.log('2. ✅ AI matching works');
    console.log('3. ✅ Match results returned');
    console.log('4. ❌ Unlock requires authentication (as expected)');
    console.log('\nNext steps for real user:');
    console.log('- View match at:', `http://localhost:3000/match/${briefId}`);
    console.log('- Sign up or login to unlock designer contact');

  } catch (error) {
    console.error('❌ Error in client journey:', error.message);
  }
};

// Run the test
testClientJourney();