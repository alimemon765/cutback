import { NextResponse } from 'next/server';

/**
 * Initiates Google OAuth flow
 * Redirects user to Google OAuth consent screen
 */
export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, ''); // Remove trailing slash
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 }
    );
  }

  // Get return URL from query params (where to redirect after auth)
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get('return') || '';
  
  // Store return URL in state parameter (will be passed back in callback)
  const state = returnUrl ? encodeURIComponent(returnUrl) : '';

  // Google OAuth 2.0 authorization URL
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  const authParams: Record<string, string> = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
  };
  
  if (state) {
    authParams.state = state;
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(authParams)}`;

  return NextResponse.redirect(authUrl);
}

