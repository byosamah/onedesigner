/**
 * Test email with CSS-based logo (more email client compatible)
 */

async function sendCSSLogoTestEmail() {
  console.log('📨 Sending CSS logo test email...')
  
  const RESEND_API_KEY = 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8'
  
  // Create CSS-based logo that mimics the 4-petal flower shape
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
                <!-- CSS Logo - 4 overlapping circles to create petal effect -->
                <div style="display: inline-block; width: 32px; height: 32px; margin-right: 12px; vertical-align: middle; position: relative;">
                    <div style="position: absolute; width: 20px; height: 20px; background: #f0ad4e; border-radius: 50%; top: -2px; left: 6px; opacity: 0.9;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; background: #f0ad4e; border-radius: 50%; top: 6px; right: -2px; opacity: 0.9;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; background: #f0ad4e; border-radius: 50%; bottom: -2px; left: 6px; opacity: 0.9;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; background: #f0ad4e; border-radius: 50%; top: 6px; left: -2px; opacity: 0.9;"></div>
                    <div style="position: absolute; width: 10px; height: 10px; background: #f0ad4e; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
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
                <strong style="color: #111827;">Testing CSS logo!</strong> This version uses pure CSS shapes instead of SVG.
                <br><br>
                The logo should now appear as overlapping circles creating a 4-petal flower effect.
            </p>
            
            <div style="margin: 32px 0;">
                <a href="https://onedesigner.app/client/dashboard" style="display: inline-block; padding: 14px 28px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Test Link →
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="padding: 24px 32px; border-top: 1px solid #F3F4F6; background: #F9FAFB;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827;">
                — Hala from OneDesigner
            </p>
            <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Testing CSS-based logo for email compatibility
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
        subject: 'Osama, testing CSS logo beside OneDesigner!',
        html: emailHtml
      })
    })
    
    const responseText = await response.text()
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ CSS Logo email sent successfully!')
      console.log('Email ID:', result.id)
      console.log('\n📬 Check your inbox - the logo should now be visible as CSS shapes!')
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

sendCSSLogoTestEmail()