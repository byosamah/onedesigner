interface MatchAcceptedEmailProps {
  clientName: string
  designerName: string
  designerEmail: string
  designerPhone?: string
  designerWebsite?: string
  projectType: string
  dashboardUrl: string
}

export function matchAcceptedEmail({
  clientName,
  designerName,
  designerEmail,
  designerPhone,
  designerWebsite,
  projectType,
  dashboardUrl,
}: MatchAcceptedEmailProps) {
  const subject = `${designerName} accepted your project request!`
  
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
          .success-badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .contact-card {
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
            <h2>Hi ${clientName},</h2>
            
            <div style="text-align: center;">
              <div class="success-badge">Match Accepted!</div>
            </div>
            
            <p>Great news! ${designerName} has accepted your project request and is ready to discuss your ${projectType} project.</p>
            
            <div class="contact-card">
              <h3 style="margin-top: 0;">Designer Contact Information</h3>
              <p>
                <strong>Name:</strong> ${designerName}<br>
                <strong>Email:</strong> <a href="mailto:${designerEmail}">${designerEmail}</a><br>
                ${designerPhone ? `<strong>Phone:</strong> ${designerPhone}<br>` : ''}
                ${designerWebsite ? `<strong>Website:</strong> <a href="${designerWebsite}">${designerWebsite}</a><br>` : ''}
              </p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Reach out to ${designerName} directly using the contact information above</li>
              <li>Schedule an initial consultation to discuss your project in detail</li>
              <li>Share any relevant files, brand guidelines, or project requirements</li>
              <li>Agree on timeline, deliverables, and payment terms</li>
            </ol>
            
            <p style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <strong>Important:</strong> OneDesigner connects you with talented designers but doesn't manage the project or payment process. All project details and payments should be handled directly between you and the designer.
            </p>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">View Your Dashboard</a>
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

Great news! ${designerName} has accepted your project request and is ready to discuss your ${projectType} project.

Designer Contact Information:
- Name: ${designerName}
- Email: ${designerEmail}
${designerPhone ? `- Phone: ${designerPhone}` : ''}
${designerWebsite ? `- Website: ${designerWebsite}` : ''}

Next Steps:
1. Reach out to ${designerName} directly using the contact information above
2. Schedule an initial consultation to discuss your project in detail
3. Share any relevant files, brand guidelines, or project requirements
4. Agree on timeline, deliverables, and payment terms

Important: OneDesigner connects you with talented designers but doesn't manage the project or payment process. All project details and payments should be handled directly between you and the designer.

View Your Dashboard: ${dashboardUrl}

--
OneDesigner - Connecting great designers with perfect projects
  `
  
  return { subject, html, text }
}