import { createAPIClient } from '@/lib/supabase/api';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const supabase = createAPIClient(request);
    const projectId = params.id;
    const commentId = params.commentId;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, owner_id')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .single();

    if (projectError || !project) {
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

    // Verify comment belongs to this project
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('*, video_versions!inner(project_id)')
      .eq('id', commentId)
      .single();

    if (commentError || !comment || comment.video_versions.project_id !== projectId) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Update comment status
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', commentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

