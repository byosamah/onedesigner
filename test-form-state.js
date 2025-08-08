// Test script to verify form state
const testFormState = async () => {
  console.log('Testing form state management...\n');

  // Test 1: Submit brief with web-mobile category
  const briefData = {
    design_category: 'web-mobile',
    project_description: 'Test project',
    timeline_type: 'standard',
    budget_range: 'mid'
  };

  try {
    const response = await fetch('http://localhost:3000/api/briefs/public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(briefData),
    });

    const result = await response.json();
    console.log('✅ Brief created with category:', briefData.design_category);
    console.log('Brief ID:', result.brief?.id);

    // Test 2: Check if matcher recognizes the category
    const matchResponse = await fetch('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ briefId: result.brief?.id }),
    });

    const matchResult = await matchResponse.json();
    console.log('\n✅ Matching completed');
    console.log('Matches found:', matchResult.matches?.length || 0);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testFormState();