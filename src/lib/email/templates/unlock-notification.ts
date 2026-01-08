import { createEmailTemplate } from '../template-base'

interface UnlockNotificationParams {
  designerName: string
  projectType?: string
  industry?: string
  timeline?: string
  budget?: string
  dashboardUrl: string
}

export function createUnlockNotificationEmail(params: UnlockNotificationParams): string {
  const { 
    designerName, 
    projectType,
    industry,
    timeline,
    budget,
    dashboardUrl 
  } = params

  const projectDetails = []
  if (projectType) projectDetails.push(`<strong>Type:</strong> ${projectType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
  if (industry) projectDetails.push(`<strong>Industry:</strong> ${industry}`)
  if (timeline) projectDetails.push(`<strong>Timeline:</strong> ${timeline}`)
  if (budget) projectDetails.push(`<strong>Budget:</strong> ${budget}`)

  const content = `
    <div style="text-align: center; padding: 40px 20px;">
      <div style="background: linear-gradient(135deg, #f0ad4e 0%, #e67e22 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; color: white;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔓</div>
        <h1 style="color: white; margin: 0 0 16px 0; font-size: 28px; font-weight: bold;">Great News, ${designerName}!</h1>
        <p style="color: white; margin: 0; font-size: 18px; opacity: 0.9;">A client has unlocked your profile and is interested in working with you</p>
      </div>

      ${projectDetails.length > 0 ? `
        <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
          <h3 style="color: #2c3e50; margin: 0 0 16px 0; font-size: 18px; text-align: center;">📋 Project Details</h3>
          <div style="color: #555; line-height: 1.6;">
            ${projectDetails.map(detail => `<p style="margin: 8px 0;">${detail}</p>`).join('')}
          </div>
        </div>
      ` : ''}

      <div style="margin: 32px 0;">
        <a href="${dashboardUrl}" 
           style="display: inline-block; 
                  padding: 16px 32px; 
                  background: #f0ad4e; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 12px; 
                  font-weight: bold; 
                  font-size: 16px;
                  box-shadow: 0 4px 12px rgba(240, 173, 78, 0.3);
                  transition: all 0.3s ease;">
          📱 View in Your Dashboard
        </a>
      </div>

      <p style="color: #7f8c8d; font-size: 14px; margin-top: 24px;">
        The client can now see your profile and may send you a project request. 
        Log in to your dashboard to see more details and respond.
      </p>
    </div>
  `

  return createEmailTemplate({
    title: '🔓 New Client Unlock',
    content
  })
}