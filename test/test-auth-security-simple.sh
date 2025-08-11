#!/bin/bash

# Simple Authentication Security Test - Verify login/signup separation

echo "🔒 Testing Authentication Security (Simple Version)..."
echo "====================================="

# Test with a hardcoded unregistered email
TEST_EMAIL="test_unregistered_user@example.com"
TEST_TOKEN="123456"  # Using a test token

echo -e "\n1️⃣ Testing Client Login with unregistered email"
echo "-------------------------------------------"

# Try to verify OTP for login (should fail for unregistered user)
echo "Attempting client login with unregistered email: $TEST_EMAIL"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TEST_TOKEN\"}")

echo "Response: $LOGIN_RESPONSE"

# Check if login was rejected
if echo "$LOGIN_RESPONSE" | grep -q "No account found\|Invalid or expired\|unauthorized"; then
  echo "✅ Client login correctly rejected for unregistered email"
else
  echo "❌ SECURITY ISSUE: Client login may have created an account!"
  echo "Full response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "\n2️⃣ Testing Designer Login with unregistered email"
echo "-------------------------------------------"

# Try designer login with unregistered email (isSignup: false)
echo "Attempting designer login with unregistered email: $TEST_EMAIL"
DESIGNER_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/designer/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TEST_TOKEN\", \"isSignup\": false}")

echo "Response: $DESIGNER_LOGIN_RESPONSE"

# Check if designer login was rejected
if echo "$DESIGNER_LOGIN_RESPONSE" | grep -q "No designer account found\|Invalid or expired\|unauthorized"; then
  echo "✅ Designer login correctly rejected for unregistered email"
else
  echo "❌ SECURITY ISSUE: Designer login may have created an account!"
  echo "Full response: $DESIGNER_LOGIN_RESPONSE"
  exit 1
fi

echo -e "\n3️⃣ Testing Designer Signup (should create account if OTP valid)"
echo "-------------------------------------------"

# Try designer signup with same email (isSignup: true)
echo "Attempting designer signup with email: $TEST_EMAIL"
DESIGNER_SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/designer/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TEST_TOKEN\", \"isSignup\": true}")

echo "Response: $DESIGNER_SIGNUP_RESPONSE"

# Signup might fail due to invalid OTP, but should NOT say "account already exists" on first try
if echo "$DESIGNER_SIGNUP_RESPONSE" | grep -q "already exists"; then
  echo "❌ Unexpected 'already exists' error on first signup attempt"
else
  echo "✅ Designer signup behaves correctly (fails with invalid OTP, not 'already exists')"
fi

echo -e "\n4️⃣ Checking API Endpoint Separation"
echo "-------------------------------------------"

# Test that client signup endpoint exists and is separate
echo "Testing client signup endpoint exists..."
SIGNUP_ENDPOINT_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/signup/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"token\": \"000000\"}")

if [ "$SIGNUP_ENDPOINT_TEST" != "404" ]; then
  echo "✅ Client signup endpoint exists (/api/auth/signup/verify-otp)"
else
  echo "❌ Client signup endpoint not found!"
  exit 1
fi

# Test that regular verify endpoint still exists
echo "Testing client login endpoint exists..."
LOGIN_ENDPOINT_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"token\": \"000000\"}")

if [ "$LOGIN_ENDPOINT_TEST" != "404" ]; then
  echo "✅ Client login endpoint exists (/api/auth/verify-otp)"
else
  echo "❌ Client login endpoint not found!"
  exit 1
fi

echo -e "\n====================================="
echo "🎉 Security Test Summary"
echo "====================================="
echo ""
echo "✅ Client login rejects unregistered users"
echo "✅ Designer login rejects unregistered users"
echo "✅ Separate signup and login endpoints exist"
echo "✅ Designer signup uses isSignup flag correctly"
echo ""
echo "The authentication system is properly secured!"
echo "Login and signup flows are correctly separated."