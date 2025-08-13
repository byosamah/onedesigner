// Send rejection email directly using Resend API
async function sendRejectionEmail() {
  console.log('📧 Sending test rejection email to designbattlefield@gmail.com...')
  
  try {
    // Generate test URLs
    const testToken = 'test-token-' + Date.now()
    const baseUrl = 'https://onedesigner.app'
    const updateApplicationUrl = `${baseUrl}/designer/update-application?token=${testToken}`
    
    // Email HTML template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="background-color: #f5f5f5; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #f0ad4e 0%, #ff9933 100%); padding: 40px 30px; text-align: center;">
        <div style="display: inline-block; width: 60px; height: 60px; background-color: white; border-radius: 50%; padding: 15px; margin-bottom: 20px;">
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
            <circle cx="50" cy="50" r="8" fill="#f0ad4e"/>
            <circle cx="50" cy="30" r="5" fill="#f0ad4e" opacity="0.7"/>
            <circle cx="50" cy="70" r="5" fill="#f0ad4e" opacity="0.7"/>
            <circle cx="30" cy="50" r="5" fill="#f0ad4e" opacity="0.7"/>
            <circle cx="70" cy="50" r="5" fill="#f0ad4e" opacity="0.7"/>
            <circle cx="35" cy="35" r="4" fill="#f0ad4e" opacity="0.5"/>
            <circle cx="65" cy="35" r="4" fill="#f0ad4e" opacity="0.5"/>
            <circle cx="35" cy="65" r="4" fill="#f0ad4e" opacity="0.5"/>
            <circle cx="65" cy="65" r="4" fill="#f0ad4e" opacity="0.5"/>
            <line x1="50" y1="30" x2="50" y2="50" stroke="#f0ad4e" stroke-width="1" opacity="0.3"/>
            <line x1="50" y1="50" x2="50" y2="70" stroke="#f0ad4e" stroke-width="1" opacity="0.3"/>
            <line x1="30" y1="50" x2="50" y2="50" stroke="#f0ad4e" stroke-width="1" opacity="0.3"/>
            <line x1="50" y1="50" x2="70" y2="50" stroke="#f0ad4e" stroke-width="1" opacity="0.3"/>
          </svg>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Application Update Required</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Dear Designer,</p>
        
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">Thank you for your interest in joining OneDesigner. After careful review of your application, we need you to update certain aspects of your profile to better showcase your expertise.</p>
        
        <!-- Feedback Section -->
        <div style="background-color: #fff8e1; border-left: 4px solid #f0ad4e; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Feedback from our team:</h3>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">Please update your portfolio section to include more recent work samples (within the last 2 years) and add detailed case studies for at least 3 projects. Also, ensure your bio clearly describes your design process and unique value proposition.</p>
        </div>
        
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">We believe in your potential and would love to see an updated application that better reflects your capabilities. Your previous application data has been saved, so you can easily update only the sections that need improvement.</p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${updateApplicationUrl}" style="display: inline-block; background: linear-gradient(135deg, #f0ad4e 0%, #ff9933 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(240, 173, 78, 0.3); transition: transform 0.2s;">Update Your Application</a>
        </div>
        
        <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 30px 0 0; text-align: center;">This update link will expire in 7 days. If you need more time or have any questions, please contact our support team.</p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px;">Best regards,<br><strong>The OneDesigner Team</strong></p>
        <p style="color: #adb5bd; font-size: 12px; margin: 10px 0 0;">© 2025 OneDesigner. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `
    
    // Email text version
    const emailText = `Application Update Required

Dear Designer,

Thank you for your interest in joining OneDesigner. After careful review of your application, we need you to update certain aspects of your profile to better showcase your expertise.

Feedback from our team:
Please update your portfolio section to include more recent work samples (within the last 2 years) and add detailed case studies for at least 3 projects. Also, ensure your bio clearly describes your design process and unique value proposition.

We believe in your potential and would love to see an updated application that better reflects your capabilities. Your previous application data has been saved, so you can easily update only the sections that need improvement.

Update Your Application: ${updateApplicationUrl}

This update link will expire in 7 days. If you need more time or have any questions, please contact our support team.

Best regards,
The OneDesigner Team

© 2025 OneDesigner. All rights reserved.`
    
    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'OneDesigner <team@onedesigner.app>',
        to: 'designbattlefield@gmail.com',
        subject: 'Application Update Required - OneDesigner',
        html: emailHtml,
        text: emailText
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Test rejection email sent successfully!')
      console.log('📧 Check designbattlefield@gmail.com inbox')
      console.log('🔗 Update URL in email:', updateApplicationUrl)
      console.log('📝 Response:', result)
      console.log('\n⚠️  Note: The update URL is a test URL and won\'t work without the database columns being added.')
      console.log('Please add the following columns to the designers table in Supabase:')
      console.log('  - update_token (TEXT)')
      console.log('  - update_token_expires (TIMESTAMP WITH TIME ZONE)')
      console.log('  - rejection_reason (TEXT)')
    } else {
      console.error('❌ Failed to send email:', result)
    }
    
  } catch (error) {
    console.error('❌ Error sending email:', error)
  }
}

sendRejectionEmail()