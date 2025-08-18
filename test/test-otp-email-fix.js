#!/usr/bin/env node

/**
 * Test script to verify OTP email sending after fixes
 */

const testEmail = process.argv[2] || 'test@example.com';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('🧪 Testing OTP Email Fix');
console.log('========================');
console.log(`Target email: ${testEmail}`);
console.log(`API URL: ${baseUrl}/api/auth/send-otp`);
console.log('');

async function testOTPEmail() {
  try {
    // Test sending OTP
    console.log('📧 Sending OTP email...');
    
    const response = await fetch(`${baseUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        isLogin: false
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Failed to send OTP:', data);
      return false;
    }
    
    console.log('✅ OTP sent successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    // Test with direct email service endpoint
    console.log('\n📧 Testing EmailService directly...');
    
    const testResponse = await fetch(`${baseUrl}/api/test-email-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send-otp',
        to: testEmail
      })
    });
    
    const testData = await testResponse.json();
    
    if (!testResponse.ok) {
      console.error('❌ EmailService test failed:', testData);
      return false;
    }
    
    console.log('✅ EmailService test successful!');
    console.log('Test OTP code:', testData.code);
    console.log('Result:', testData.result);
    
    // Get email service status
    console.log('\n📊 Getting EmailService status...');
    
    const statusResponse = await fetch(`${baseUrl}/api/test-email-service`);
    const statusData = await statusResponse.json();
    
    if (statusResponse.ok) {
      console.log('✅ EmailService Configuration:');
      console.log('  - From:', statusData.config?.from);
      console.log('  - Rate Limit:', statusData.config?.rateLimit, 'per minute');
      console.log('  - Queue Enabled:', statusData.config?.queueEnabled);
      console.log('  - Queue Status:', JSON.stringify(statusData.queueStatus));
    }
    
    console.log('\n🎉 OTP Email Test Complete!');
    console.log('Check your email inbox for:');
    console.log('  - Sender: "OneDesigner" (for OTP)');
    console.log('  - From: hello@onedesigner.app');
    console.log('  - Subject: "[6-digit code] is your OneDesigner code"');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    return false;
  }
}

// Run the test
testOTPEmail().then(success => {
  process.exit(success ? 0 : 1);
});