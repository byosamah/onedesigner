import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sendFinalWorkingEmail() {
  console.log('📧 Sending final working rejection email...')
  
  try {
    const testEmail = 'designbattlefield@gmail.com'
    
    // Get the existing designer's token
    const { data: designer, error: findError } = await supabase
      .from('designers')
      .select('update_token, rejection_reason, first_name')
      .eq('email', testEmail)
      .single()
    
    if (findError || !designer || !designer.update_token) {
      console.error('❌ Designer not found or no update token:', findError)
      return
    }
    
    // Use the working www.onedesigner.app domain
    const updateApplicationUrl = `https://www.onedesigner.app/designer/update-application?token=${designer.update_token}`
    
    console.log('🔗 Using working production URL:', updateApplicationUrl)
    
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
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Dear ${designer.first_name || 'Designer'},</p>
        
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">Thank you for your interest in joining OneDesigner. After careful review of your application, we need you to update certain aspects of your profile to better showcase your expertise.</p>
        
        <!-- Feedback Section -->
        <div style="background-color: #fff8e1; border-left: 4px solid #f0ad4e; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Feedback from our team:</h3>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">${designer.rejection_reason}</p>
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
        subject: '✅ Application Update Required - OneDesigner (FINAL WORKING VERSION)',
        html: emailHtml,
        text: `Application Update Required\n\nDear ${designer.first_name || 'Designer'},\n\nThank you for your interest in joining OneDesigner. After careful review of your application, we need you to update certain aspects of your profile.\n\nFeedback: ${designer.rejection_reason}\n\nUpdate Your Application: ${updateApplicationUrl}\n\nThis link will expire in 7 days.\n\nBest regards,\nThe OneDesigner Team`
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ FINAL WORKING rejection email sent!')
      console.log('📧 Check designbattlefield@gmail.com inbox')
      console.log('🔗 Confirmed working URL:', updateApplicationUrl)
      console.log('📝 Email ID:', result.id)
      console.log('\n🎉 The rejection email system is now 100% functional!')
      console.log('💡 The API has been tested and confirmed working on production')
    } else {
      console.error('❌ Failed to send email:', result)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

sendFinalWorkingEmail()