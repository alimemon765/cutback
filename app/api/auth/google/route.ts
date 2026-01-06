import { NextResponse } from 'next/server';

/**
 * Initiates Google OAuth flow
 * Redirects user to Google OAuth consent screen
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, ''); // Remove trailing slash
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 }
    );
  }

  // Google OAuth 2.0 authorization URL
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
  })}`;

  return NextResponse.redirect(authUrl);
}

