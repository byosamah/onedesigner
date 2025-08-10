#\!/bin/bash

# Test AI Matching Flow with Seeded Designers
echo "🚀 Testing AI Matching Flow"
echo "================================"

# Base URL
BASE_URL="http://localhost:3000"

# Step 1: Create a test brief with all required fields
echo ""
echo "Step 1: Creating test brief..."
echo "-------------------------------"

BRIEF_DATA='{
  "design_category": "branding-logo",
  "company_name": "Test Company AI",
  "industry_sector": "saas",
  "project_description": "We need a modern, minimal logo for our SaaS platform that helps businesses automate their workflows. Looking for clean, professional design with tech-forward aesthetic.",
  "target_audience": "B2B tech companies, startups, enterprise",
  "brand_personality": "Professional, innovative, trustworthy",
  "timeline_type": "standard",
  "budget_range": "mid",
  "involvement_level": "moderate",
  "update_frequency": "weekly",
  "communication_channels": ["email", "slack"],
  "feedback_style": "detailed",
  "change_flexibility": "moderate",
  "brand_identity_type": "new-brand",
  "brand_deliverables": ["logo", "color-palette", "typography"],
  "industry_sector": "saas",
  "logo_style": ["wordmark", "abstract"],
  "design_style_keywords": ["minimal", "modern", "technical"],
  "timeline": "standard",
  "budget": "mid",
  "styles": ["minimal", "modern", "technical"],
  "requirements": "We need a modern, minimal logo for our SaaS platform"
}'

BRIEF_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/briefs/public" \
  -H "Content-Type: application/json" \
  -d "${BRIEF_DATA}")

BRIEF_ID=$(echo $BRIEF_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')

if [ -z "$BRIEF_ID" ]; then
  echo "✗ Failed to create brief"
  echo "Response: $BRIEF_RESPONSE"
  exit 1
fi

echo "✅ Brief created with ID: ${BRIEF_ID}"

# Step 2: Test AI Matching
echo ""
echo "Step 2: Testing AI Matching..."
echo "-------------------------------"
echo "Looking for designers that match:"
echo "  📁 Category: Branding & Logo"
echo "  🏢 Industry: SaaS"
echo "  🎨 Style: Minimal, Modern, Technical"
echo ""

# Call the matching endpoint
MATCH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/match/find" \
  -H "Content-Type: application/json" \
  -d "{\"briefId\": \"${BRIEF_ID}\"}")

# Check if we got matches
if echo "$MATCH_RESPONSE" | grep -q '"error"'; then
  echo "✗ Matching failed"
  echo "Error: $(echo $MATCH_RESPONSE | grep -o '"error":"[^"]*' | sed 's/"error":"//')"
  
  # Debug: Check for approved designers
  echo ""
  echo "Debugging: Checking for approved designers..."
  node -e "
    require('dotenv').config({ path: '.env.local' });
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    (async () => {
      const { data: designers, count } = await supabase
        .from('designers')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)
        .eq('is_verified', true)
        .neq('availability', 'busy');
      
      console.log('Found', count, 'approved & available designers in database');
    })();
  "
  exit 1
fi

# Parse the match results
echo "✅ AI Matching completed successfully\!"
echo ""

# Extract match details using Node.js for better JSON parsing
echo "$MATCH_RESPONSE" | node -e "
const fs = require('fs');
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const matchData = JSON.parse(input);
    
    if (matchData.matches && matchData.matches.length > 0) {
      console.log('📊 MATCH RESULTS');
      console.log('================');
      
      matchData.matches.slice(0, 3).forEach((match, i) => {
        console.log('');
        console.log(\`🏆 Match #\${i + 1}\`);
        console.log('-------------------');
        console.log(\`👤 Designer: \${match.designer.firstName} \${match.designer.lastInitial || match.designer.lastName?.charAt(0)}\`);
        console.log(\`💼 Title: \${match.designer.title}\`);
        console.log(\`📍 Location: \${match.designer.city}, \${match.designer.country}\`);
        console.log(\`⭐ Score: \${match.score}/100\`);
        console.log(\`📊 Confidence: \${match.confidence}\`);
        console.log(\`🤖 AI Analyzed: \${match.aiAnalyzed ? '✅ Yes (DeepSeek AI)' : '⚠️ No (Fallback scoring)'}\`);
        
        if (match.matchSummary) {
          console.log(\`\n💬 AI Summary:\`);
          console.log(\`   \"\${match.matchSummary.substring(0, 200)}...\"\`);
        }
        
        if (match.reasons && match.reasons.length > 0) {
          console.log(\`\n✨ Match Reasons:\`);
          match.reasons.slice(0, 3).forEach(reason => {
            console.log(\`   • \${reason}\`);
          });
        }
        
        if (match.scoreBreakdown && match.aiAnalyzed) {
          console.log(\`\n📈 AI Score Breakdown:\`);
          Object.entries(match.scoreBreakdown).forEach(([key, value]) => {
            const label = key.replace(/([A-Z])/g, ' \$1').trim();
            const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
            console.log(\`   • \${capitalizedLabel}: \${value} points\`);
          });
        }
      });
      
      console.log('');
      console.log('═══════════════════════════════');
      console.log(\`✨ Total matches found: \${matchData.matches.length}\`);
      
      // Check if AI was used
      const aiMatches = matchData.matches.filter(m => m.aiAnalyzed);
      console.log(\`🤖 AI-analyzed matches: \${aiMatches.length}/\${matchData.matches.length}\`);
      
      if (aiMatches.length === 0) {
        console.log('');
        console.log('⚠️  WARNING: No matches were analyzed by AI\!');
        console.log('   Possible issues:');
        console.log('   • DeepSeek API key not configured in .env.local');
        console.log('   • API is unreachable or down');
        console.log('   • Rate limiting or API errors');
        console.log('   ');
        console.log('   Currently using fallback scoring only.');
      } else {
        console.log('');
        console.log('✅ SUCCESS: AI (DeepSeek) is working correctly\!');
        console.log('   The matching system is using AI to analyze designer-client compatibility.');
      }
      
    } else {
      console.log('❌ No matches found in response');
      console.log('This could mean:');
      console.log('  • No approved designers in database');
      console.log('  • All designers are marked as busy');
      console.log('  • Database query failed');
    }
  } catch (e) {
    console.error('Error parsing response:', e.message);
    console.log('Raw response (first 500 chars):', input.substring(0, 500));
  }
});
"

echo ""
echo "================================"
echo "📋 TEST SUMMARY"
echo "================================"
echo "  ✅ Brief submission: SUCCESS"
echo "  ✅ Matching endpoint: SUCCESS"
echo "  📊 AI Status: Check results above"
echo ""
echo "The test has completed. Review the results above to verify:"
echo "  1. Designers are being matched based on brief criteria"
echo "  2. AI is analyzing and scoring matches (if configured)"
echo "  3. Scores and reasons are relevant to the brief"
