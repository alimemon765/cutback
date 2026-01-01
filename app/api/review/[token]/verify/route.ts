import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create client with anon key only (no authentication) for public access
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const body = await request.json();
    const { password } = body;

    // Get review link using REST API with anon key
    // Query review_links without join first (to avoid RLS issues with projects table)
    const { data: reviewLink, error: linkError } = await supabase
      .from('review_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (linkError || !reviewLink) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 404 }
      );
    }

    // Check if link has expired
    if (reviewLink.expires_at && new Date(reviewLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 403 }
      );
    }

    // Check password if required
    if (reviewLink.password_hash) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required', requiresPassword: true },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, reviewLink.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Incorrect password', requiresPassword: true },
          { status: 401 }
        );
      }
    }

    // Get active video version using anon key
    const { data: activeVersion, error: versionError } = await supabase
      .from('video_versions')
      .select('*')
      .eq('project_id', reviewLink.project_id)
      .eq('is_active', true)
      .single();

    if (versionError || !activeVersion) {
      return NextResponse.json(
        { error: 'No active video version found' },
        { status: 404 }
      );
    }

    // Get signed URL for video using anon key
    // Extract storage path from file_url (which is a full public URL)
    // file_url format: https://xxx.supabase.co/storage/v1/object/public/videos/path/to/file.mp4
    // We need: path/to/file.mp4
    let storagePath: string | null = null;
    
    if (activeVersion.file_url) {
      // Try to extract path from public URL
      const urlMatch = activeVersion.file_url.match(/\/storage\/v1\/object\/public\/videos\/(.+)$/);
      if (urlMatch && urlMatch[1]) {
        storagePath = urlMatch[1];
      } else {
        // If file_url is already a path (not a full URL), use it directly
        storagePath = activeVersion.file_url;
      }
    }
    
    // Fallback: check if we have file_path or storage_url columns
    if (!storagePath && (activeVersion as any).file_path) {
      storagePath = (activeVersion as any).file_path;
    }
    if (!storagePath && (activeVersion as any).storage_url) {
      const storageUrl = (activeVersion as any).storage_url;
      const urlMatch = storageUrl?.match(/\/storage\/v1\/object\/public\/videos\/(.+)$/);
      storagePath = urlMatch ? urlMatch[1] : storageUrl;
    }

    if (!storagePath) {
      return NextResponse.json(
        { error: 'Video file path not found' },
        { status: 500 }
      );
    }

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('videos')
      .createSignedUrl(storagePath, 604800); // 7 days

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to access video' },
        { status: 500 }
      );
    }

    // Update access count using anon key (will need RLS policy for this)
    await supabase
      .from('review_links')
      .update({
        access_count: (reviewLink.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', reviewLink.id);

    // Return project info (name will be fetched client-side if needed)
    // We removed projects public policy to avoid recursion, so we can't query it here
    return NextResponse.json({
      project: {
        id: reviewLink.project_id,
        name: 'Project', // Default name - client can fetch actual name if needed
      },
      videoVersion: {
        ...activeVersion,
        signed_url: signedUrlData.signedUrl,
      },
      requiresPassword: false,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
