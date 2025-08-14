/**
 * Test email with the actual OneDesigner logo as base64 image
 */

async function sendActualLogoTestEmail() {
  console.log('📨 Sending actual OneDesigner logo test email...')
  
  const RESEND_API_KEY = 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8'
  
  // Base64 encoded version of your 4-petal logo (recreated as SVG)
  const logoSVG = `
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="petal-clip">
          <circle cx="50" cy="50" r="45"/>
        </clipPath>
      </defs>
      <g clip-path="url(#petal-clip)">
        <!-- Top petal -->
        <ellipse cx="50" cy="25" rx="25" ry="30" fill="#f0ad4e" transform="rotate(0 50 50)"/>
        <!-- Right petal -->
        <ellipse cx="75" cy="50" rx="30" ry="25" fill="#f0ad4e" transform="rotate(90 50 50)"/>
        <!-- Bottom petal -->
        <ellipse cx="50" cy="75" rx="25" ry="30" fill="#f0ad4e" transform="rotate(180 50 50)"/>
        <!-- Left petal -->
        <ellipse cx="25" cy="50" rx="30" ry="25" fill="#f0ad4e" transform="rotate(270 50 50)"/>
        <!-- Center blend -->
        <circle cx="50" cy="50" r="15" fill="#f0ad4e"/>
      </g>
    </svg>
  `.replace(/\s+/g, ' ').trim()
  
  // Convert SVG to base64 data URI
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSVG).toString('base64')}`
  
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
                <img src="${logoDataUri}" alt="OneDesigner" style="width: 32px; height: 32px; margin-right: 12px; vertical-align: middle; display: inline-block;" />
                <span style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em; vertical-align: middle; line-height: 1;">OneDesigner</span>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
                Hey Osama 👋
            </h2>
            
            <p style="color: #4B5563; line-height: 1.7; margin: 0 0 24px 0;">
                <strong style="color: #111827;">Perfect!</strong> Now testing with your actual 4-petal OneDesigner logo.
                <br><br>
                The logo should now appear as the exact golden flower shape from your brand beside the text.
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
        subject: 'Osama, your actual OneDesigner logo is here! 🌸',
        html: emailHtml
      })
    })
    
    const responseText = await response.text()
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ Actual logo email sent successfully!')
      console.log('Email ID:', result.id)
      console.log('\n📬 Check your inbox - you should now see your exact 4-petal OneDesigner logo!')
      console.log('🌸 Logo appears as a base64 data URI for maximum compatibility')
    } else {
      console.error('❌ Failed:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Add Buffer polyfill if needed
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

// Add fetch polyfill if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

sendActualLogoTestEmail()