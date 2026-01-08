import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin email from environment variable - required for security
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Generate a secure session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Validate admin email is configured
    if (!ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Admin email not configured' },
        { status: 500 }
      );
    }

    // Validate email is the admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Verify OTP from database
    const { data: tokenData, error: fetchError } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('email', email)
      .eq('token', code) // Changed from 'code' to 'token'
      .eq('type', 'blog_admin')
      .is('used_at', null) // Check if not used (used_at is null)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await supabase
      .from('auth_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Generate session token
    const sessionToken = generateSessionToken();
    
    // Store session in database (optional - for server-side validation)
    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24-hour session

    await supabase
      .from('auth_tokens')
      .insert({
        email,
        token: sessionToken, // Changed from 'code' to 'token'
        type: 'blog_admin_session',
        expires_at: sessionExpiry.toISOString()
        // No 'used' field - used_at will be null for active sessions
      });

    return NextResponse.json({ 
      success: true,
      token: sessionToken,
      message: 'Successfully authenticated'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}