#!/usr/bin/env node

/**
 * Test email delivery to find out which addresses work
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8';

async function testEmailDelivery(email, fromAddress) {
  console.log(`\nTesting ${email} with from: ${fromAddress}`);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: email,
      subject: `OneDesigner OTP Test - ${new Date().toLocaleTimeString()}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 20px;">
          <h2>Your verification code</h2>
          <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; margin: 20px 0;">
            123456
          </div>
          <p>This code expires in 10 minutes.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Sent from: ${fromAddress}<br>
            Time: ${new Date().toISOString()}
          </p>
        </div>
      `,
      text: 'Your OTP code is: 123456'
    }),
  });
  
  const result = await response.text();
  
  if (response.ok) {
    const data = JSON.parse(result);
    console.log(`  ✅ SENT! ID: ${data.id}`);
    console.log(`  Check inbox AND spam folder`);
    return true;
  } else {
    console.log(`  ❌ FAILED: ${response.status}`);
    try {
      const error = JSON.parse(result);
      console.log(`  ${error.message || error.error}`);
    } catch (e) {
      console.log(`  ${result}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('🧪 Email Delivery Test');
  console.log('======================');
  
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.log('Usage: node test-email-delivery.js your-email@example.com');
    process.exit(1);
  }
  
  console.log(`\nTesting delivery to: ${testEmail}`);
  console.log('Will try different from addresses...\n');
  
  // Test configurations
  const configs = [
    {
      name: 'OneDesigner Domain',
      from: 'OneDesigner <hello@onedesigner.app>',
      note: 'Your configured domain'
    },
    {
      name: 'Resend Shared Domain',
      from: 'OneDesigner <onboarding@resend.dev>',
      note: 'Works immediately, shows "via resend.dev"'
    }
  ];
  
  const results = [];
  
  for (const config of configs) {
    console.log(`\n📧 ${config.name}`);
    console.log(`   ${config.note}`);
    
    const success = await testEmailDelivery(testEmail, config.from);
    results.push({ ...config, success });
    
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n\n📊 RESULTS SUMMARY');
  console.log('==================');
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (working.length > 0) {
    console.log('\n✅ WORKING configurations:');
    working.forEach(w => {
      console.log(`  - ${w.from}`);
    });
    console.log('\n👉 Check both INBOX and SPAM folders!');
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED configurations:');
    failed.forEach(f => {
      console.log(`  - ${f.from}`);
    });
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (working.some(w => w.from.includes('resend.dev'))) {
    console.log('1. For immediate fix: Use onboarding@resend.dev');
    console.log('   Add to .env: USE_RESEND_FALLBACK=true');
  }
  
  if (failed.some(f => f.from.includes('onedesigner.app'))) {
    console.log('2. For proper setup: Configure DNS records');
    console.log('   - Add SPF, DKIM, DMARC records');
    console.log('   - Wait 24-48 hours for propagation');
    console.log('   - Test with mail-tester.com');
  }
  
  console.log('\n3. Check Resend Dashboard:');
  console.log('   https://resend.com/emails');
  console.log('   Look for delivery status of sent emails');
}

// Run tests
runTests().catch(console.error);