import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mark as dynamic since we use cookies
export const dynamic = 'force-dynamic';

/**
 * Proxies Google Drive video streaming
 * Adds authentication header so videos can be played in video player
 */
export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    // If no user token, try to use service account or public access
    // For now, return error - files should be shared publicly
    if (!accessToken) {
      // TODO: Implement service account fallback or public link access
      return NextResponse.json(
        { 
          error: 'Google Drive authentication required. Please ensure the Drive file is shared publicly, or reconnect your Google account.',
          hint: 'To share a Drive file publicly: Right-click file → Share → Change to "Anyone with the link"'
        },
        { status: 401 }
      );
    }

    const fileId = params.fileId;
    const { searchParams } = new URL(request.url);
    const range = request.headers.get('range');

    // Get download URL for the file
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    const headers: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Forward range header for video seeking
    if (range) {
      headers['Range'] = range;
    }

    const driveResponse = await fetch(driveUrl, {
      headers,
    });

    if (!driveResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to stream file from Drive' },
        { status: driveResponse.status }
      );
    }

    // Get content type and content length
    const contentType = driveResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = driveResponse.headers.get('content-length');
    const contentRange = driveResponse.headers.get('content-range');
    const acceptRanges = driveResponse.headers.get('accept-ranges');

    // Stream the video
    const videoStream = await driveResponse.arrayBuffer();

    const responseHeaders: HeadersInit = {
      'Content-Type': contentType,
      'Accept-Ranges': acceptRanges || 'bytes',
    };

    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
      return new NextResponse(videoStream, {
        status: 206, // Partial Content
        headers: responseHeaders,
      });
    }

    return new NextResponse(videoStream, {
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Drive streaming error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stream file' },
      { status: 500 }
    );
  }
}

