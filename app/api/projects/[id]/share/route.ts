import { createAPIClient } from '@/lib/supabase/api';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAPIClient(request);
    const projectId = params.id;

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
      .select('id, owner_id, name')
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
    const { password, expiresIn } = body;

    // Hash password if provided
    let passwordHash = null;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    // Calculate expiration date if provided
    let expiresAt = null;
    if (expiresIn && typeof expiresIn === 'number' && expiresIn > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }

    // Generate random token (will be handled by database default)
    const { data: reviewLink, error: linkError } = await supabase
      .from('review_links')
      .insert({
        project_id: projectId,
        password_hash: passwordHash,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error creating review link:', linkError);
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }

    // Return the link with full URL
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const shareUrl = `${baseUrl}/review/${reviewLink.token}`;

    return NextResponse.json(
      {
        ...reviewLink,
        share_url: shareUrl,
      },
      { status: 201 }
    );
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAPIClient(request);
    const projectId = params.id;

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

    // Get all review links for this project
    const { data: reviewLinks, error: linksError } = await supabase
      .from('review_links')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (linksError) {
      console.error('Error fetching review links:', linksError);
      return NextResponse.json(
        { error: 'Failed to fetch share links' },
        { status: 500 }
      );
    }

    // Add full URLs to each link
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const linksWithUrls = reviewLinks.map(link => ({
      ...link,
      share_url: `${baseUrl}/review/${link.token}`,
    }));

    return NextResponse.json(linksWithUrls);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAPIClient(request);
    const projectId = params.id;

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
    const { linkId, isActive } = body;

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Update link status
    const { data: updatedLink, error: updateError } = await supabase
      .from('review_links')
      .update({ is_active: isActive })
      .eq('id', linkId)
      .eq('project_id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating review link:', updateError);
      return NextResponse.json(
        { error: 'Failed to update share link' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

