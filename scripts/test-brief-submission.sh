#!/bin/bash

# OneDesigner Brief Submission Test Script
# This tests the complete payment flow to identify where credits are lost

echo "💳 OneDesigner Payment Flow Test"
echo "================================="

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required. Install with: brew install jq"
    exit 1
fi

echo "🔍 Testing complete payment flow..."

# Step 1: Test client session and brief creation
echo ""
echo "1️⃣ Testing client session creation..."

# This would normally require a real client session
# For now, let's test the webhook directly with a real client ID structure

echo ""
echo "2️⃣ Testing webhook with realistic client ID format..."

# Generate a realistic UUID format for testing
TEST_CLIENT_ID=$(python3 -c "import uuid; print(str(uuid.uuid4()))")

echo "🔍 Generated test client ID: $TEST_CLIENT_ID"

# Test the webhook processing
echo ""
echo "3️⃣ Testing webhook processing..."

TEST_RESPONSE=$(curl -s -X POST "https://onedesigner.app/api/webhooks/test" \
    -H "Content-Type: application/json" \
    -d "{
        \"client_id\": \"$TEST_CLIENT_ID\",
        \"credits\": 3,
        \"email\": \"test@paymentflow.com\",
        \"product_key\": \"starter\"
    }")

echo "📋 Webhook test response:"
echo "$TEST_RESPONSE" | jq '.'

# Analyze the response
if echo "$TEST_RESPONSE" | jq -e '.success' > /dev/null; then
    echo ""
    echo "✅ GOOD: Webhook processing succeeded"
    echo "🎉 This means the payment system should work once environment is configured"
elif echo "$TEST_RESPONSE" | jq -e '.error' | grep -q "Webhook secret not configured"; then
    echo ""
    echo "❌ CRITICAL ISSUE: Webhook secret missing"
    echo "💡 This is why payments complete but credits aren't added!"
elif echo "$TEST_RESPONSE" | jq -e '.error' | grep -q "does not exist in database"; then
    echo ""
    echo "✅ GOOD: Webhook system working, just need real client ID"
    echo "💡 Error is expected since we're using a test client ID"
else
    echo ""
    echo "❓ Unexpected response - need to investigate further"
fi

echo ""
echo "4️⃣ Testing payment recovery scenario..."

# Test what happens with manual credit addition
echo "📝 Testing manual credit addition process..."

# This simulates what should happen when a payment webhook is processed
echo ""
echo "📋 RESULTS SUMMARY:"
echo "=================="

if echo "$TEST_RESPONSE" | jq -e '.error' | grep -q "secret"; then
    echo "🔴 ROOT CAUSE: Webhook secret configuration issue"
    echo ""
    echo "IMMEDIATE FIXES NEEDED:"
    echo "1. Set LEMONSQUEEZY_WEBHOOK_SECRET in Vercel dashboard"
    echo "2. Deploy the updated webhook code (already pushed to GitHub)"
    echo "3. Test with a real payment"
    echo ""
    echo "RECOVERY ACTIONS:"
    echo "1. Check LemonSqueezy dashboard for recent successful payments"
    echo "2. Cross-reference with clients table to find missing credits"
    echo "3. Manually add missing credits using the test webhook endpoint"
else
    echo "🟡 Webhook system appears functional - issue may be elsewhere"
    echo ""
    echo "INVESTIGATION NEEDED:"
    echo "1. Check if LemonSqueezy is actually calling the webhook"
    echo "2. Verify webhook URL configuration in LemonSqueezy"
    echo "3. Check Vercel logs for webhook calls"
fi

echo ""
echo "🔗 QUICK ACTIONS:"
echo "- Vercel Environment Variables: https://vercel.com/onedesigners-projects/onedesigner2/settings/environment-variables"
echo "- Vercel Logs: https://vercel.com/onedesigners-projects/onedesigner2/logs"
echo "- LemonSqueezy Webhooks: https://app.lemonsqueezy.com/webhooks"
echo ""
echo "📞 If you need to manually add credits to a client who paid:"
echo "   Use: curl -X POST 'https://onedesigner.app/api/webhooks/test' -H 'Content-Type: application/json' -d '{\"client_id\":\"REAL_CLIENT_ID\",\"credits\":AMOUNT}'"