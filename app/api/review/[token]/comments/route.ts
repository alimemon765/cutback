import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Use REST API with anon key for public access
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify token is valid using REST API
    const linkResponse = await fetch(
      `${supabaseUrl}/rest/v1/review_links?token=eq.${token}&is_active=eq.true&select=*`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
      }
    );

    if (!linkResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 404 }
      );
    }

    const reviewLinks = await linkResponse.json();
    if (!reviewLinks || reviewLinks.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 404 }
      );
    }

    const reviewLink = reviewLinks[0];

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

    // Get the active video version using REST API
    const versionResponse = await fetch(
      `${supabaseUrl}/rest/v1/video_versions?project_id=eq.${reviewLink.project_id}&is_active=eq.true&select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
      }
    );

    if (!versionResponse.ok) {
      return NextResponse.json(
        { error: 'No active video version found' },
        { status: 404 }
      );
    }

    const versions = await versionResponse.json();
    if (!versions || versions.length === 0) {
      return NextResponse.json(
        { error: 'No active video version found' },
        { status: 404 }
      );
    }

    const activeVersion = versions[0];

    // Create comment using REST API
    const commentResponse = await fetch(
      `${supabaseUrl}/rest/v1/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          video_version_id: activeVersion.id,
          client_name: clientName.trim(),
          content: content.trim(),
          timestamp,
          status: 'open',
        }),
      }
    );

    if (!commentResponse.ok) {
      const error = await commentResponse.json();
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    const comment = await commentResponse.json();
    const createdComment = Array.isArray(comment) ? comment[0] : comment;

    // Update access count using REST API
    await fetch(
      `${supabaseUrl}/rest/v1/review_links?id=eq.${reviewLink.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          access_count: (reviewLink.access_count || 0) + 1,
          last_accessed_at: new Date().toISOString(),
        }),
      }
    );

    return NextResponse.json(createdComment, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Use REST API with anon key for public access
    const linkResponse = await fetch(
      `${supabaseUrl}/rest/v1/review_links?token=eq.${token}&is_active=eq.true&select=*`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
      }
    );

    if (!linkResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 404 }
      );
    }

    const reviewLinks = await linkResponse.json();
    if (!reviewLinks || reviewLinks.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 404 }
      );
    }

    const reviewLink = reviewLinks[0];

    // Check if link has expired
    if (reviewLink.expires_at && new Date(reviewLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 403 }
      );
    }

    // Get the active video version using REST API
    const versionResponse = await fetch(
      `${supabaseUrl}/rest/v1/video_versions?project_id=eq.${reviewLink.project_id}&is_active=eq.true&select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
      }
    );

    if (!versionResponse.ok) {
      return NextResponse.json(
        { error: 'No active video version found' },
        { status: 404 }
      );
    }

    const versions = await versionResponse.json();
    if (!versions || versions.length === 0) {
      return NextResponse.json(
        { error: 'No active video version found' },
        { status: 404 }
      );
    }

    const activeVersion = versions[0];

    // Get all comments for this video version using REST API
    const commentsResponse = await fetch(
      `${supabaseUrl}/rest/v1/comments?video_version_id=eq.${activeVersion.id}&order=timestamp.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
      }
    );

    if (!commentsResponse.ok) {
      const error = await commentsResponse.json();
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    const comments = await commentsResponse.json();
    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
