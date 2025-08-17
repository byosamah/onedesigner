const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCentralizedMatching() {
  console.log('🧪 Testing centralized matching system...\n');

  // Get a test designer and brief
  const { data: designer } = await supabase
    .from('designers')
    .select('*')
    .eq('is_approved', true)
    .eq('is_verified', true)
    .not('bio', 'is', null)
    .limit(1)
    .single();

  const { data: brief } = await supabase
    .from('briefs')
    .select('*')
    .limit(1)
    .single();

  if (!designer || !brief) {
    console.log('❌ No test data found');
    return;
  }

  console.log('📋 Test Data:');
  console.log('Designer:', designer.first_name, designer.last_name);
  console.log('Brief:', brief.project_type, '-', brief.industry);
  console.log('');

  // Test the centralized matcher functions
  const { 
    prepareDesignerForMatching, 
    prepareBriefForMatching,
    isDesignerValidForMatching,
    createCentralizedMatchPrompt 
  } = require('../src/lib/matching/centralized-matcher');

  // Validate designer
  const isValid = isDesignerValidForMatching(designer);
  console.log('✅ Designer valid for matching:', isValid);
  
  if (!isValid) {
    console.log('❌ Designer missing required fields');
    return;
  }

  // Prepare data
  const preparedDesigner = prepareDesignerForMatching(designer);
  const preparedBrief = prepareBriefForMatching(brief);

  console.log('\n📦 Prepared Designer (only matching fields):');
  console.log(JSON.stringify(preparedDesigner, null, 2));

  console.log('\n📦 Prepared Brief:');
  console.log(JSON.stringify(preparedBrief, null, 2));

  // Generate prompt
  const prompt = createCentralizedMatchPrompt(preparedDesigner, preparedBrief);
  
  console.log('\n📝 Generated Prompt Length:', prompt.length, 'characters');
  console.log('First 500 chars:', prompt.substring(0, 500) + '...');

  // Test with actual AI if API key is available
  if (process.env.DEEPSEEK_API_KEY) {
    console.log('\n🤖 Testing with DeepSeek AI...');
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a matchmaking AI. Analyze designer-client matches and respond with JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        console.log('\n✅ AI Response received');
        
        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Match Score:', parsed.matchScore);
          console.log('Recommended:', parsed.isRecommended);
          console.log('Confidence:', parsed.confidence);
        }
      } else {
        console.log('❌ AI request failed:', response.status);
      }
    } catch (error) {
      console.log('⚠️ Could not test with AI:', error.message);
    }
  } else {
    console.log('\n⚠️ Set DEEPSEEK_API_KEY to test with actual AI');
  }

  console.log('\n✅ Centralized matching test complete!');
}

testCentralizedMatching();