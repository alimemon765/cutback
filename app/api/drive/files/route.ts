import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Lists video files from user's Google Drive
 * Requires Google OAuth token
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    // Debug logging (remove in production)
    const allCookies = cookieStore.getAll();
    const googleCookies = allCookies.filter(c => c.name.includes('google'));
    console.log('[Drive API] Google cookies found:', googleCookies.length, googleCookies.map(c => c.name));

    if (!accessToken) {
      console.log('[Drive API] No access token found');
      return NextResponse.json(
        { error: 'Not authenticated with Google. Please connect your Google account.' },
        { status: 401 }
      );
    }
    
    console.log('[Drive API] Access token found, length:', accessToken.length);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const pageToken = searchParams.get('pageToken') || '';

    // Build Drive API query
    // Search for video files (mimeType contains 'video')
    let driveQuery = "mimeType contains 'video' and trashed = false";
    if (query) {
      driveQuery += ` and name contains '${query.replace(/'/g, "\\'")}'`;
    }

    const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
    driveUrl.searchParams.set('q', driveQuery);
    driveUrl.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink)');
    driveUrl.searchParams.set('orderBy', 'modifiedTime desc');
    driveUrl.searchParams.set('pageSize', '20');
    
    if (pageToken) {
      driveUrl.searchParams.set('pageToken', pageToken);
    }

    const driveResponse = await fetch(driveUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!driveResponse.ok) {
      // Check if token expired
      if (driveResponse.status === 401) {
        // Try to refresh token
        const refreshToken = cookieStore.get('google_refresh_token')?.value;
        if (refreshToken) {
          const newToken = await refreshGoogleToken(refreshToken);
          if (newToken) {
            // Retry with new token
            const retryResponse = await fetch(driveUrl.toString(), {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              return NextResponse.json(retryData);
            }
          }
        }
        return NextResponse.json(
          { error: 'Google authentication expired. Please reconnect.' },
          { status: 401 }
        );
      }

      const errorData = await driveResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch Drive files' },
        { status: driveResponse.status }
      );
    }

    const data = await driveResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Drive API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Drive files' },
      { status: 500 }
    );
  }
}

/**
 * Refreshes Google access token using refresh token
 */
async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Update cookie with new access token
    const cookieStore = await cookies();
    cookieStore.set('google_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in || 3600,
      path: '/',
    });

    return data.access_token;
  } catch {
    return null;
  }
}

