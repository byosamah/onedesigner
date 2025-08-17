const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMatchWithAPI() {
  console.log('🧪 Testing match analysis with actual API...\n');

  // Get test data
  const { data: designer } = await supabase
    .from('designers')
    .select('*')
    .eq('email', 'osama@osamakhalil.com')
    .single();

  const { data: brief } = await supabase
    .from('briefs')
    .select('*')
    .limit(1)
    .single();

  if (!designer || !brief) {
    console.log('❌ Test data not found');
    return;
  }

  console.log('📋 Test Data:');
  console.log('Designer:', designer.first_name, designer.last_name);
  console.log('  - Title:', designer.title);
  console.log('  - Bio:', designer.bio ? `${designer.bio.substring(0, 100)}...` : 'No bio');
  console.log('  - Country:', designer.country);
  console.log('  - City:', designer.city);
  console.log('  - Experience:', designer.years_experience);
  console.log('  - Availability:', designer.availability);
  console.log('  - Styles:', designer.styles);
  console.log('  - Industries:', designer.industries);
  console.log('');
  console.log('Brief:', brief.project_type, '-', brief.industry);
  console.log('  - Budget:', brief.budget);
  console.log('  - Timeline:', brief.timeline);
  console.log('  - Styles:', brief.styles);
  console.log('');

  // Test with DeepSeek API directly
  if (process.env.DEEPSEEK_API_KEY) {
    console.log('🤖 Testing with DeepSeek API...\n');
    
    // Create simplified prompt using only real fields
    const prompt = `
==== DESIGNER-CLIENT MATCH ANALYSIS ====

Analyze if this designer is a perfect match for this client's project.
Score from 0-100.

==== CLIENT PROJECT ====
- Project Type: ${brief.project_type}
- Industry: ${brief.industry}
- Budget: ${brief.budget}
- Timeline: ${brief.timeline}
- Design Styles: ${brief.styles?.join(', ') || 'Not specified'}
- Company: ${brief.company_name || 'Not specified'}
- Requirements: ${brief.requirements || 'Not specified'}

==== DESIGNER PROFILE ====
- Name: ${designer.first_name} ${designer.last_name}
- Title: ${designer.title || 'Not specified'}
- Experience: ${designer.years_experience || 'Not specified'} years
- Location: ${designer.city}, ${designer.country}
- Availability: ${designer.availability || 'Not specified'}

BIO & EXPERTISE:
${designer.bio || 'No bio provided'}

==== ANALYSIS REQUIRED ====

Evaluate the match and provide response in JSON format:
{
  "matchScore": [0-100],
  "isRecommended": [true/false],
  "confidence": ["high", "medium", "low"],
  "specificEvidence": ["reason1", "reason2", "reason3"],
  "matchDecision": "Brief explanation of decision",
  "potentialConcerns": ["concern1"] or [],
  "keyDistinction": "What makes this designer unique for this project"
}

Be realistic with scoring - most matches should be 60-85.`;

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
        
        console.log('✅ AI Response received\n');
        
        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('📊 Match Analysis:');
          console.log('  Score:', parsed.matchScore);
          console.log('  Recommended:', parsed.isRecommended);
          console.log('  Confidence:', parsed.confidence);
          console.log('  Decision:', parsed.matchDecision);
          console.log('\n  Evidence:');
          parsed.specificEvidence?.forEach(e => console.log('    -', e));
          if (parsed.potentialConcerns?.length > 0) {
            console.log('\n  Concerns:');
            parsed.potentialConcerns.forEach(c => console.log('    -', c));
          }
          console.log('\n  Key Distinction:', parsed.keyDistinction);
        }
      } else {
        console.log('❌ AI request failed:', response.status);
        const error = await response.text();
        console.log('Error:', error);
      }
    } catch (error) {
      console.log('⚠️ Error testing with AI:', error.message);
    }
  }

  console.log('\n✅ Test complete!');
}

testMatchWithAPI();