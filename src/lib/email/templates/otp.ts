interface OTPEmailProps {
  otp: string
  name: string
  action?: string
}

export function otpEmailTemplate({ otp, name, action = 'verify your email' }: OTPEmailProps) {
  const subject = `Your OneDesigner verification code: ${otp}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your verification code</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Verify your email</h1>
        </div>
        
        <p style="color: #666; margin-bottom: 24px;">
          Hi ${name},
        </p>
        
        <p style="color: #666; margin-bottom: 32px;">
          Please use the verification code below to ${action}:
        </p>
        
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <div style="font-size: 36px; font-weight: bold; color: #f0ad4e; letter-spacing: 8px; font-family: monospace;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-bottom: 32px;">
          This code expires in 10 minutes. If you didn't request this code, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
          OneDesigner - AI-powered designer matching<br>
          <a href="https://onedesigner.app" style="color: #f0ad4e; text-decoration: none;">onedesigner.app</a>
        </p>
      </div>
    </body>
    </html>
  `
  
  const text = `
Hi ${name},

Please use the verification code below to ${action}:

${otp}

This code expires in 10 minutes. If you didn't request this code, please ignore this email.

---
OneDesigner - AI-powered designer matching
https://onedesigner.app
  `.trim()
  
  return { subject, html, text }
}