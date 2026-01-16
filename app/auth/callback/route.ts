import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    try {
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent(sessionError.message)}`, requestUrl.origin)
        );
      }

      if (data.session) {
        // Create response with redirect
        const response = NextResponse.redirect(new URL('/', requestUrl.origin));

        // Set auth cookies for client-side session persistence
        const cookieStore = await cookies();

        // Set access token cookie
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: data.session.expires_in,
        });

        // Set refresh token cookie
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        console.log('OAuth login successful for user:', data.session.user.email);
        return response;
      }
    } catch (err) {
      console.error('Auth callback error:', err);
      return NextResponse.redirect(
        new URL('/?error=Authentication%20failed', requestUrl.origin)
      );
    }
  }

  // Redirect to home page after authentication
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
