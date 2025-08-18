#!/usr/bin/env node

/**
 * Diagnostic script to identify why emails only go to specific addresses
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8';

async function testResendDirectly(toEmail) {
  console.log(`\n📧 Testing direct Resend API to: ${toEmail}`);
  
  try {
    // Test with different from addresses
    const testConfigs = [
      { from: 'hello@onedesigner.app', name: 'hello@onedesigner.app' },
      { from: 'onboarding@resend.dev', name: 'onboarding@resend.dev (Resend test domain)' },
      { from: 'OneDesigner <hello@onedesigner.app>', name: 'Full format with name' }
    ];
    
    for (const config of testConfigs) {
      console.log(`\n  Testing from: ${config.name}`);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.from,
          to: toEmail,
          subject: `Test from ${config.name} - ${new Date().toLocaleTimeString()}`,
          html: `<p>This is a test email to diagnose delivery issues.</p>
                 <p>Sent from: ${config.from}</p>
                 <p>Time: ${new Date().toISOString()}</p>`,
          text: `Test email from ${config.from}`
        }),
      });
      
      const result = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(result);
        console.log(`    ✅ Success! Message ID: ${data.id}`);
      } else {
        console.log(`    ❌ Failed with status ${response.status}`);
        console.log(`    Error: ${result}`);
        
        // Parse error if it's JSON
        try {
          const errorData = JSON.parse(result);
          if (errorData.message) {
            console.log(`    Message: ${errorData.message}`);
          }
          if (errorData.name === 'validation_error') {
            console.log(`    🔍 VALIDATION ERROR - This usually means:`);
            console.log(`       - Domain not verified in Resend`);
            console.log(`       - You're in development mode with restricted sending`);
            console.log(`       - The 'from' address domain needs to be added to Resend`);
          }
        } catch (e) {
          // Not JSON error
        }
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

async function checkResendDomains() {
  console.log('\n🔍 Checking Resend account status...');
  
  try {
    // Check domains endpoint
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n📋 Verified Domains in your Resend account:');
      
      if (result.data && result.data.length > 0) {
        result.data.forEach(domain => {
          console.log(`  - ${domain.name} (${domain.status})`);
          if (domain.name === 'onedesigner.app') {
            console.log(`    ✅ onedesigner.app is configured!`);
          }
        });
      } else {
        console.log('  ❌ No domains configured');
        console.log('  ⚠️  You need to add and verify onedesigner.app in Resend');
      }
    } else {
      console.log('Could not fetch domains:', await response.text());
    }
    
    // Check API key permissions
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'test@resend.dev',
        subject: 'Permission check',
        html: '<p>Test</p>'
      }),
    });
    
    const emailResult = await emailResponse.text();
    
    if (emailResponse.status === 401) {
      console.log('\n❌ API Key Issue: Invalid or expired API key');
    } else if (emailResponse.status === 403) {
      console.log('\n⚠️  API Key has limited permissions');
    } else if (emailResponse.ok) {
      console.log('\n✅ API Key is valid and has sending permissions');
    }
    
    // Parse response for more info
    try {
      const data = JSON.parse(emailResult);
      if (data.message && data.message.includes('domain')) {
        console.log('\n🔴 DOMAIN ISSUE DETECTED:');
        console.log('  The domain onedesigner.app needs to be:');
        console.log('  1. Added to your Resend account');
        console.log('  2. DNS records configured (SPF, DKIM)');
        console.log('  3. Verified in Resend dashboard');
        console.log('\n  Until then, you can only send to:');
        console.log('  - Your Resend account email');
        console.log('  - Emails you\'ve added as "Team" in Resend');
      }
    } catch (e) {
      // Not JSON
    }
    
  } catch (error) {
    console.error('Check error:', error.message);
  }
}

async function runDiagnostics() {
  console.log('🔬 Email Delivery Diagnostic Tool');
  console.log('==================================\n');
  
  // Check Resend configuration first
  await checkResendDomains();
  
  // Test sending to different emails
  const testEmails = [
    'osamah96@gmail.com',
    'test@example.com',
    process.argv[2] // User provided email
  ].filter(Boolean);
  
  console.log('\n📮 Testing email delivery to different addresses...');
  
  for (const email of testEmails) {
    await testResendDirectly(email);
  }
  
  console.log('\n\n📊 DIAGNOSIS SUMMARY:');
  console.log('======================');
  console.log('If emails only work to osamah96@gmail.com, it means:');
  console.log('');
  console.log('1. 🔴 MOST LIKELY: Domain not verified in Resend');
  console.log('   - Go to: https://resend.com/domains');
  console.log('   - Add domain: onedesigner.app');
  console.log('   - Add DNS records to your domain provider');
  console.log('   - Wait for verification (can take a few minutes)');
  console.log('');
  console.log('2. 🟡 Or: Development mode restrictions');
  console.log('   - Free Resend accounts can only send to verified emails');
  console.log('   - Add team members in Resend dashboard to test with their emails');
  console.log('');
  console.log('3. 🟢 Quick Fix: Use Resend\'s test domain');
  console.log('   - Change from address to: onboarding@resend.dev');
  console.log('   - This works immediately but shows "resend.dev" to users');
}

// Run diagnostics
runDiagnostics().catch(console.error);