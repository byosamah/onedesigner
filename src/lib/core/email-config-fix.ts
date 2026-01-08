/**
 * Email configuration with fallback for better delivery
 */

export const EMAIL_CONFIG = {
  // Production domain (requires full DNS setup)
  PRODUCTION_FROM: 'hello@onedesigner.app',
  
  // Fallback domain that works immediately (Resend's shared domain)
  FALLBACK_FROM: 'onboarding@resend.dev',
  
  // Use fallback for better delivery until DNS is fully configured
  USE_FALLBACK: process.env.USE_RESEND_FALLBACK === 'true',
  
  // Get the appropriate from address
  getFromAddress(senderName: string = 'OneDesigner'): string {
    const domain = this.USE_FALLBACK ? this.FALLBACK_FROM : this.PRODUCTION_FROM;
    return `${senderName} <${domain}>`;
  }
};

/**
 * Instructions to fix email delivery:
 * 
 * 1. IMMEDIATE FIX (Works now):
 *    Set USE_RESEND_FALLBACK=true in .env
 *    This uses onboarding@resend.dev which delivers to all emails
 *    Downside: Shows "via resend.dev" in email clients
 * 
 * 2. PROPER FIX (Takes 24-48 hours):
 *    a. Go to your domain provider (Namecheap, GoDaddy, etc.)
 *    b. Add these DNS records:
 *       - SPF: TXT record with value: "v=spf1 include:amazonses.com ~all"
 *       - DKIM: Get from Resend dashboard → Domains → onedesigner.app
 *       - DMARC: TXT record _dmarc.onedesigner.app with value: "v=DMARC1; p=none; rua=mailto:hello@onedesigner.app"
 *    c. Wait for DNS propagation (up to 48 hours)
 *    d. Test with mail-tester.com to check your score
 * 
 * 3. CHECK DELIVERY:
 *    - Resend Dashboard → Emails tab shows delivery status
 *    - "Delivered" = Reached mail server
 *    - "Bounced" = Rejected by recipient
 *    - Check spam folders if delivered but not in inbox
 */