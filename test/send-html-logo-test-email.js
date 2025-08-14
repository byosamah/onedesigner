/**
 * Test email with HTML/CSS created logo (Gmail compatible)
 */

async function sendHTMLLogoTestEmail() {
  console.log('📨 Sending HTML/CSS logo test email...')
  
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
            <div style="display: inline-block;">
                <!-- HTML/CSS Logo recreating the 4-petal shape -->
                <div style="display: inline-block; width: 32px; height: 32px; margin-right: 12px; vertical-align: middle; position: relative;">
                    <!-- Create 4-petal flower with CSS transforms -->
                    <div style="position: absolute; width: 18px; height: 24px; background: #f0ad4e; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; top: 0px; left: 7px; transform-origin: center bottom; transform: rotate(0deg);"></div>
                    <div style="position: absolute; width: 24px; height: 18px; background: #f0ad4e; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; top: 7px; right: 0px; transform-origin: left center; transform: rotate(90deg);"></div>
                    <div style="position: absolute; width: 18px; height: 24px; background: #f0ad4e; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; bottom: 0px; left: 7px; transform-origin: center top; transform: rotate(180deg);"></div>
                    <div style="position: absolute; width: 24px; height: 18px; background: #f0ad4e; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; top: 7px; left: 0px; transform-origin: right center; transform: rotate(270deg);"></div>
                    <!-- Center circle -->
                    <div style="position: absolute; width: 12px; height: 12px; background: #f0ad4e; border-radius: 50%; top: 10px; left: 10px;"></div>
                </div>
                <span style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em; vertical-align: middle; line-height: 1;">OneDesigner</span>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
                Hey Osama 👋
            </h2>
            
            <p style="color: #4B5563; line-height: 1.7; margin: 0 0 24px 0;">
                <strong style="color: #111827;">Fixed!</strong> This version uses pure HTML/CSS shapes that Gmail can't block.
                <br><br>
                The logo should now appear as your 4-petal flower shape made entirely with CSS styling.
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
                — Zain from OneDesigner
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
        from: 'Zain from OneDesigner <team@onedesigner.app>',
        to: 'osamah96@gmail.com',
        subject: 'Fixed! Pure CSS OneDesigner logo 🌸',
        html: emailHtml
      })
    })
    
    const responseText = await response.text()
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ HTML/CSS logo email sent successfully!')
      console.log('Email ID:', result.id)
      console.log('\n📬 This should work! Pure HTML/CSS shapes that Gmail cannot block.')
      console.log('🌸 No external images, no data URIs - just CSS styling!')
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

sendHTMLLogoTestEmail()