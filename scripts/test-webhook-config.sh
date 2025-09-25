#!/bin/bash

# OneDesigner Webhook Configuration Test Script
# This script tests if the webhook secret is properly configured and working

echo "🔍 OneDesigner Webhook Configuration Test"
echo "=========================================="

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required for this script. Install with: brew install jq"
    exit 1
fi

# Test the webhook endpoint for configuration
echo "📡 Testing webhook endpoint configuration..."

# First check if the health endpoint works
echo "1️⃣ Testing API health..."
HEALTH_RESPONSE=$(curl -s "https://onedesigner.app/api/health")
if [[ $? -eq 0 ]]; then
    echo "✅ API is responding"
    echo "🔍 Services status:"
    echo "$HEALTH_RESPONSE" | jq '.features'
else
    echo "❌ API health check failed"
    exit 1
fi

echo ""
echo "2️⃣ Testing webhook processing with test client..."

# Test webhook with a dummy client ID to see what error we get
TEST_RESPONSE=$(curl -s -X POST "https://onedesigner.app/api/webhooks/test" \
    -H "Content-Type: application/json" \
    -d '{
        "client_id": "test-client-123",
        "credits": 1,
        "email": "test@webhooktest.com"
    }')

echo "🔍 Test response:"
echo "$TEST_RESPONSE" | jq '.'

if echo "$TEST_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ Webhook processing succeeded (unexpected with dummy client)"
elif echo "$TEST_RESPONSE" | jq -e '.error' | grep -q "Webhook secret not configured"; then
    echo "❌ PROBLEM FOUND: Webhook secret is not configured in Vercel environment"
    echo ""
    echo "🔧 TO FIX THIS:"
    echo "1. Go to Vercel Dashboard: https://vercel.com/onedesigners-projects/onedesigner2/settings/environment-variables"
    echo "2. Add environment variable: LEMONSQUEEZY_WEBHOOK_SECRET"
    echo "3. Value should match the webhook secret from LemonSqueezy dashboard"
    echo "4. Set for Production environment"
    echo "5. Redeploy the application"
elif echo "$TEST_RESPONSE" | jq -e '.error' | grep -q "Invalid signature"; then
    echo "⚠️ Webhook secret is set but doesn't match LemonSqueezy configuration"
    echo ""
    echo "🔧 TO FIX THIS:"
    echo "1. Check the webhook secret in LemonSqueezy dashboard"
    echo "2. Update LEMONSQUEEZY_WEBHOOK_SECRET in Vercel to match exactly"
elif echo "$TEST_RESPONSE" | jq -e '.error' | grep -q "does not exist"; then
    echo "✅ Webhook secret is working! Error is just that test client doesn't exist (expected)"
    echo "🎉 The webhook system is properly configured"
else
    echo "❓ Unexpected response. Full output above."
fi

echo ""
echo "3️⃣ Testing with webhook configuration instructions..."
curl -s "https://onedesigner.app/api/webhooks/test" | jq '.'

echo ""
echo "📋 SUMMARY:"
echo "- If you see 'Webhook secret not configured': Set LEMONSQUEEZY_WEBHOOK_SECRET in Vercel"
echo "- If you see 'Invalid signature': Check that Vercel secret matches LemonSqueezy"
echo "- If you see 'Client does not exist': Webhook system is working correctly!"
echo ""
echo "🔗 Vercel Environment Variables: https://vercel.com/onedesigners-projects/onedesigner2/settings/environment-variables"
echo "🔗 LemonSqueezy Webhooks: https://app.lemonsqueezy.com/webhooks"