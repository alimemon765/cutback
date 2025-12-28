import { createAPIClient } from '@/lib/supabase/api';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAPIClient(request);
    const token = params.token;

    // Verify token is valid (no auth required for public access)
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

    // Parse request body
    const body = await request.json();
    const { clientName, content, timestamp } = body;

    if (!clientName || !clientName.trim()) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (typeof timestamp !== 'number' || timestamp < 0) {
      return NextResponse.json(
        { error: 'Valid timestamp is required' },
        { status: 400 }
      );
    }

    // Get the active video version for this project
    const { data: activeVersion, error: versionError } = await supabase
      .from('video_versions')
      .select('id')
      .eq('project_id', reviewLink.project_id)
      .eq('is_active', true)
      .single();

    if (versionError || !activeVersion) {
      return NextResponse.json(
        { error: 'No active video version found' },
        { status: 404 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        video_version_id: activeVersion.id,
        client_name: clientName.trim(),
        content: content.trim(),
        timestamp,
        status: 'open',
      })
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Update access count and last accessed time
    await supabase
      .from('review_links')
      .update({
        access_count: (reviewLink.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', reviewLink.id);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAPIClient(request);
    const token = params.token;

    // Verify token is valid
    const { data: reviewLink, error: linkError } = await supabase
      .from('review_links')
      .select('*, projects!inner(id)')
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

    // Get the active video version
    const { data: activeVersion, error: versionError } = await supabase
      .from('video_versions')
      .select('id')
      .eq('project_id', reviewLink.project_id)
      .eq('is_active', true)
      .single();

    if (versionError || !activeVersion) {
      return NextResponse.json(
        { error: 'No active video version found' },
        { status: 404 }
      );
    }

    // Get all comments for this video version
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('video_version_id', activeVersion.id)
      .order('timestamp', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

