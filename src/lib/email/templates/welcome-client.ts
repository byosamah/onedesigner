interface WelcomeClientEmailProps {
  clientName: string
  dashboardUrl: string
}

export function welcomeClientEmail({
  clientName,
  dashboardUrl,
}: WelcomeClientEmailProps) {
  const subject = 'Welcome to OneDesigner - Find Your Perfect Designer'
  
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
          .feature-box {
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
            <h2>Welcome to OneDesigner, ${clientName}!</h2>
            
            <p>You're now ready to find the perfect designer for your project. Our AI-powered matching system will connect you with vetted designers who are the best fit for your specific needs.</p>
            
            <div class="feature-box">
              <h3 style="margin-top: 0;">How it works:</h3>
              <ol style="margin-bottom: 0;">
                <li><strong>Submit your project brief</strong> - Tell us about your design needs</li>
                <li><strong>Get matched instantly</strong> - Our AI finds the perfect designer for you</li>
                <li><strong>Purchase credits</strong> - Unlock designer contact information</li>
                <li><strong>Connect directly</strong> - Work with your designer without middlemen</li>
              </ol>
            </div>
            
            <p>We've carefully vetted every designer in our network to ensure you get high-quality results.</p>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Start Your First Project</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Tip:</strong> The more details you provide in your project brief, the better we can match you with the perfect designer.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              OneDesigner - Connecting great designers with perfect projects<br>
              <a href="${dashboardUrl}" style="color: #6b7280;">Go to dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Welcome to OneDesigner, ${clientName}!

You're now ready to find the perfect designer for your project. Our AI-powered matching system will connect you with vetted designers who are the best fit for your specific needs.

How it works:
1. Submit your project brief - Tell us about your design needs
2. Get matched instantly - Our AI finds the perfect designer for you
3. Purchase credits - Unlock designer contact information
4. Connect directly - Work with your designer without middlemen

We've carefully vetted every designer in our network to ensure you get high-quality results.

Start Your First Project: ${dashboardUrl}

Tip: The more details you provide in your project brief, the better we can match you with the perfect designer.

--
OneDesigner - Connecting great designers with perfect projects
  `
  
  return { subject, html, text }
}