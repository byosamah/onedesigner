/**
 * Centralized email template system
 * Provides consistent styling and structure for all emails
 */

export interface EmailTemplateProps {
  title: string
  preheader?: string
  headerImage?: string
  content: {
    greeting?: string
    mainText: string
    ctaButton?: {
      text: string
      href: string
      color?: string
    }
    additionalSections?: Array<{
      title: string
      content: string
    }>
  }
  footerContent?: string
}

/**
 * Base email template with consistent branding
 */
export function createEmailTemplate(props: EmailTemplateProps): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.title}</title>
    ${props.preheader ? `<meta name="description" content="${props.preheader}">` : ''}
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Email styles */
        body {
            background-color: #f8f9fa;
            margin: 0 !important;
            padding: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #f0ad4e;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 20px;
        }
        .main-text {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #f0ad4e;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #ec971f;
        }
        .section {
            margin: 30px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 15px;
        }
        .section-content {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #999999;
        }
        .footer a {
            color: #f0ad4e;
            text-decoration: none;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .header, .content, .footer {
                padding: 20px !important;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>OneDesigner</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
            ${props.content.greeting ? `<div class="greeting">${props.content.greeting}</div>` : ''}
            
            <div class="main-text">${props.content.mainText}</div>
            
            ${props.content.ctaButton ? `
                <div style="text-align: center;">
                    <a href="${props.content.ctaButton.href}" class="cta-button" style="background-color: ${props.content.ctaButton.color || '#f0ad4e'};">
                        ${props.content.ctaButton.text}
                    </a>
                </div>
            ` : ''}
            
            ${props.content.additionalSections ? props.content.additionalSections.map(section => `
                <div class="section">
                    <div class="section-title">${section.title}</div>
                    <div class="section-content">${section.content}</div>
                </div>
            `).join('') : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
            ${props.footerContent || `
                <p><strong>OneDesigner</strong></p>
                <p>Connecting great clients with amazing designers</p>
                <p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}">Visit our website</a> | 
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/contact">Contact us</a>
                </p>
            `}
        </div>
    </div>
</body>
</html>`

  // Generate plain text version
  const text = `
${props.title}

${props.content.greeting || ''}

${props.content.mainText}

${props.content.ctaButton ? `${props.content.ctaButton.text}: ${props.content.ctaButton.href}` : ''}

${props.content.additionalSections ? props.content.additionalSections.map(section => 
  `${section.title}\n${section.content}`
).join('\n\n') : ''}

---
OneDesigner
Connecting great clients with amazing designers
Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}
`.trim()

  return { html, text }
}

/**
 * Create welcome email for clients
 */
export function createWelcomeClientEmail(data: {
  clientName: string
  dashboardUrl: string
}): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: 'Welcome to OneDesigner!',
    preheader: 'Start finding amazing designers for your projects',
    content: {
      greeting: `Hi ${data.clientName}!`,
      mainText: `Welcome to OneDesigner! We're excited to help you find the perfect designer for your projects.
      
      <p>With OneDesigner, you can:</p>
      <ul>
        <li>Get matched with pre-vetted designers</li>
        <li>Access designer portfolios and contact information</li>
        <li>Start your projects with confidence</li>
      </ul>
      
      <p>Ready to get started?</p>`,
      ctaButton: {
        text: 'Go to Dashboard',
        href: data.dashboardUrl
      }
    }
  })

  return {
    subject: 'Welcome to OneDesigner! 🎨',
    ...template
  }
}

/**
 * Create welcome email for designers
 */
export function createWelcomeDesignerEmail(data: {
  designerName: string
  loginUrl: string
}): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: 'Welcome to OneDesigner!',
    preheader: 'Your application has been approved',
    content: {
      greeting: `Congratulations, ${data.designerName}!`,
      mainText: `Your application to join OneDesigner has been approved! You're now part of our community of talented designers.
      
      <p>What happens next:</p>
      <ul>
        <li>Complete your profile setup</li>
        <li>Receive match requests from clients</li>
        <li>Start working on amazing projects</li>
      </ul>
      
      <p>Log in to your dashboard to get started:</p>`,
      ctaButton: {
        text: 'Go to Dashboard',
        href: data.loginUrl
      }
    }
  })

  return {
    subject: 'Welcome to OneDesigner - You\'re approved! 🎉',
    ...template
  }
}

/**
 * Create OTP email
 */
export function createOTPEmail(data: {
  otp: string
  purpose?: string
}): { subject: string; html: string; text: string } {
  const template = createEmailTemplate({
    title: 'Your OneDesigner verification code',
    preheader: `Your code is ${data.otp}`,
    content: {
      greeting: 'Hello!',
      mainText: `Here's your verification code${data.purpose ? ` to ${data.purpose}` : ''}:
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: #f8f9fa; border: 2px solid #f0ad4e; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; display: inline-block;">
          ${data.otp}
        </div>
      </div>
      
      <p>This code will expire in 10 minutes for security reasons.</p>
      
      <p>If you didn't request this code, you can safely ignore this email.</p>`
    }
  })

  return {
    subject: 'Your OneDesigner verification code',
    ...template
  }
}