interface NewMatchRequestEmailProps {
  designerName: string
  clientCompany: string
  projectType: string
  projectBudget: string
  matchScore: number
  matchReason: string
  requestId: string
  dashboardUrl: string
}

export function newMatchRequestEmail({
  designerName,
  clientCompany,
  projectType,
  projectBudget,
  matchScore,
  matchReason,
  requestId,
  dashboardUrl,
}: NewMatchRequestEmailProps) {
  const subject = `New design project match from ${clientCompany}`
  
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
          .match-score {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
          }
          .project-details {
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
            <h2>Hi ${designerName},</h2>
            
            <p>Great news! You've been matched with a new client project.</p>
            
            <div class="project-details">
              <p style="margin-top: 0;">
                <strong>Company:</strong> ${clientCompany}<br>
                <strong>Project Type:</strong> ${projectType}<br>
                <strong>Budget:</strong> ${projectBudget}<br>
                <span class="match-score">${matchScore}% Match</span>
              </p>
              
              <p style="margin-bottom: 0;">
                <strong>Why you're a great match:</strong><br>
                ${matchReason}
              </p>
            </div>
            
            <p>The client is interested in working with you. Review the full project details and respond to let them know if you're available.</p>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">View Project Details</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Note:</strong> Please respond within 48 hours. Projects that aren't accepted in time may be offered to other designers.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              OneDesigner - Connecting great designers with perfect projects<br>
              <a href="${dashboardUrl}" style="color: #6b7280;">Manage your projects</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Hi ${designerName},

Great news! You've been matched with a new client project.

Project Details:
- Company: ${clientCompany}
- Project Type: ${projectType}
- Budget: ${projectBudget}
- Match Score: ${matchScore}%

Why you're a great match:
${matchReason}

The client is interested in working with you. Review the full project details and respond to let them know if you're available.

View Project Details: ${dashboardUrl}

Note: Please respond within 48 hours. Projects that aren't accepted in time may be offered to other designers.

--
OneDesigner - Connecting great designers with perfect projects
  `
  
  return { subject, html, text }
}