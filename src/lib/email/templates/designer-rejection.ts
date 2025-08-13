import { createEmailTemplate } from '../template-base'

/**
 * Create rejection email for designers with option to update application
 */
export function createDesignerRejectionEmail(data: {
  designerName: string
  rejectionReason: string
  updateApplicationUrl: string
}): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: 'Your OneDesigner Application Update',
    preheader: 'Update your application based on our feedback',
    content: {
      greeting: `Hello ${data.designerName},`,
      mainText: `Thank you for your interest in joining OneDesigner.
      
      <p>After careful review, we're unable to approve your application at this time.</p>
      
      <div style="background: #fff5e6; border-left: 4px solid #f0ad4e; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #333;">Feedback from our review team:</p>
        <p style="margin: 0; color: #555; font-style: italic;">${data.rejectionReason}</p>
      </div>
      
      <p>We believe in giving talented designers the opportunity to improve and join our community. 
      You can update your application based on the feedback provided above.</p>
      
      <p><strong>Your previous application data has been saved</strong>, so you won't need to fill everything from scratch - 
      just update the areas mentioned in the feedback.</p>`,
      ctaButton: {
        text: 'Update Your Application',
        href: data.updateApplicationUrl,
        color: '#f0ad4e'
      },
      additionalSections: [
        {
          title: 'What happens next?',
          content: `<ul style="margin: 10px 0; padding-left: 20px;">
            <li>Click the button above to access your application</li>
            <li>Your previous answers will be pre-filled</li>
            <li>Update the sections based on our feedback</li>
            <li>Submit your updated application for review</li>
          </ul>`
        },
        {
          title: 'Tips for a successful application:',
          content: `<ul style="margin: 10px 0; padding-left: 20px;">
            <li>Ensure your portfolio showcases your best and most recent work</li>
            <li>Provide detailed descriptions of your design process</li>
            <li>Include links to live projects or case studies</li>
            <li>Highlight your unique skills and experiences</li>
          </ul>`
        }
      ]
    },
    footerContent: `
      <p><strong>OneDesigner</strong></p>
      <p>We're committed to building a community of exceptional designers</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}">Visit our website</a> | 
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/contact">Need help?</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        You're receiving this email because you applied to join OneDesigner.
      </p>
    `
  })

  return {
    subject: 'Your OneDesigner Application Update - Action Required',
    ...template
  }
}