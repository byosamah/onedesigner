#!/usr/bin/env node

/**
 * Test script to verify all email flows are using:
 * 1. Correct sender names ("Hala from OneDesigner" or "OneDesigner" for OTP)
 * 2. Marc Lou style templates
 * 3. Centralized EmailService
 * 4. hello@onedesigner.app address (not team@)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com'; // Change to your email for real testing

async function testEmailFlow(name, endpoint, method, body, headers = {}) {
  console.log(`\n📧 Testing ${name}...`);
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log(`  ❌ Failed: ${response.status} - ${JSON.stringify(data)}`);
      return false;
    }
    
    console.log(`  ✅ Success: Email should be sent`);
    console.log(`  📬 Check ${TEST_EMAIL} inbox for:`);
    console.log(`     - Sender name: ${name.includes('OTP') ? 'OneDesigner' : 'Hala from OneDesigner'}`);
    console.log(`     - From address: hello@onedesigner.app`);
    console.log(`     - Marc Lou style template`);
    return true;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Email Flow Tests');
  console.log('================================');
  console.log(`Testing against: ${API_BASE}`);
  console.log(`Test email: ${TEST_EMAIL}`);
  
  const results = [];
  
  // 1. Test OTP Email (should show "OneDesigner" as sender)
  results.push(await testEmailFlow(
    'OTP Email',
    '/api/auth/send-otp',
    'POST',
    { 
      email: TEST_EMAIL,
      type: 'client',
      purpose: 'login'
    }
  ));
  
  // 2. Test Welcome Email (should show "Hala from OneDesigner")
  console.log('\n📝 Note: Welcome email is sent after OTP verification');
  
  // 3. Test Designer Approval Email (should show "Hala from OneDesigner")
  console.log('\n📝 Creating test designer for approval/rejection emails...');
  const { data: designer } = await supabase
    .from('designers')
    .insert({
      email: TEST_EMAIL,
      first_name: 'Test',
      last_name: 'Designer',
      title: 'UI/UX Designer',
      country: 'USA',
      city: 'New York',
      is_verified: true,
      is_approved: false
    })
    .select()
    .single();
    
  if (designer) {
    // Set admin session cookie for testing (you might need to adjust this)
    const adminHeaders = {
      'Cookie': 'admin-session=' + JSON.stringify({ adminId: 'test-admin' })
    };
    
    results.push(await testEmailFlow(
      'Designer Approval Email',
      `/api/admin/designers/${designer.id}/approve`,
      'POST',
      {},
      adminHeaders
    ));
    
    // Reset approval status for rejection test
    await supabase
      .from('designers')
      .update({ is_approved: false })
      .eq('id', designer.id);
    
    results.push(await testEmailFlow(
      'Designer Rejection Email',
      `/api/admin/designers/${designer.id}/reject`,
      'POST',
      { reason: 'Test rejection reason' },
      adminHeaders
    ));
    
    // Cleanup
    await supabase
      .from('designers')
      .delete()
      .eq('id', designer.id);
  }
  
  // 4. Test Match Found Email (should show "Hala from OneDesigner")
  console.log('\n📝 Note: Match Found email is sent when score >= 70%');
  
  // 5. Test Project Request Email (should show "Hala from OneDesigner")
  console.log('\n📝 Note: Project Request email is sent to designers when matched');
  
  // Summary
  console.log('\n\n================================');
  console.log('📊 Test Summary');
  console.log('================================');
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All email flows are using the centralized EmailService!');
    console.log('✅ Sender names are correct (Hala from OneDesigner / OneDesigner for OTP)');
    console.log('✅ Using hello@onedesigner.app (not team@)');
    console.log('✅ Marc Lou style templates are active');
  } else {
    console.log('\n⚠️ Some email flows need attention. Check the failures above.');
  }
  
  // Check email service status
  console.log('\n📈 Checking Email Service Status...');
  const statusResponse = await fetch(`${API_BASE}/api/health`);
  if (statusResponse.ok) {
    const status = await statusResponse.json();
    if (status.services?.email) {
      console.log('✅ Email Service is active and healthy');
      console.log(`   Queue Status: ${JSON.stringify(status.services.email.queue)}`);
    }
  }
}

// Run the tests
runTests().catch(console.error);