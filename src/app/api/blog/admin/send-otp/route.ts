import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin email whitelist
const ADMIN_EMAIL = 'osamah96@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email is the admin email
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Access denied. Only the blog administrator can access this area.' },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database with expiration (5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete any existing OTPs for this email
    await supabase
      .from('auth_tokens')
      .delete()
      .eq('email', email)
      .eq('type', 'blog_admin');

    // Insert new OTP
    const { error: insertError } = await supabase
      .from('auth_tokens')
      .insert({
        email,
        token: otp, // Changed from 'code' to 'token'
        type: 'blog_admin',
        expires_at: expiresAt.toISOString()
        // No 'used' field - table uses 'used_at' timestamp instead
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send OTP via email using your existing email service
    try {
      // Import your email service if it exists, otherwise use Resend directly
      const resendApiKey = process.env.RESEND_API_KEY || 're_KL6peoSX_KsWzKz8JhALUK3BdttMNS8M8';
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'OneDesigner <hello@onedesigner.app>',
          to: email,
          subject: '🔐 Blog Admin Access Code',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0; }
                  .header h1 { color: white; margin: 0; font-size: 28px; }
                  .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                  .otp-box { background: #f9fafb; border: 2px solid #f0ad4e; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0; }
                  .otp-code { font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; }
                  .warning { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0; }
                  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🔐 Blog Admin Access</h1>
                  </div>
                  <div class="content">
                    <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                      Hello Admin,
                    </p>
                    <p style="color: #4b5563; line-height: 1.6;">
                      You've requested access to the OneDesigner Blog Admin panel. Use the verification code below to complete your login:
                    </p>
                    
                    <div class="otp-box">
                      <div class="otp-code">${otp}</div>
                      <p style="color: #6b7280; margin-top: 10px; font-size: 14px;">
                        This code expires in 5 minutes
                      </p>
                    </div>
                    
                    <div class="warning">
                      <strong>⚠️ Security Notice:</strong><br>
                      If you didn't request this code, please ignore this email. Someone may be trying to access your admin panel.
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                      For security reasons, this code will expire in 5 minutes. If you need a new code, you can request one from the login page.
                    </p>
                  </div>
                  <div class="footer">
                    <p>© 2025 OneDesigner. All rights reserved.</p>
                    <p style="margin-top: 10px;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Resend API error:', errorText);
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        );
      }

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email' 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}