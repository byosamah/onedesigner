import { createEmailTemplate } from '../template-base'

interface ProjectRequestEmailData {
  designerName: string
  clientMessage: string
  projectType?: string
  timeline?: string
  budget?: string
  matchScore?: number
  responseDeadline?: string
  dashboardUrl: string
}

export function createProjectRequestEmail(data: ProjectRequestEmailData): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: '🎯 New Working Request!',
    content: {
      greeting: `Hi ${data.designerName}!`,
      mainText: `Great news! A client wants to work with you on their ${data.projectType || 'design'} project.
      
      ${data.matchScore ? `
      <div style="background: #f0ad4e20; border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
        <p style="color: #f0ad4e; margin: 0; font-size: 24px; font-weight: bold;">
          🎯 ${data.matchScore}% Match Score
        </p>
      </div>
      ` : ''}
      
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 12px 0;"><strong>Project Overview:</strong></p>
        <table style="width: 100%; color: #666;">
          <tr>
            <td style="padding: 4px 0;"><strong>Category:</strong></td>
            <td>${data.projectType || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Timeline:</strong></td>
            <td>${data.timeline || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Budget:</strong></td>
            <td>${data.budget || 'Not specified'}</td>
          </tr>
        </table>
      </div>
      
      ${data.responseDeadline ? `
      <div style="background: #fff3cd; border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
        <p style="color: #856404; margin: 0; font-size: 14px;">
          ⏰ <strong>Response Deadline:</strong> ${data.responseDeadline}
        </p>
        <p style="color: #856404; margin: 5px 0 0 0; font-size: 12px;">
          Please respond within 72 hours or the request will expire
        </p>
      </div>
      ` : ''}
      
      <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0;">
        View the complete project brief and respond in your dashboard.
      </p>`,
      ctaButton: {
        text: 'View Full Brief & Respond →',
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
    title: '✅ Designer Accepted Your Request!',
    content: {
      greeting: 'Fantastic news!',
      mainText: `${data.designerName} has accepted your working request and is ready to start on your project.
      
      <div style="background: #d4edda; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #155724; margin: 0; font-weight: bold; text-align: center;">
          ✅ Request Accepted!
        </p>
      </div>
      
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Designer Contact Information:</strong></p>
        <table style="width: 100%; color: #666;">
          <tr>
            <td style="padding: 8px 0;"><strong>Name:</strong></td>
            <td>${data.designerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td><a href="mailto:${data.designerEmail}" style="color: #f0ad4e; text-decoration: none;">${data.designerEmail}</a></td>
          </tr>
        </table>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>What's Next?</strong></p>
        <ol style="color: #666; margin: 0; padding-left: 20px;">
          <li style="margin: 5px 0;">Reach out to ${data.designerName} via email</li>
          <li style="margin: 5px 0;">Discuss project details and timeline</li>
          <li style="margin: 5px 0;">Agree on deliverables and milestones</li>
          <li style="margin: 5px 0;">Start your creative collaboration!</li>
        </ol>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center;">
        The designer will be expecting your message. Don't wait too long to connect!
      </p>`
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
    title: 'Designer Not Available',
    content: {
      greeting: 'Hi there,',
      mainText: `${data.designerName} is unable to take on your project at this time.
      
      <div style="background: #f8d7da; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #721c24; margin: 0; text-align: center;">
          Designer is not available for this project
        </p>
      </div>
      
      ${data.rejectionReason ? `
      <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Designer's Note:</strong></p>
        <p style="color: #666; margin: 0; font-style: italic;">"${data.rejectionReason}"</p>
      </div>
      ` : ''}
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #333; margin: 0 0 10px 0;"><strong>Don't worry! Here's what you can do:</strong></p>
        <ul style="color: #666; margin: 0; padding-left: 20px;">
          <li style="margin: 5px 0;">Find another designer match from your dashboard</li>
          <li style="margin: 5px 0;">Your match credits remain unchanged</li>
          <li style="margin: 5px 0;">We have many talented designers ready for your project</li>
        </ul>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center;">
        Every designer has their own specialty and availability. Let's find you the perfect match!
      </p>`,
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