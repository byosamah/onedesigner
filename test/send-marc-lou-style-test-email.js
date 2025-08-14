/**
 * Test script to send Marc Lou style welcome email to osamah96@gmail.com
 */

// Direct Resend API call for immediate testing
async function sendDirectTestEmail() {
  console.log('\n📨 Attempting direct Resend API call...')
  
  const RESEND_API_KEY = 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8'
  
  // Create a simple test version
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
                <span style="display: inline-block; width: 32px; height: 32px; background: #f0ad4e; border-radius: 50%; margin-right: 12px; vertical-align: middle; position: relative;">
                    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 18px; color: white;">🌸</span>
                </span>
                <span style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em; vertical-align: middle; line-height: 1;">OneDesigner</span>
            </div>
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
                <strong>3.</strong> Get your <span style="background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%); padding: 2px 6px; border-radius: 4px; font-weight: 600;">perfect match</span> in 0.3 seconds
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
        subject: 'Osama, ready to skip the portfolio hunt? (Emoji logo test!)',
        html: emailHtml
      })
    })
    
    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response:', responseText)
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('\n✅ Email sent successfully!')
      console.log('Email ID:', result.id || result.data?.id)
      console.log('\n📬 Check your inbox at osamah96@gmail.com')
    } else {
      console.error('❌ Failed to send email:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the direct test
sendDirectTestEmail()