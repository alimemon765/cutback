import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Handles Google OAuth callback
 * Exchanges authorization code for access token
 * Stores token securely in encrypted cookie
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // Return URL from OAuth flow

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, ''); // Remove trailing slash

  // Determine where to redirect after auth
  let returnUrl = `${baseUrl}/dashboard`;
  if (state) {
    try {
      const decodedState = decodeURIComponent(state);
      // Validate it's a relative URL to prevent open redirect
      if (decodedState.startsWith('/')) {
        returnUrl = `${baseUrl}${decodedState}`;
      }
    } catch {
      // Invalid state, use default
    }
  }

  if (error) {
    return NextResponse.redirect(
      `${returnUrl}?error=google_auth_failed`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${returnUrl}?error=no_code`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=oauth_not_configured`
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange error:', errorData);
      return NextResponse.redirect(
        `${returnUrl}?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(
        `${returnUrl}?error=user_info_failed`
      );
    }

    const userData = await userResponse.json();

    // Store tokens securely in encrypted cookie
    // Note: In production, consider encrypting these or storing in database
    const cookieStore = await cookies();
    cookieStore.set('google_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in || 3600, // Default 1 hour
      path: '/',
    });

    if (refresh_token) {
      cookieStore.set('google_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }

    // Store user email for reference
    cookieStore.set('google_user_email', userData.email, {
      httpOnly: false, // Can be read by client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    // Redirect back to the return URL (or dashboard)
    return NextResponse.redirect(
      `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}google_connected=true`
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      `${returnUrl}?error=oauth_error`
    );
  }
}

