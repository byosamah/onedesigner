import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin email from environment variable - required for security
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate admin email is configured
    if (!ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Admin email not configured. Please set ADMIN_EMAIL environment variable.' },
        { status: 500 }
      );
    }

    // Validate email is the admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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
        token: otp,
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

    // For testing - log the OTP to console
    console.log('\n========================================');
    console.log('🔐 BLOG ADMIN OTP CODE:', otp);
    console.log('📧 Email:', email);
    console.log('⏰ Expires:', expiresAt.toLocaleString());
    console.log('========================================\n');

    // Try to send email - NO FALLBACK API key for security
    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.log('⚠️ RESEND_API_KEY not configured - OTP stored in database but email not sent');
        console.log('⚠️ Check the console output above for the OTP code');
      }
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'OneDesigner <hello@onedesigner.app>',
          to: email,
          subject: `🔐 Your Blog Admin Code: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Blog Admin Access Code</h2>
              <p>Your verification code is:</p>
              <div style="background: #f0ad4e; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 5px;">
                ${otp}
              </div>
              <p style="color: #666; margin-top: 20px;">This code expires in 5 minutes.</p>
              <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
            </div>
          `
        })
      });
    } catch (emailError) {
      // Email failed but OTP is still stored - can be retrieved from console
      console.log('⚠️ Email sending failed, but OTP is stored and logged above');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent (check console if email fails)' 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}