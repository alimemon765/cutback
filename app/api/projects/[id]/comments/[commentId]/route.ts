import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const projectId = params.id;
    const commentId = params.commentId;

    // Extract access token from cookie
    const cookieHeader = request.headers.get('cookie') ?? '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract cookie value
    const [, cookieValue] = authCookie.split('=');
    let accessToken: string;
    let userId: string;

    try {
      // Parse the cookie JSON
      const decodedValue = decodeURIComponent(cookieValue);
      const cookieData = JSON.parse(decodedValue);
      accessToken = cookieData.access_token;
      userId = cookieData.user?.id;

      if (!accessToken || !userId) {
        throw new Error('No access token or user ID in cookie');
      }
    } catch (parseError: any) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Verify project ownership using REST API
    const projectResponse = await fetch(
      `${supabaseUrl}/rest/v1/projects?id=eq.${projectId}&owner_id=eq.${userId}&select=id,owner_id`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!projectResponse.ok) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const projects = await projectResponse.json();
    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (open, in_progress, or resolved)' },
        { status: 400 }
      );
    }

    // Verify comment belongs to this project using REST API
    const commentResponse = await fetch(
      `${supabaseUrl}/rest/v1/comments?id=eq.${commentId}&select=id,video_version_id,video_versions!inner(project_id)`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!commentResponse.ok) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comments = await commentResponse.json();
    if (!comments || comments.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = comments[0];
    // Check if comment belongs to this project
    if (comment.video_versions?.project_id !== projectId) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Update comment status using REST API
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/comments?id=eq.${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error('Error updating comment:', errorData);
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      );
    }

    const updatedComments = await updateResponse.json();
    const updatedComment = Array.isArray(updatedComments) ? updatedComments[0] : updatedComments;

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
