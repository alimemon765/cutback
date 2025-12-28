import { createAPIClient } from '@/lib/supabase/api';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

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

    // Parse form data
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      );
    }

    // Get next version number
    const { data: versions, error: versionsError } = await supabase
      .from('video_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
      return NextResponse.json(
        { error: 'Failed to determine version number' },
        { status: 500 }
      );
    }

    const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Generate file path
    const fileExtension = videoFile.name.split('.').pop();
    const fileName = `v${nextVersion}_${Date.now()}.${fileExtension}`;
    const filePath = `${projectId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, videoFile, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload video to storage' },
        { status: 500 }
      );
    }

    // Get public URL (we'll use signed URLs for actual access)
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    // Deactivate all other versions
    await supabase
      .from('video_versions')
      .update({ is_active: false })
      .eq('project_id', projectId);

    // Create video version record
    const { data: videoVersion, error: versionError } = await supabase
      .from('video_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        file_name: videoFile.name,
        file_path: filePath,
        file_size: videoFile.size,
        mime_type: videoFile.type,
        storage_url: publicUrl,
        is_active: true,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (versionError) {
      console.error('Error creating version record:', versionError);
      // Try to clean up the uploaded file
      await supabase.storage.from('videos').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to create version record' },
        { status: 500 }
      );
    }

    return NextResponse.json(videoVersion, { status: 201 });
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

    // Get all video versions
    const { data: versions, error: versionsError } = await supabase
      .from('video_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false });

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
      return NextResponse.json(
        { error: 'Failed to fetch video versions' },
        { status: 500 }
      );
    }

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

