#!/bin/bash

# Test Login Security - Verify that non-registered users cannot login

echo "🔒 Testing Login Security Fix..."
echo "====================================="

# Test with unregistered emails
UNREGISTERED_CLIENT="test_unregistered_client_$(date +%s)@example.com"
UNREGISTERED_DESIGNER="test_unregistered_designer_$(date +%s)@example.com"

echo -e "\n1️⃣ Testing Client Login with unregistered email"
echo "-------------------------------------------"
echo "Email: $UNREGISTERED_CLIENT"

# Try to send OTP for client login (should fail)
CLIENT_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$UNREGISTERED_CLIENT\", \"isLogin\": true}")

echo "Response: $CLIENT_LOGIN_RESPONSE"

# Check if login was rejected
if echo "$CLIENT_LOGIN_RESPONSE" | grep -q "No account found"; then
  echo "✅ Client login correctly rejected for unregistered email"
else
  echo "❌ SECURITY ISSUE: Client login didn't reject unregistered email!"
  echo "Full response: $CLIENT_LOGIN_RESPONSE"
  exit 1
fi

echo -e "\n2️⃣ Testing Designer Login with unregistered email"
echo "-------------------------------------------"
echo "Email: $UNREGISTERED_DESIGNER"

# Try to send OTP for designer login (should fail)
DESIGNER_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/designer/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$UNREGISTERED_DESIGNER\", \"isLogin\": true}")

echo "Response: $DESIGNER_LOGIN_RESPONSE"

# Check if designer login was rejected
if echo "$DESIGNER_LOGIN_RESPONSE" | grep -q "No designer account found"; then
  echo "✅ Designer login correctly rejected for unregistered email"
else
  echo "❌ SECURITY ISSUE: Designer login didn't reject unregistered email!"
  echo "Full response: $DESIGNER_LOGIN_RESPONSE"
  exit 1
fi

echo -e "\n3️⃣ Testing Client Signup (should still work)"
echo "-------------------------------------------"

SIGNUP_EMAIL="test_signup_$(date +%s)@example.com"
echo "Email: $SIGNUP_EMAIL"

# Try to send OTP for signup (should succeed since isLogin is not set)
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$SIGNUP_EMAIL\"}")

echo "Response: $SIGNUP_RESPONSE"

# Check if signup OTP was sent
if echo "$SIGNUP_RESPONSE" | grep -q "success.*true"; then
  echo "✅ Client signup OTP sent successfully (as expected)"
else
  echo "❌ Client signup failed unexpectedly"
  echo "Full response: $SIGNUP_RESPONSE"
  exit 1
fi

echo -e "\n4️⃣ Testing Designer Signup (should still work)"
echo "-------------------------------------------"

DESIGNER_SIGNUP_EMAIL="designer_signup_$(date +%s)@example.com"
echo "Email: $DESIGNER_SIGNUP_EMAIL"

# Try to send OTP for designer signup (should succeed since isLogin is not set)
DESIGNER_SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/designer/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$DESIGNER_SIGNUP_EMAIL\"}")

echo "Response: $DESIGNER_SIGNUP_RESPONSE"

# Check if designer signup OTP was sent
if echo "$DESIGNER_SIGNUP_RESPONSE" | grep -q "success.*true"; then
  echo "✅ Designer signup OTP sent successfully (as expected)"
else
  echo "❌ Designer signup failed unexpectedly"
  echo "Full response: $DESIGNER_SIGNUP_RESPONSE"
  exit 1
fi

echo -e "\n====================================="
echo "🎉 All Security Tests Passed!"
echo "====================================="
echo ""
echo "Summary:"
echo "✅ Client login rejects unregistered emails"
echo "✅ Designer login rejects unregistered emails"
echo "✅ Client signup still works correctly"
echo "✅ Designer signup still works correctly"
echo ""
echo "The login system is now properly secured!"
echo "Only registered users can login."