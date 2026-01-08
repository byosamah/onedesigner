import { createEmailTemplate } from '../template-base'

interface DesignerMessageNotificationProps {
  designerName: string
  clientEmail: string
  projectType: string
  message: string
  matchScore: number
  dashboardUrl: string
}

export function createDesignerMessageNotificationEmail({
  designerName,
  clientEmail,
  projectType,
  message,
  matchScore,
  dashboardUrl
}: DesignerMessageNotificationProps) {
  const subject = `New project request from a client - ${matchScore}% match!`
  
  const content = `
    <div style="max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; margin-bottom: 20px;">Hi ${designerName}! 👋</h2>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 10px 0; color: white;">You have a new project request!</h3>
        <p style="margin: 0; font-size: 18px; color: white;">Match Score: <strong>${matchScore}%</strong></p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h4 style="color: #333; margin-top: 0;">Project Details:</h4>
        <p style="color: #666; margin: 5px 0;"><strong>Type:</strong> ${projectType}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Client:</strong> ${clientEmail}</p>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 12px; border-left: 4px solid #f0ad4e; margin-bottom: 30px;">
        <h4 style="color: #333; margin-top: 0;">Message from client:</h4>
        <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: #f0ad4e; color: #000; padding: 14px 30px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px;">
          View Request & Respond →
        </a>
      </div>
      
      <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-top: 30px;">
        <p style="color: #0c5460; margin: 0; font-size: 14px;">
          <strong>⏰ Time sensitive:</strong> This request will expire in 7 days. Respond quickly to secure this opportunity!
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
      
      <p style="color: #999; font-size: 14px; text-align: center;">
        You're receiving this because a client specifically requested to work with you based on your portfolio and experience.
      </p>
    </div>
  `
  
  return createEmailTemplate({
    subject,
    content,
    preheader: `New ${projectType} project request - ${matchScore}% match`
  })
}