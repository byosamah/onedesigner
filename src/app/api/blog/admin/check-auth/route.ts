import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify session token from database
    const { data: sessionData, error } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token) // Changed from 'code' to 'token'
      .eq('type', 'blog_admin_session')
      .is('used_at', null) // Check if not used (used_at is null)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !sessionData) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      authenticated: true,
      email: sessionData.email
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}