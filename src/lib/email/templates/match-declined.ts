interface MatchDeclinedEmailProps {
  clientName: string
  designerName: string
  projectType: string
  dashboardUrl: string
}

export function matchDeclinedEmail({
  clientName,
  designerName,
  projectType,
  dashboardUrl,
}: MatchDeclinedEmailProps) {
  const subject = `Update on your designer match`
  
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
          .info-box {
            background-color: #eff6ff;
            border: 1px solid #dbeafe;
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
            <h2>Hi ${clientName},</h2>
            
            <p>We wanted to update you on your match with ${designerName} for your ${projectType} project.</p>
            
            <div class="info-box">
              <p style="margin: 0;">
                Unfortunately, ${designerName} is unable to take on your project at this time. This could be due to current workload, scheduling conflicts, or project fit.
              </p>
            </div>
            
            <h3>What happens next?</h3>
            <p>Don't worry! You still have options:</p>
            
            <ul>
              <li><strong>Your credits remain available</strong> - No credits were used for this declined match</li>
              <li><strong>View other designers</strong> - Check your dashboard for other matched designers</li>
              <li><strong>Get new matches</strong> - We can find more designers that fit your project needs</li>
            </ul>
            
            <p>Remember, finding the right designer is important, and we're here to help you connect with someone who's the perfect fit for your project.</p>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">View Other Matches</a>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              OneDesigner - Connecting great designers with perfect projects<br>
              <a href="${dashboardUrl}" style="color: #6b7280;">Manage your matches</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Hi ${clientName},

We wanted to update you on your match with ${designerName} for your ${projectType} project.

Unfortunately, ${designerName} is unable to take on your project at this time. This could be due to current workload, scheduling conflicts, or project fit.

What happens next?
- Your credits remain available - No credits were used for this declined match
- View other designers - Check your dashboard for other matched designers
- Get new matches - We can find more designers that fit your project needs

Remember, finding the right designer is important, and we're here to help you connect with someone who's the perfect fit for your project.

View Other Matches: ${dashboardUrl}

--
OneDesigner - Connecting great designers with perfect projects
  `
  
  return { subject, html, text }
}