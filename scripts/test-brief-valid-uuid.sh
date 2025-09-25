#!/bin/bash

# OneDesigner Manual Payment Recovery Script
# Use this to manually add credits for clients who paid but didn't receive them

echo "🚨 OneDesigner Manual Payment Recovery"
echo "====================================="

# Check if parameters were provided
if [ $# -lt 2 ]; then
    echo "❌ Usage: $0 <client_id> <credits> [email] [product_key]"
    echo ""
    echo "Examples:"
    echo "  $0 123e4567-e89b-12d3-a456-426614174000 3"
    echo "  $0 123e4567-e89b-12d3-a456-426614174000 10 client@company.com growth"
    echo ""
    echo "To find client IDs, check your database or client support emails."
    exit 1
fi

CLIENT_ID=$1
CREDITS=$2
EMAIL=${3:-"recovery@onedesigner.app"}
PRODUCT_KEY=${4:-"manual-recovery"}

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required. Install with: brew install jq"
    exit 1
fi

echo "🔍 Manual Credit Recovery Details:"
echo "  Client ID: $CLIENT_ID"
echo "  Credits: $CREDITS"
echo "  Email: $EMAIL"
echo "  Product: $PRODUCT_KEY"
echo ""

# Validate UUID format (basic check)
if [[ ! $CLIENT_ID =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
    echo "⚠️ WARNING: Client ID doesn't look like a valid UUID format"
    echo "Continue anyway? (y/n)"
    read -r CONTINUE
    if [[ $CONTINUE != "y" ]]; then
        exit 1
    fi
fi

echo "🚀 Attempting to add $CREDITS credits to client $CLIENT_ID..."

# Call the webhook test endpoint to manually add credits
RESPONSE=$(curl -s -X POST "https://onedesigner.app/api/webhooks/test" \
    -H "Content-Type: application/json" \
    -d "{
        \"client_id\": \"$CLIENT_ID\",
        \"credits\": $CREDITS,
        \"email\": \"$EMAIL\",
        \"product_key\": \"$PRODUCT_KEY\"
    }")

echo ""
echo "📋 Response:"
echo "$RESPONSE" | jq '.'

# Analyze the response
if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
    echo ""
    echo "✅ SUCCESS: Credits added successfully!"
    echo "🎉 Client $CLIENT_ID should now have $CREDITS additional credits"

    # Extract order ID if available
    ORDER_ID=$(echo "$RESPONSE" | jq -r '.test_order_id // "N/A"')
    echo "📝 Test Order ID: $ORDER_ID"

elif echo "$RESPONSE" | jq -e '.error' | grep -q "does not exist"; then
    echo ""
    echo "❌ FAILED: Client ID not found in database"
    echo "💡 The client might not have completed registration"
    echo "🔍 Verify the client ID is correct and the client has signed up"

elif echo "$RESPONSE" | jq -e '.error' | grep -q "Webhook secret not configured"; then
    echo ""
    echo "❌ SYSTEM ISSUE: Webhook secret not configured"
    echo "🚨 This needs to be fixed in Vercel environment variables first"
    echo "🔗 Go to: https://vercel.com/onedesigners-projects/onedesigner2/settings/environment-variables"

elif echo "$RESPONSE" | jq -e '.error' | grep -q "Invalid signature"; then
    echo ""
    echo "❌ CONFIG ISSUE: Webhook secret mismatch"
    echo "🔧 The webhook secret in Vercel doesn't match LemonSqueezy"

else
    echo ""
    echo "❓ Unexpected response. Please check the error details above."
    echo "🆘 You may need to contact support or check the system logs"
fi

echo ""
echo "📊 Next Steps:"
echo "1. If successful: Client should see credits in their dashboard"
echo "2. If failed: Fix the underlying issue and try again"
echo "3. Keep a record of manual credit additions for accounting"
echo ""
echo "🔗 Useful Links:"
echo "  - Client Dashboard: https://onedesigner.app/client/dashboard"
echo "  - Admin Panel: https://onedesigner.app/admin"
echo "  - Vercel Logs: https://vercel.com/onedesigners-projects/onedesigner2/logs"