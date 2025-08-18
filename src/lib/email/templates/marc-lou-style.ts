/**
 * Email templates inspired by Marc Lou's casual, direct style
 * Combined with OneDesigner's design system
 */

export interface MarcLouEmailProps {
  title: string
  preheader?: string
  content: {
    greeting?: string
    mainText: string
    ctaButton?: {
      text: string
      href: string
    }
    additionalContent?: string
    signature?: string
  }
  isOTPEmail?: boolean
  isRejectionEmail?: boolean
}

/**
 * Create email template with Marc Lou's casual style + OneDesigner design
 */
export function createMarcLouStyleEmail(props: MarcLouEmailProps): { html: string; text: string } {
  const senderName = props.isOTPEmail ? 'OneDesigner' : 'Hala from OneDesigner'
  
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
        
        /* Marc Lou inspired minimalist style */
        body {
            background-color: #FAFAFA;
            margin: 0 !important;
            padding: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #111827;
        }
        
        .email-wrapper {
            background-color: #FAFAFA;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Header with OneDesigner branding */
        .header {
            padding: 32px 32px 24px 32px;
            border-bottom: 1px solid #F3F4F6;
            text-align: center;
        }
        
        .logo-container {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            justify-content: center;
        }
        
        .logo {
            width: 32px;
            height: 32px;
            display: inline-block;
            vertical-align: middle;
        }
        
        .logo svg {
            width: 100%;
            height: 100%;
        }
        
        .brand-name {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            letter-spacing: -0.02em;
            display: inline-block;
            vertical-align: middle;
            line-height: 1;
        }
        
        /* Content area */
        .content {
            padding: 32px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
            letter-spacing: -0.01em;
        }
        
        .main-text {
            font-size: 16px;
            line-height: 1.7;
            color: #4B5563;
            margin-bottom: 24px;
        }
        
        .main-text strong {
            color: #111827;
            font-weight: 600;
        }
        
        .highlight {
            background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            color: #111827;
            display: inline-block;
            transform: rotate(-0.5deg);
            margin: 0 2px;
        }
        
        /* CTA Button - Marc Lou style */
        .cta-container {
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            padding: 14px 28px;
            background: #111827;
            color: #FFFFFF !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: -0.01em;
            transition: all 0.2s ease;
        }
        
        .cta-button:hover {
            background: #1F2937;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        /* Special styling for OTP */
        .otp-container {
            background: #F9FAFB;
            border: 2px dashed #E5E7EB;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #111827;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
        }
        
        .otp-expiry {
            font-size: 14px;
            color: #6B7280;
            margin-top: 12px;
        }
        
        /* Footer */
        .footer {
            padding: 24px 32px;
            border-top: 1px solid #F3F4F6;
            background: #F9FAFB;
        }
        
        .signature {
            font-size: 16px;
            color: #111827;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .footer-text {
            font-size: 14px;
            color: #6B7280;
            margin: 4px 0;
        }
        
        .footer-links {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #E5E7EB;
        }
        
        .footer-links a {
            color: #f0ad4e;
            text-decoration: none;
            font-size: 14px;
            margin: 0 12px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 24px 20px;
            }
            .cta-button {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <span style="font-size: 24px; font-weight: 700; color: #f0ad4e; letter-spacing: -0.02em;">OneDesigner</span>
            </div>
            
            <!-- Content -->
            <div class="content">
                ${props.content.greeting ? `<div class="greeting">${props.content.greeting}</div>` : ''}
                
                <div class="main-text">${props.content.mainText}</div>
                
                ${props.content.ctaButton ? `
                    <div class="cta-container">
                        <a href="${props.content.ctaButton.href}" class="cta-button">
                            ${props.content.ctaButton.text} →
                        </a>
                    </div>
                ` : ''}
                
                ${props.content.additionalContent ? `
                    <div class="main-text">${props.content.additionalContent}</div>
                ` : ''}
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="signature">${props.content.signature || `— ${senderName}`}</div>
                <div class="footer-text">Connecting great clients with amazing designers</div>
                
                <div class="footer-links">
                    <a href="https://onedesigner.app">Website</a>
                    <a href="https://onedesigner.app/help">Help</a>
                    <a href="https://twitter.com/onedesigner">Twitter</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

  // Generate plain text version
  const text = `
${props.content.greeting || ''}

${props.content.mainText.replace(/<[^>]*>/g, '')}

${props.content.ctaButton ? `${props.content.ctaButton.text}: ${props.content.ctaButton.href}` : ''}

${props.content.additionalContent ? props.content.additionalContent.replace(/<[^>]*>/g, '') : ''}

${props.content.signature || `— ${senderName}`}

OneDesigner - Connecting great clients with amazing designers
Website: https://onedesigner.app
`.trim()

  return { html, text }
}

/**
 * Welcome email for new clients - Marc Lou style
 */
export function createWelcomeClientEmailMarcStyle(data: {
  clientName: string
  dashboardUrl: string
}): { subject: string; html: string; text: string } {
  const template = createMarcLouStyleEmail({
    title: 'Welcome to OneDesigner!',
    preheader: 'Your perfect designer match is 0.3 seconds away',
    content: {
      greeting: `Hey ${data.clientName} 👋`,
      mainText: `
        <strong>Congrats!</strong> You just saved yourself weeks of portfolio browsing.
        <br><br>
        Here's what happens next:
        <br><br>
        <strong>1.</strong> Tell us about your project (2 min max) <br>
        <strong>2.</strong> Our AI analyzes 2,847 pre-vetted designers <br>
        <strong>3.</strong> Get your <span class="highlight">perfect match</span> in 0.3 seconds
        <br><br>
        No endless scrolling. No awkward interviews. No wondering if they're actually good.
        <br><br>
        Just your ideal designer, ready to start.
      `,
      ctaButton: {
        text: 'Start Your Brief',
        href: data.dashboardUrl
      },
      additionalContent: `
        <strong>Quick tip:</strong> The more specific your brief, the better your match. 
        Don't hold back on the details — our AI loves them.
        <br><br>
        P.S. — Average time from brief to match? 37 seconds. Beat that if you can 😉
      `,
      signature: '— Hala from OneDesigner'
    }
  })

  return {
    subject: `${data.clientName}, ready to skip the portfolio hunt?`,
    ...template
  }
}

/**
 * Designer approval email - Marc Lou style
 */
export function createDesignerApprovalEmailMarcStyle(data: {
  designerName: string
  dashboardUrl: string
}): { subject: string; html: string; text: string } {
  const template = createMarcLouStyleEmail({
    title: "You're in!",
    preheader: 'Welcome to OneDesigner',
    content: {
      greeting: `${data.designerName}, you're in! 🎉`,
      mainText: `
        <strong>Your application? Approved.</strong>
        <br><br>
        Out of 847 applications this week, yours stood out. Here's why:
        <br><br>
        ✓ Your portfolio shows real client work (not just Dribbble shots)<br>
        ✓ You actually explain your design process<br>
        ✓ Your style is distinctive, not generic
        <br><br>
        <strong>What happens now?</strong>
        <br><br>
        Clients submit briefs → Our AI matches them to designers → 
        If you're the match, you get <span class="highlight">the project request</span>
        <br><br>
        No bidding. No competing with 50 other designers. No race to the bottom pricing.
      `,
      ctaButton: {
        text: 'Access Your Dashboard',
        href: data.dashboardUrl
      },
      additionalContent: `
        <strong>Pro tip:</strong> Keep your availability updated. 
        Clients can see if you're ready to start immediately.
        <br><br>
        Welcome to the club. Let's get you some great projects.
      `,
      signature: '— Hala from OneDesigner'
    }
  })

  return {
    subject: `${data.designerName}, you're approved! (847 applied, you got in)`,
    ...template
  }
}

/**
 * Project approved email for clients - Marc Lou style
 */
export function createProjectApprovedEmailMarcStyle(data: {
  designerName: string
  designerEmail: string
}): { subject: string; html: string; text: string } {
  const template = createMarcLouStyleEmail({
    title: 'Great news!',
    preheader: 'Your project request has been approved',
    content: {
      greeting: '🎉 Fantastic news!',
      mainText: `
        ${data.designerName} is excited to work with you on your project!
        
        <div style="background: #ECFDF5; border-left: 4px solid #10B981; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <strong style="color: #065F46;">Designer Contact:</strong><br>
          <a href="mailto:${data.designerEmail}" style="color: #059669; font-weight: 600; text-decoration: none;">
            ${data.designerEmail}
          </a>
        </div>
        
        <strong>What happens next?</strong><br>
        Reach out to ${data.designerName} directly to:
        <ul style="color: #6B7280; margin-top: 8px;">
          <li>Discuss project details</li>
          <li>Set up a discovery call</li>
          <li>Share any additional requirements</li>
        </ul>
        
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 20px;">
          💡 Tip: The sooner you connect, the faster your project gets started!
        </p>
      `,
      signature: '— Hala from OneDesigner'
    }
  })

  return {
    subject: `✅ ${data.designerName} approved your project request!`,
    ...template
  }
}

/**
 * Project rejected email for clients - Marc Lou style
 */
export function createProjectRejectedEmailMarcStyle(data: {
  designerName: string
  rejectionReason?: string
  dashboardUrl: string
}): { subject: string; html: string; text: string } {
  const template = createMarcLouStyleEmail({
    title: 'Project update',
    preheader: 'Designer response to your request',
    content: {
      greeting: 'Quick update on your project request',
      mainText: `
        ${data.designerName} isn't available for your project right now.
        
        ${data.rejectionReason ? `
        <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <strong style="color: #991B1B;">Designer's note:</strong><br>
          <span style="color: #7F1D1D;">${data.rejectionReason}</span>
        </div>
        ` : ''}
        
        <strong>Don't worry!</strong> We have plenty of other talented designers who'd love to work with you.
        
        <p style="margin-top: 16px;">
          You still have your match credit, so you can:
        </p>
        <ul style="color: #6B7280;">
          <li>Find a new designer match</li>
          <li>Browse other available designers</li>
          <li>Adjust your project requirements and try again</li>
        </ul>
      `,
      ctaButton: {
        text: 'Find Another Designer →',
        href: data.dashboardUrl
      },
      additionalContent: `
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 24px;">
          Need help finding the right designer? Reply to this email and we'll assist you personally.
        </p>
      `,
      signature: '— Hala from OneDesigner'
    }
  })

  return {
    subject: `Update on your project request`,
    ...template
  }
}

/**
 * Designer rejection email - Marc Lou style (simplified without token)
 */
export function createDesignerRejectionEmailMarcStyle(data: {
  designerName: string
  rejectionReason: string
  loginUrl?: string
}): { subject: string; html: string; text: string } {
  const loginLink = data.loginUrl || 'https://onedesigner.app/designer/login'
  
  const template = createMarcLouStyleEmail({
    title: "Not quite there yet",
    preheader: 'Update your application based on our feedback',
    isRejectionEmail: true,
    content: {
      greeting: `${data.designerName}, let's be honest 💭`,
      mainText: `
        Your application didn't make it this time. But here's the thing:
        <br><br>
        <strong>37% of our approved designers</strong> got rejected on their first try.
        <br><br>
        <div class="highlight-box" style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <strong style="color: #92400E;">Why we couldn't approve you:</strong>
          <br><br>
          <span style="color: #78350F; line-height: 1.6;">${data.rejectionReason}</span>
        </div>
        
        <strong>The good news?</strong>
        <br><br>
        You can fix this right now. Just log in, go to your profile, and update it.
        <br><br>
        No starting from scratch. No re-entering everything. Just fix what needs fixing.
        <br><br>
        <strong>Quick tips that work:</strong>
        <br><br>
        ✓ Show real client work (not just concepts)<br>
        ✓ Explain your design decisions<br>
        ✓ Include before/after examples<br>
        ✓ Add links to live projects
      `,
      ctaButton: {
        text: 'Login & Update Profile',
        href: loginLink
      },
      additionalContent: `
        <strong>How to update:</strong>
        <br>
        1. Login to your account<br>
        2. You'll see our feedback<br>
        3. Click "Edit Profile"<br>
        4. Make the changes<br>
        5. Hit "Resubmit for Review"
        <br><br>
        Takes about 5 minutes. Then we'll review it again (usually within 24 hours).
      `,
      signature: '— Hala from OneDesigner'
    }
  })

  return {
    subject: `${data.designerName}, quick fixes needed (then you're in)`,
    ...template
  }
}

/**
 * OTP verification email - Marc Lou style
 */
export function createOTPEmailMarcStyle(data: {
  otp: string
  purpose?: string
}): { subject: string; html: string; text: string } {
  const template = createMarcLouStyleEmail({
    title: 'Your verification code',
    preheader: `Code: ${data.otp}`,
    isOTPEmail: true,
    content: {
      greeting: 'Quick verification 👇',
      mainText: `
        <div class="otp-container">
          <div class="otp-code">${data.otp}</div>
          <div class="otp-expiry">Expires in 10 minutes</div>
        </div>
        
        Just copy and paste this code to continue.
        <br><br>
        <em style="color: #9CA3AF; font-size: 14px;">
        (If you didn't request this, just ignore this email)
        </em>
      `,
      signature: '— OneDesigner Security'
    }
  })

  return {
    subject: `${data.otp} is your OneDesigner code`,
    ...template
  }
}

/**
 * Reminder email for pending project requests - Marc Lou style
 */
export function createProjectRequestReminderMarcStyle(data: {
  designerName: string
  daysRemaining: number
  projectType?: string
  clientMessage?: string
  dashboardUrl: string
}): { subject: string; html: string; text: string } {
  const urgency = data.daysRemaining <= 1 ? '⏰ Last day!' : data.daysRemaining <= 3 ? '⚡ Time sensitive' : '📌 Reminder'
  
  const template = createMarcLouStyleEmail({
    title: 'Project request reminder',
    preheader: `${data.daysRemaining} days left to respond`,
    content: {
      greeting: `Hey ${data.designerName}! 👋`,
      mainText: `
        ${urgency} You have a pending project request that needs your response.
        
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <strong style="color: #92400E;">⏱️ ${data.daysRemaining} ${data.daysRemaining === 1 ? 'day' : 'days'} remaining</strong>
          ${data.projectType ? `<br>Project: ${data.projectType}` : ''}
        </div>
        
        ${data.daysRemaining <= 1 ? 
          `<strong>This request expires tomorrow!</strong> The client is waiting for your response.` :
          `The client is eager to hear from you. A quick response helps maintain your 100% response rate.`
        }
        
        ${data.clientMessage ? `
        <div style="margin-top: 20px; padding: 16px; background: #F9FAFB; border-radius: 8px;">
          <em style="color: #6B7280;">"${data.clientMessage}"</em>
        </div>
        ` : ''}
      `,
      ctaButton: {
        text: data.daysRemaining <= 1 ? 'Respond Now →' : 'View Request',
        href: data.dashboardUrl
      },
      additionalContent: `
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 24px;">
          💡 Pro tip: Quick responses lead to better client relationships and more projects!
        </p>
      `,
      signature: '— Hala from OneDesigner'
    }
  })

  return {
    subject: `${urgency} ${data.daysRemaining} ${data.daysRemaining === 1 ? 'day' : 'days'} left to respond to project request`,
    ...template
  }
}

/**
 * Project request email for designers - Marc Lou style
 */
export function createProjectRequestEmailMarcStyle(data: {
  designerName: string
  clientMessage: string
  projectType?: string
  timeline?: string
  budget?: string
  dashboardUrl: string
}): { subject: string; html: string; text: string } {
  const template = createMarcLouStyleEmail({
    title: 'New project request!',
    preheader: 'A client wants to work with you',
    content: {
      greeting: `${data.designerName}, you've got a match! 🎯`,
      mainText: `
        <strong>A client specifically wants YOU for their project.</strong>
        <br><br>
        Not 10 other designers. Not the cheapest option. You.
        <br><br>
        <div style="background: #F9FAFB; border-left: 4px solid #f0ad4e; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <strong>Client's message:</strong><br>
          <em style="color: #4B5563;">"${data.clientMessage}"</em>
        </div>
        
        <strong>Project details:</strong><br>
        📁 Type: ${data.projectType || 'Not specified'}<br>
        ⏱ Timeline: ${data.timeline || 'Flexible'}<br>
        💰 Budget: ${data.budget || 'To be discussed'}
        <br><br>
        You have <span class="highlight">7 days</span> to respond before this expires.
      `,
      ctaButton: {
        text: 'View Full Request',
        href: data.dashboardUrl
      },
      additionalContent: `
        <strong>Quick reminder:</strong> Accepting reveals your contact info to the client. 
        Rejecting keeps you anonymous but frees them to find another designer.
      `,
      signature: '— Hala from OneDesigner'
    }
  })

  return {
    subject: `${data.designerName}, you just got picked for a ${data.budget || 'new'} project`,
    ...template
  }
}