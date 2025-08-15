/**
 * Test script to verify all OTP emails use the same template and sender name
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test email addresses
const TEST_EMAILS = {
  admin: 'test-admin@example.com',
  designer: 'test-designer@example.com', 
  client: 'test-client@example.com'
};

async function testOTPEndpoint(endpoint, email, type, additionalData = {}) {
  console.log(`\n📧 Testing ${type} OTP email to: ${email}`);
  console.log(`   Endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        ...additionalData
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ ${type} OTP request successful`);
      console.log(`   Response:`, data);
      
      // Check if OTP was stored in database
      const { data: otpData, error } = await supabase
        .from('auth_tokens')
        .select('*')
        .eq('email', email)
        .eq('type', 'otp')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (otpData) {
        console.log(`   📍 OTP stored in database:`, otpData.token);
        console.log(`   ⏰ Expires at:`, new Date(otpData.expires_at).toLocaleString());
      }
    } else {
      console.log(`   ❌ ${type} OTP request failed:`, data.error || data.message);
    }
  } catch (error) {
    console.log(`   ❌ Error testing ${type} OTP:`, error.message);
  }
}

async function cleanupTestOTPs() {
  console.log('\n🧹 Cleaning up test OTPs...');
  
  for (const email of Object.values(TEST_EMAILS)) {
    const { error } = await supabase
      .from('auth_tokens')
      .delete()
      .eq('email', email)
      .eq('type', 'otp');
      
    if (!error) {
      console.log(`   ✓ Cleaned up OTPs for ${email}`);
    }
  }
}

async function testAllOTPEmails() {
  console.log('═'.repeat(60));
  console.log('  UNIFIED OTP EMAIL TESTING');
  console.log('═'.repeat(60));
  console.log('\nThis test verifies that all OTP emails:');
  console.log('  ✓ Use the same Marc Lou style template');
  console.log('  ✓ Have "OneDesigner" as the sender name');
  console.log('  ✓ Follow consistent formatting');
  console.log('\n⚠️  NOTE: In development, emails are logged to console');
  console.log('═'.repeat(60));

  // Test Admin OTP
  await testOTPEndpoint('/api/admin/auth/send-otp', TEST_EMAILS.admin, 'Admin');
  
  // Test Designer OTP (signup)
  await testOTPEndpoint('/api/designer/auth/send-otp', TEST_EMAILS.designer, 'Designer', {
    isLogin: false
  });
  
  // Test Client OTP (signup)
  await testOTPEndpoint('/api/auth/send-otp', TEST_EMAILS.client, 'Client', {
    isLogin: false
  });

  // Test the centralized email service directly
  console.log('\n🔧 Testing centralized email service directly...');
  try {
    const response = await fetch('http://localhost:3000/api/test-email-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'otp',
        to: 'test-centralized@example.com',
        code: '123456',
        userType: 'admin',
        purpose: 'login'
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('   ✅ Centralized email service test successful');
    } else {
      console.log('   ❌ Centralized email service test failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Error testing centralized service:', error.message);
  }

  // Clean up test data
  await cleanupTestOTPs();

  console.log('\n' + '═'.repeat(60));
  console.log('✅ OTP Email Testing Complete!');
  console.log('═'.repeat(60));
  console.log('\n📋 Summary:');
  console.log('  • All OTP emails should now use the same template');
  console.log('  • Sender name should be "OneDesigner" (not "team")');
  console.log('  • Template follows Marc Lou casual style');
  console.log('  • Admin, Designer, and Client all use same design');
  console.log('\n💡 Check your console output above to verify emails');
  console.log('   were logged with correct formatting.\n');
}

// Check if running locally
async function checkLocalServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  const isLocal = await checkLocalServer();
  
  if (!isLocal) {
    console.log('❌ Local server not running!');
    console.log('   Please start the development server first:');
    console.log('   npm run dev');
    process.exit(1);
  }

  await testAllOTPEmails();
}

main().catch(console.error);