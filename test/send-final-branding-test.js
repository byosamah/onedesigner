/**
 * Final test of all OneDesigner email types with new golden branding standard
 */

async function sendFinalBrandingTest() {
  console.log('🎨 Final OneDesigner Email Branding Test')
  console.log('=' .repeat(60))
  console.log('Testing all email types with:')
  console.log('✅ Golden OneDesigner text (#f0ad4e)')
  console.log('✅ team@onedesigner.app sender')
  console.log('✅ Appropriate sender names')
  console.log('✅ No logos (email client compatible)')
  console.log('=' .repeat(60))
  
  const RESEND_API_KEY = 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8'
  const testEmail = 'osamah96@gmail.com'
  
  const goldenHeader = `
    <div style="text-align: center; padding: 32px; border-bottom: 1px solid #F3F4F6;">
      <span style="font-size: 24px; font-weight: 700; color: #f0ad4e; letter-spacing: -0.02em;">OneDesigner</span>
    </div>
  `
  
  const emailWrapper = (content, footerText = "— Zain from OneDesigner") => `
    <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      ${goldenHeader}
      <div style="padding: 32px;">
        ${content}
      </div>
      <div style="padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #F3F4F6;">
        <p style="margin: 0; font-weight: 600; color: #111827;">${footerText}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #6B7280;">Connecting great clients with amazing designers</p>
      </div>
    </div>
  `
  
  const emails = [
    // 1. Welcome Email (Marc Lou Style)
    {
      from: 'Zain from OneDesigner <team@onedesigner.app>',
      subject: '🎉 FINAL TEST: Welcome to OneDesigner!',
      html: emailWrapper(`
        <h2 style="color: #111827; margin: 0 0 16px 0;">Hey Osama 👋</h2>
        <p style="color: #4B5563; line-height: 1.7; margin: 0 0 24px 0;">
          <strong style="color: #111827;">Congrats!</strong> You just saved yourself weeks of portfolio browsing.
          <br><br>
          This is the <strong>final test</strong> with our new golden branding standard.
        </p>
        <div style="margin: 24px 0;">
          <a href="https://onedesigner.app" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Start Your Brief →
          </a>
        </div>
      `)
    },
    
    // 2. OTP Email
    {
      from: 'OneDesigner <team@onedesigner.app>',
      subject: '🔐 FINAL TEST: Your verification code',
      html: emailWrapper(`
        <h2 style="color: #111827; margin: 0 0 16px 0;">Quick verification 👇</h2>
        <div style="background: #F9FAFB; border: 2px dashed #E5E7EB; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: monospace;">123456</div>
          <div style="font-size: 14px; color: #6B7280; margin-top: 12px;">Expires in 10 minutes</div>
        </div>
        <p style="color: #4B5563;">Just copy and paste this code to continue.</p>
      `, "— OneDesigner Security")
    },
    
    // 3. Designer Approval
    {
      from: 'Zain from OneDesigner <team@onedesigner.app>',
      subject: '✅ FINAL TEST: You\'re approved!',
      html: emailWrapper(`
        <h2 style="color: #111827; margin: 0 0 16px 0;">Osama, you're in! 🎉</h2>
        <p style="color: #4B5563; line-height: 1.7; margin: 0 0 24px 0;">
          <strong style="color: #111827;">Your application? Approved.</strong>
          <br><br>
          Welcome to OneDesigner with our new golden branding!
        </p>
        <div style="margin: 24px 0;">
          <a href="https://onedesigner.app/designer" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Access Dashboard →
          </a>
        </div>
      `)
    },
    
    // 4. Project Request
    {
      from: 'Zain from OneDesigner <team@onedesigner.app>',
      subject: '🎯 FINAL TEST: New project request',
      html: emailWrapper(`
        <h2 style="color: #111827; margin: 0 0 16px 0;">You've got a match! 🎯</h2>
        <p style="color: #4B5563; line-height: 1.7; margin: 0 0 24px 0;">
          <strong style="color: #111827;">A client specifically wants YOU for their project.</strong>
          <br><br>
          Testing our new consistent branding across all email types.
        </p>
        <div style="background: #F9FAFB; border-left: 4px solid #f0ad4e; padding: 16px; margin: 16px 0;">
          <strong>Project:</strong> Brand Identity Design<br>
          <strong>Budget:</strong> $3,000 - $7,500<br>
          <strong>Timeline:</strong> 3 weeks
        </div>
        <div style="margin: 24px 0;">
          <a href="https://onedesigner.app/designer/requests" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Request →
          </a>
        </div>
      `)
    }
  ]
  
  console.log(`\n📧 Sending ${emails.length} final branding test emails...\n`)
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i]
    try {
      console.log(`${i + 1}. ${email.subject}`)
      console.log(`   Sender: ${email.from}`)
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: email.from,
          to: testEmail,
          subject: email.subject,
          html: email.html
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`   ✅ Sent (ID: ${result.id})`)
      } else {
        const error = await response.text()
        console.log(`   ❌ Failed: ${error}`)
      }
      
      // Wait between emails
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('🎨 Final branding test complete!')
  console.log(`📬 Check ${testEmail} for 4 emails with:`)
  console.log('✅ Golden OneDesigner headers')
  console.log('✅ team@onedesigner.app senders')
  console.log('✅ Consistent branding')
  console.log('✅ Email client compatibility')
  console.log('=' .repeat(60))
}

// Add fetch polyfill if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

sendFinalBrandingTest().catch(console.error)