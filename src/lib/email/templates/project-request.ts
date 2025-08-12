import { baseEmailTemplate } from '../template-base'

interface ProjectRequestEmailData {
  designerName: string
  clientMessage: string
  projectType?: string
  timeline?: string
  budget?: string
  dashboardUrl: string
}

export function createProjectRequestEmail(data: ProjectRequestEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #f0ad4e; font-size: 24px; margin: 0;">🎯 New Project Request!</h1>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Hi ${data.designerName},</h2>
      
      <p style="color: #666; line-height: 1.6;">
        Great news! A client is interested in working with you on their project.
      </p>
      
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0;"><strong>Client Message:</strong></p>
        <p style="color: #666; margin: 10px 0; font-style: italic;">
          "${data.clientMessage}"
        </p>
      </div>
      
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Project Details:</strong></p>
        <ul style="color: #666; margin: 0; padding-left: 20px;">
          <li>Category: ${data.projectType || 'Not specified'}</li>
          <li>Timeline: ${data.timeline || 'Not specified'}</li>
          <li>Budget: ${data.budget || 'Not specified'}</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl}" style="display: inline-block; background: #f0ad4e; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold;">
          View in Dashboard →
        </a>
      </div>
      
      <p style="color: #999; font-size: 14px; text-align: center;">
        Once you approve this project request, you'll receive the client's contact information.
      </p>
    </div>
  `

  return baseEmailTemplate({
    title: '🎯 New Project Request!',
    content,
    footerText: '© OneDesigner - Connecting Clients with Perfect Designers'
  })
}

interface ProjectApprovedEmailData {
  designerName: string
  designerEmail: string
}

export function createProjectApprovedEmail(data: ProjectApprovedEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #10b981; font-size: 24px; margin: 0;">✅ Project Request Approved!</h1>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
      <p style="color: #666; line-height: 1.6;">
        Great news! ${data.designerName} has approved your project request.
      </p>
      
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Designer Contact:</strong></p>
        <p style="color: #666; margin: 5px 0;">
          Email: <a href="mailto:${data.designerEmail}" style="color: #f0ad4e;">${data.designerEmail}</a>
        </p>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        You can now communicate directly with the designer to discuss your project details and next steps.
      </p>
    </div>
  `

  return baseEmailTemplate({
    title: '✅ Project Request Approved!',
    content,
    footerText: '© OneDesigner - Connecting Clients with Perfect Designers'
  })
}

interface ProjectRejectedEmailData {
  designerName: string
  rejectionReason?: string
  dashboardUrl: string
}

export function createProjectRejectedEmail(data: ProjectRejectedEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #ef4444; font-size: 24px; margin: 0;">Project Request Update</h1>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
      <p style="color: #666; line-height: 1.6;">
        Unfortunately, ${data.designerName} is not available for your project at this time.
      </p>
      
      ${data.rejectionReason ? `
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Reason:</strong></p>
        <p style="color: #666; margin: 0;">${data.rejectionReason}</p>
      </div>
      ` : ''}
      
      <p style="color: #666; line-height: 1.6; margin-top: 20px;">
        Don't worry! You can find another designer match or browse our other talented designers.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl}" style="display: inline-block; background: #f0ad4e; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold;">
          Find Another Designer →
        </a>
      </div>
    </div>
  `

  return baseEmailTemplate({
    title: 'Project Request Update',
    content,
    footerText: '© OneDesigner - Connecting Clients with Perfect Designers'
  })
}