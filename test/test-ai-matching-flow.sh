#!/bin/bash

echo "=== Testing AI Matching Flow ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
if [ -z "$1" ]; then
  BASE_URL="http://localhost:3000"
else
  BASE_URL="$1"
fi

echo "Testing against: $BASE_URL"
echo ""

# Step 1: Submit a test brief
echo -e "${YELLOW}Step 1: Submitting test brief...${NC}"
BRIEF_RESPONSE=$(curl -s -X POST "$BASE_URL/api/briefs/public" \
  -H "Content-Type: application/json" \
  -d '{
    "design_category": "branding-logo",
    "project_description": "I need a modern logo for my tech startup that specializes in AI-powered design tools. Looking for something clean and innovative.",
    "timeline_type": "standard",
    "budget_range": "mid",
    "target_audience": "Tech-savvy professionals and designers",
    "design_style_keywords": ["modern", "minimalist", "tech", "innovative"],
    "design_examples": ["Apple", "Stripe", "Notion"],
    "industry_sector": "Technology",
    "brand_identity_type": "new-brand",
    "brand_assets_status": "no-assets",
    "logo_style_preference": "abstract-mark",
    "deliverables_needed": ["primary-logo", "color-variations", "brand-guidelines"]
  }')

# Extract brief ID
BRIEF_ID=$(echo $BRIEF_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BRIEF_ID" ]; then
  echo -e "${RED}❌ Failed to create brief${NC}"
  echo "Response: $BRIEF_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Brief created successfully${NC}"
echo "Brief ID: $BRIEF_ID"
echo ""

# Step 2: Fetch AI matches
echo -e "${YELLOW}Step 2: Fetching AI matches for brief...${NC}"
MATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/match" \
  -H "Content-Type: application/json" \
  -d "{\"briefId\":\"$BRIEF_ID\"}")

# Check if matches were found
if echo "$MATCH_RESPONSE" | grep -q '"matches"'; then
  echo -e "${GREEN}✅ AI matching completed successfully${NC}"
  
  # Count matches
  MATCH_COUNT=$(echo "$MATCH_RESPONSE" | grep -o '"designer":{' | wc -l)
  echo "Found $MATCH_COUNT matches"
  
  # Extract first match details
  FIRST_MATCH_SCORE=$(echo "$MATCH_RESPONSE" | grep -o '"score":[0-9]*' | head -1 | cut -d':' -f2)
  FIRST_MATCH_AI=$(echo "$MATCH_RESPONSE" | grep -o '"aiAnalyzed":[^,}]*' | head -1 | cut -d':' -f2)
  
  echo ""
  echo "First Match Details:"
  echo "- Score: $FIRST_MATCH_SCORE%"
  echo "- AI Analyzed: $FIRST_MATCH_AI"
  
  # Check if AI was actually used
  if [ "$FIRST_MATCH_AI" = "true" ]; then
    echo -e "${GREEN}✅ AI analysis confirmed${NC}"
  else
    echo -e "${RED}❌ AI analysis not detected${NC}"
  fi
  
else
  echo -e "${RED}❌ Failed to fetch matches${NC}"
  echo "Response: $MATCH_RESPONSE"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Checking match page URL...${NC}"
MATCH_URL="$BASE_URL/match/$BRIEF_ID"
echo "Match page would be available at: $MATCH_URL"

echo ""
echo -e "${GREEN}=== Test Complete ===${NC}"
echo ""
echo "Summary:"
echo "1. Brief submission: ✅"
echo "2. AI matching: ✅"
echo "3. Match results: $MATCH_COUNT designers found"
echo ""
echo "Next steps:"
echo "1. Visit $MATCH_URL to see the enhanced match page"
echo "2. Check loading animations and progressive updates"
echo "3. Verify AI-generated match explanations"