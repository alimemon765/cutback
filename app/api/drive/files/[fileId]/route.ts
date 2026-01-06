import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Gets details and download URL for a specific Google Drive file
 */
export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Google' },
        { status: 401 }
      );
    }

    const fileId = params.fileId;

    // Get file metadata
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,thumbnailLink`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      const errorData = await metadataResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch file' },
        { status: metadataResponse.status }
      );
    }

    const fileMetadata = await metadataResponse.json();

    // Get download URL (for videos, we'll use webContentLink or create a proxy)
    // For video streaming, we'll use the file's webViewLink or create a proxy endpoint
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    return NextResponse.json({
      id: fileMetadata.id,
      name: fileMetadata.name,
      mimeType: fileMetadata.mimeType,
      size: fileMetadata.size,
      webViewLink: fileMetadata.webViewLink,
      thumbnailLink: fileMetadata.thumbnailLink,
      downloadUrl, // This will be used with Authorization header
      // Note: For actual streaming, we'll need a proxy endpoint that adds the auth header
    });
  } catch (error: any) {
    console.error('Drive file fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

