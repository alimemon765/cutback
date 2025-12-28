import { createAPIClient } from '@/lib/supabase/api';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAPIClient(request);
    const token = params.token;

    // Parse request body
    const body = await request.json();
    const { password } = body;

    // Get review link
    const { data: reviewLink, error: linkError } = await supabase
      .from('review_links')
      .select('*, projects!inner(id, name)')
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

    // Get active video version
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

    // Get signed URL for video
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('videos')
      .createSignedUrl(activeVersion.file_path, 604800); // 7 days

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to access video' },
        { status: 500 }
      );
    }

    // Update access count
    await supabase
      .from('review_links')
      .update({
        access_count: (reviewLink.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', reviewLink.id);

    return NextResponse.json({
      project: {
        id: reviewLink.project_id,
        name: reviewLink.projects.name,
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

