interface WelcomeDesignerEmailProps {
  designerName: string
  dashboardUrl: string
}

export function welcomeDesignerEmail({
  designerName,
  dashboardUrl,
}: WelcomeDesignerEmailProps) {
  const subject = 'Welcome to OneDesigner - Start Receiving Perfect Projects'
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background-color: #000000;
            color: #ffffff;
            padding: 30px 40px;
            text-align: center;
          }
          .content {
            padding: 40px;
          }
          .highlight-box {
            background-color: #10b9810a;
            border: 1px solid #10b98130;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .feature-list {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">OneDesigner</h1>
          </div>
          
          <div class="content">
            <h2>Welcome to OneDesigner, ${designerName}!</h2>
            
            <p>Congratulations! Your profile has been verified and you're now part of our exclusive designer network.</p>
            
            <div class="highlight-box">
              <p style="margin: 0; font-weight: 600;">
                🎉 You'll start receiving project matches that are perfect for your skills and experience.
              </p>
            </div>
            
            <div class="feature-list">
              <h3 style="margin-top: 0;">What makes OneDesigner different:</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>AI-Powered Matching</strong> - Only receive projects that match your expertise</li>
                <li><strong>Pre-Qualified Clients</strong> - Clients pay upfront to contact you</li>
                <li><strong>Direct Relationships</strong> - Work directly with clients, no middleman</li>
                <li><strong>You Set Your Terms</strong> - Negotiate your own rates and timelines</li>
              </ul>
            </div>
            
            <h3>How project matching works:</h3>
            <ol>
              <li>You'll receive an email when a client project matches your skills</li>
              <li>Review the project details and decide if you're interested</li>
              <li>Accept or decline within 48 hours</li>
              <li>If accepted, the client receives your contact information</li>
              <li>Connect directly and start working!</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </div>
            
            <p style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <strong>Pro tip:</strong> Keep your profile updated with your latest work and availability status to receive the best matches.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              OneDesigner - Connecting great designers with perfect projects<br>
              <a href="${dashboardUrl}" style="color: #6b7280;">Manage your profile</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Welcome to OneDesigner, ${designerName}!

Congratulations! Your profile has been verified and you're now part of our exclusive designer network.

🎉 You'll start receiving project matches that are perfect for your skills and experience.

What makes OneDesigner different:
- AI-Powered Matching - Only receive projects that match your expertise
- Pre-Qualified Clients - Clients pay upfront to contact you
- Direct Relationships - Work directly with clients, no middleman
- You Set Your Terms - Negotiate your own rates and timelines

How project matching works:
1. You'll receive an email when a client project matches your skills
2. Review the project details and decide if you're interested
3. Accept or decline within 48 hours
4. If accepted, the client receives your contact information
5. Connect directly and start working!

Go to Dashboard: ${dashboardUrl}

Pro tip: Keep your profile updated with your latest work and availability status to receive the best matches.

--
OneDesigner - Connecting great designers with perfect projects
  `
  
  return { subject, html, text }
}