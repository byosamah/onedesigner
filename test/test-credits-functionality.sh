#!/bin/bash

echo "🧪 Testing Credits Functionality"
echo "================================"
echo ""

echo "1. Testing client session endpoint..."
curl -X GET http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error

echo ""
echo "2. Testing client matches endpoint..."
curl -X GET http://localhost:3000/api/client/matches \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error

echo ""
echo "Note: This test requires:"
echo "- Local server running with 'npm run dev'"
echo "- Valid client session (login first)"
echo "- Database with client and matches data"

echo ""
echo "To test unlock functionality:"
echo "1. Create a brief and get matches"
echo "2. Use the unlock button in the UI"
echo "3. Verify credits are deducted in the header"