#!/bin/bash

echo "🎯 Testing Elite Single-Match AI System"
echo ""
echo "This test will verify that the AI matching system:"
echo "1. Uses the new elite matchmaker prompts"
echo "2. Returns a single perfect match"
echo "3. Provides detailed scoring breakdown"
echo "4. Includes compelling match narrative"
echo ""

# Test the matching endpoint
curl -X POST http://localhost:3000/api/match/find \
  -H "Content-Type: application/json" \
  -d '{
    "briefId": "test-brief-id"
  }' | jq '.'

echo ""
echo "Note: This requires a local server running with 'npm run dev'"
echo "The test brief should be created in the database first"