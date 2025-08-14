/**
 * Test email with just golden OneDesigner text (no logo)
 */

async function sendGoldenTextOnlyEmail() {
  console.log('📨 Sending golden OneDesigner text only email...')
  
  const RESEND_API_KEY = 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8'
  
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #FAFAFA;">
    <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="padding: 32px; border-bottom: 1px solid #F3F4F6; text-align: center;">
            <span style="font-size: 24px; font-weight: 700; color: #f0ad4e; letter-spacing: -0.02em;">OneDesigner</span>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
                Hey Osama 👋
            </h2>
            
            <p style="color: #4B5563; line-height: 1.7; margin: 0 0 24px 0;">
                <strong style="color: #111827;">Congrats!</strong> You just saved yourself weeks of portfolio browsing.
                <br><br>
                Here's what happens next:
                <br><br>
                <strong>1.</strong> Tell us about your project (2 min max)<br>
                <strong>2.</strong> Our AI analyzes 2,847 pre-vetted designers<br>
                <strong>3.</strong> Get your <span style="background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%); padding: 2px 6px; border-radius: 4px; font-weight: 600; color: #111827; display: inline-block; transform: rotate(-0.5deg); margin: 0 2px;">perfect match</span> in 0.3 seconds
                <br><br>
                No endless scrolling. No awkward interviews. No wondering if they're actually good.
                <br><br>
                Just your ideal designer, ready to start.
            </p>
            
            <div style="margin: 32px 0;">
                <a href="https://onedesigner.app/client/dashboard" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Start Your Brief →
                </a>
            </div>
            
            <p style="color: #4B5563; line-height: 1.7;">
                <strong>Quick tip:</strong> The more specific your brief, the better your match. 
                Don't hold back on the details — our AI loves them.
                <br><br>
                P.S. — Average time from brief to match? 37 seconds. Beat that if you can 😉
            </p>
        </div>
        
        <!-- Footer -->
        <div style="padding: 24px 32px; border-top: 1px solid #F3F4F6; background: #F9FAFB;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827;">
                — Hala from OneDesigner
            </p>
            <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Connecting great clients with amazing designers
            </p>
        </div>
    </div>
</body>
</html>
  `
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hala from OneDesigner <team@onedesigner.app>',
        to: 'osamah96@gmail.com',
        subject: 'Osama, ready to skip the portfolio hunt? (Golden text!)',
        html: emailHtml
      })
    })
    
    const responseText = await response.text()
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ Golden text email sent successfully!')
      console.log('Email ID:', result.id)
      console.log('\n📬 Clean and simple - just golden OneDesigner text!')
      console.log('🌟 No logos, no complications - pure golden branding!')
    } else {
      console.error('❌ Failed:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Add fetch polyfill if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

sendGoldenTextOnlyEmail()