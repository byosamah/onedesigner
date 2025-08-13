import { createEmailTemplate } from '../template-base'

interface ProjectRequestEmailData {
  designerName: string
  clientMessage: string
  projectType?: string
  timeline?: string
  budget?: string
  dashboardUrl: string
}

export function createProjectRequestEmail(data: ProjectRequestEmailData): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: '🎯 New Project Request!',
    content: {
      greeting: `Hi ${data.designerName}!`,
      mainText: `Great news! A client is interested in working with you on their project.
      
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
      
      <p style="color: #999; font-size: 14px; text-align: center;">
        Once you approve this project request, you'll receive the client's contact information.
      </p>`,
      ctaButton: {
        text: 'View in Dashboard →',
        href: data.dashboardUrl
      }
    }
  })

  return {
    subject: '🎯 New Project Request!',
    ...template
  }
}

interface ProjectApprovedEmailData {
  designerName: string
  designerEmail: string
}

export function createProjectApprovedEmail(data: ProjectApprovedEmailData): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: '✅ Project Request Approved!',
    content: {
      greeting: 'Great news!',
      mainText: `${data.designerName} has approved your project request.
      
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Designer Contact:</strong></p>
        <p style="color: #666; margin: 5px 0;">
          Email: <a href="mailto:${data.designerEmail}" style="color: #f0ad4e;">${data.designerEmail}</a>
        </p>
      </div>
      
      <p>You can now communicate directly with the designer to discuss your project details and next steps.</p>`
    }
  })

  return {
    subject: '✅ Project Request Approved!',
    ...template
  }
}

interface ProjectRejectedEmailData {
  designerName: string
  rejectionReason?: string
  dashboardUrl: string
}

export function createProjectRejectedEmail(data: ProjectRejectedEmailData): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: 'Project Request Update',
    content: {
      mainText: `Unfortunately, ${data.designerName} is not available for your project at this time.
      
      ${data.rejectionReason ? `
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Reason:</strong></p>
        <p style="color: #666; margin: 0;">${data.rejectionReason}</p>
      </div>
      ` : ''}
      
      <p>Don't worry! You can find another designer match or browse our other talented designers.</p>`,
      ctaButton: {
        text: 'Find Another Designer →',
        href: data.dashboardUrl
      }
    }
  })

  return {
    subject: 'Project Request Update',
    ...template
  }
}