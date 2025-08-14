/**
 * Comprehensive test of all OneDesigner email templates with new logo
 * Sends different email types to osamah96@gmail.com
 */

async function sendAllEmailTypes() {
  console.log('🎨 Testing All OneDesigner Email Templates with New Logo')
  console.log('=' .repeat(70))
  
  const RESEND_API_KEY = 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8'
  const testEmail = 'osamah96@gmail.com'
  
  const logoSVG = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <g fill="#f0ad4e">
        <ellipse cx="50" cy="30" rx="20" ry="25" />
        <ellipse cx="70" cy="50" rx="25" ry="20" />
        <ellipse cx="50" cy="70" rx="20" ry="25" />
        <ellipse cx="30" cy="50" rx="25" ry="20" />
        <circle cx="50" cy="50" r="12" />
      </g>
    </svg>
  `
  
  const emailHeader = `
    <div style="padding: 32px; border-bottom: 1px solid #F3F4F6; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 16px;">
        <div style="width: 48px; height: 48px; display: inline-block;">
          ${logoSVG}
        </div>
        <span style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">OneDesigner</span>
      </div>
    </div>
  `
  
  const emailWrapper = (content) => `
    <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      ${emailHeader}
      ${content}
    </div>
  `
  
  const emails = [
    // 1. Welcome Email
    {
      subject: '🎉 Test: Welcome Email with New Logo',
      html: emailWrapper(`
        <div style="padding: 32px;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Hey Osama 👋</h2>
          <p style="color: #4B5563; line-height: 1.7;">
            <strong>Welcome to OneDesigner!</strong> This is a test of our welcome email template with the new logo.
          </p>
          <div style="margin: 24px 0;">
            <a href="https://onedesigner.app" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Get Started →
            </a>
          </div>
        </div>
        <div style="padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #F3F4F6;">
          <p style="margin: 0; font-weight: 600; color: #111827;">— Zain from OneDesigner</p>
        </div>
      `)
    },
    
    // 2. OTP Email
    {
      subject: '🔐 Test: OTP Email with New Logo',
      html: emailWrapper(`
        <div style="padding: 32px;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Quick verification 👇</h2>
          <div style="background: #F9FAFB; border: 2px dashed #E5E7EB; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: monospace;">123456</div>
            <div style="font-size: 14px; color: #6B7280; margin-top: 12px;">Expires in 10 minutes</div>
          </div>
          <p style="color: #4B5563;">Just copy and paste this code to continue.</p>
        </div>
        <div style="padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #F3F4F6;">
          <p style="margin: 0; font-weight: 600; color: #111827;">— OneDesigner Security</p>
        </div>
      `)
    },
    
    // 3. Designer Approval Email
    {
      subject: '✅ Test: Designer Approval with New Logo',
      html: emailWrapper(`
        <div style="padding: 32px;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Osama, you're in! 🎉</h2>
          <p style="color: #4B5563; line-height: 1.7;">
            <strong>Your application? Approved.</strong><br><br>
            This is a test of our designer approval email with the new logo design.
          </p>
          <div style="margin: 24px 0;">
            <a href="https://onedesigner.app/designer/dashboard" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Access Dashboard →
            </a>
          </div>
        </div>
        <div style="padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #F3F4F6;">
          <p style="margin: 0; font-weight: 600; color: #111827;">— Zain from OneDesigner</p>
        </div>
      `)
    },
    
    // 4. Project Request Email
    {
      subject: '🎯 Test: Project Request with New Logo',
      html: emailWrapper(`
        <div style="padding: 32px;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">You've got a match! 🎯</h2>
          <p style="color: #4B5563; line-height: 1.7;">
            <strong>A client specifically wants YOU for their project.</strong><br><br>
            This is a test of our project request email template with the new logo.
          </p>
          <div style="background: #F9FAFB; border-left: 4px solid #f0ad4e; padding: 16px; margin: 16px 0;">
            <strong>Project:</strong> Logo Design for Tech Startup<br>
            <strong>Budget:</strong> $2,000 - $5,000<br>
            <strong>Timeline:</strong> 2 weeks
          </div>
          <div style="margin: 24px 0;">
            <a href="https://onedesigner.app/designer/requests" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Request →
            </a>
          </div>
        </div>
        <div style="padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #F3F4F6;">
          <p style="margin: 0; font-weight: 600; color: #111827;">— Zain from OneDesigner</p>
        </div>
      `)
    }
  ]
  
  console.log(`\n📧 Sending ${emails.length} test emails to ${testEmail}...\n`)
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i]
    try {
      console.log(`${i + 1}. Sending: ${email.subject}`)
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: i === 1 ? 'OneDesigner <team@onedesigner.app>' : 'Zain from OneDesigner <team@onedesigner.app>',
          to: testEmail,
          subject: email.subject,
          html: email.html
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`   ✅ Sent successfully (ID: ${result.id})`)
      } else {
        const error = await response.text()
        console.log(`   ❌ Failed: ${error}`)
      }
      
      // Wait 1 second between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  console.log('\n' + '=' .repeat(70))
  console.log('🎨 All test emails sent!')
  console.log(`📬 Check your inbox at ${testEmail} for 4 different email types`)
  console.log('\nEach email should display the new 4-petal OneDesigner logo! 🌸')
  console.log('=' .repeat(70))
}

// Add fetch polyfill for older Node versions
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

sendAllEmailTypes().catch(console.error)