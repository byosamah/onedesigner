#!/bin/bash

# Test Authentication Security - Verify that non-registered users cannot login

echo "🔒 Testing Authentication Security..."
echo "====================================="

# Test unregistered email
TEST_EMAIL="unregistered_$(date +%s)@test.com"

echo -e "\n1️⃣ Testing Client Login with unregistered email: $TEST_EMAIL"
echo "-------------------------------------------"

# Try to send OTP to unregistered email (should succeed)
echo "Sending OTP to unregistered email..."
OTP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "OTP Response: $OTP_RESPONSE"

# Extract token from response (using sed for macOS compatibility)
TOKEN=$(echo $OTP_RESPONSE | sed -n 's/.*"token":"\([^"]*\).*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get OTP token"
  exit 1
fi

echo "✅ OTP sent successfully with token: $TOKEN"

# Try to verify OTP for login (should fail)
echo -e "\nAttempting to login with OTP..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TOKEN\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Check if login was rejected
if echo "$LOGIN_RESPONSE" | grep -q "No account found"; then
  echo "✅ Client login correctly rejected for unregistered email"
else
  echo "❌ SECURITY ISSUE: Client login allowed for unregistered email!"
  exit 1
fi

echo -e "\n2️⃣ Testing Designer Login with unregistered email"
echo "-------------------------------------------"

# Try designer login with unregistered email
echo "Attempting designer login with OTP..."
DESIGNER_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/designer/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TOKEN\", \"isSignup\": false}")

echo "Designer Login Response: $DESIGNER_LOGIN_RESPONSE"

# Check if designer login was rejected
if echo "$DESIGNER_LOGIN_RESPONSE" | grep -q "No designer account found"; then
  echo "✅ Designer login correctly rejected for unregistered email"
else
  echo "❌ SECURITY ISSUE: Designer login allowed for unregistered email!"
  exit 1
fi

echo -e "\n3️⃣ Testing Client Signup (should succeed)"
echo "-------------------------------------------"

# Try signup with the same email (should succeed)
echo "Attempting client signup with OTP..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TOKEN\"}")

echo "Signup Response: $SIGNUP_RESPONSE"

# Check if signup succeeded
if echo "$SIGNUP_RESPONSE" | grep -q "success.*true"; then
  echo "✅ Client signup succeeded as expected"
else
  echo "❌ Client signup failed unexpectedly"
  exit 1
fi

echo -e "\n4️⃣ Testing duplicate signup (should fail)"
echo "-------------------------------------------"

# Get new OTP for same email
echo "Getting new OTP for duplicate signup test..."
OTP_RESPONSE2=$(curl -s -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

TOKEN2=$(echo $OTP_RESPONSE2 | sed -n 's/.*"token":"\([^"]*\).*/\1/p')

# Try to signup again with same email (should fail)
echo "Attempting duplicate signup..."
DUPLICATE_SIGNUP=$(curl -s -X POST http://localhost:3000/api/auth/signup/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TOKEN2\"}")

echo "Duplicate Signup Response: $DUPLICATE_SIGNUP"

# Check if duplicate signup was rejected
if echo "$DUPLICATE_SIGNUP" | grep -q "already exists"; then
  echo "✅ Duplicate signup correctly rejected"
else
  echo "❌ SECURITY ISSUE: Duplicate signup allowed!"
  exit 1
fi

echo -e "\n5️⃣ Testing login after signup (should succeed)"
echo "-------------------------------------------"

# Now test login with registered email (should succeed)
echo "Attempting login with registered email..."
LOGIN_AFTER_SIGNUP=$(curl -s -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"token\": \"$TOKEN2\"}")

echo "Login After Signup Response: $LOGIN_AFTER_SIGNUP"

# Check if login succeeded
if echo "$LOGIN_AFTER_SIGNUP" | grep -q "success.*true"; then
  echo "✅ Client login succeeded for registered email"
else
  echo "❌ Client login failed for registered email"
  exit 1
fi

echo -e "\n====================================="
echo "🎉 All security tests passed!"
echo "====================================="
echo ""
echo "Summary:"
echo "✅ Unregistered users cannot login as clients"
echo "✅ Unregistered users cannot login as designers"
echo "✅ Users can signup successfully"
echo "✅ Duplicate signups are prevented"
echo "✅ Registered users can login successfully"
echo ""
echo "The authentication system is now secure!"