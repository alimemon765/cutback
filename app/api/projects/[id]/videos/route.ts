import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Extract access token from cookie
    const cookieHeader = request.headers.get('cookie') ?? '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
    
    if (!authCookie) {
      return NextResponse.json({ error: 'No authentication cookie found' }, { status: 401 });
    }

    // Extract cookie value
    const [, cookieValue] = authCookie.split('=');
    let accessToken: string;
    let userId: string;

    try {
      const decodedValue = decodeURIComponent(cookieValue);
      const cookieData = JSON.parse(decodedValue);
      accessToken = cookieData.access_token;
      userId = cookieData.user?.id;

      if (!accessToken || !userId) {
        throw new Error('Invalid token or user ID');
      }
    } catch (parseError: any) {
      return NextResponse.json({ error: 'Invalid authentication cookie' }, { status: 401 });
    }

    // Verify project ownership using REST API (ensures RLS works)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectCheckUrl = `${supabaseUrl}/rest/v1/projects?id=eq.${projectId}&owner_id=eq.${userId}&select=id,owner_id`;
    
    const projectCheckResponse = await fetch(projectCheckUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!projectCheckResponse.ok) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const projects = await projectCheckResponse.json();
    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Check if this is an external video source (JSON) or file upload (FormData)
    const contentType = request.headers.get('content-type') || '';
    const isExternalSource = contentType.includes('application/json');

    let externalProvider: string | null = null;
    let externalFileId: string | null = null;
    let externalFileUrl: string | null = null;
    let fileName: string;
    let fileSize: number | null = null;
    let videoFile: File | null = null;

    if (isExternalSource) {
      // Handle external video source (Google Drive, etc.)
      const body = await request.json();
      externalProvider = body.external_provider;
      externalFileId = body.external_file_id;
      externalFileUrl = body.external_file_url;
      fileName = body.file_name;
      fileSize = body.file_size || null;

      if (!externalProvider || !externalFileId || !fileName) {
        return NextResponse.json(
          { error: 'Missing required fields for external video source' },
          { status: 400 }
        );
      }

      // Validate provider
      if (!['google_drive', 'dropbox', 'vimeo'].includes(externalProvider)) {
        return NextResponse.json(
          { error: 'Invalid external provider' },
          { status: 400 }
        );
      }
    } else {
      // Handle file upload
      const formData = await request.formData();
      videoFile = formData.get('video') as File;

      if (!videoFile) {
        return NextResponse.json(
          { error: 'No video file provided' },
          { status: 400 }
        );
      }

      fileName = videoFile.name;
      fileSize = videoFile.size;
    }

    // Validate file size (only for uploaded files)
    if (videoFile && videoFile.size > MAX_FILE_SIZE) {
      const fileSizeMB = (videoFile.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { 
          error: `File too large. File size: ${fileSizeMB}MB, Maximum allowed: ${maxSizeMB}MB.`,
          fileSize: videoFile.size,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    // Get next version number using REST API
    const versionsUrl = `${supabaseUrl}/rest/v1/video_versions?project_id=eq.${projectId}&select=version_number&order=version_number.desc&limit=1`;
    
    const versionsResponse = await fetch(versionsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let nextVersion = 1;
    if (versionsResponse.ok) {
      const versions = await versionsResponse.json();
      if (versions && versions.length > 0) {
        nextVersion = versions[0].version_number + 1;
      }
    }

    let fileUrl: string;

    if (externalProvider) {
      // For external sources, use the provided URL or construct proxy URL
      // For Google Drive, we'll use our proxy endpoint
      if (externalProvider === 'google_drive') {
        fileUrl = `/api/drive/files/${externalFileId}/stream`;
      } else {
        // For other providers, use the provided URL
        fileUrl = externalFileUrl || '';
      }
    } else {
      // Handle file upload
      const fileExtension = videoFile!.name.split('.').pop();
      const storageFileName = `v${nextVersion}_${Date.now()}.${fileExtension}`;
      const filePath = `${projectId}/${storageFileName}`;

      // Upload to Supabase Storage using REST API (ensures JWT is sent for RLS)
      const storageUrl = `${supabaseUrl}/storage/v1/object/videos/${filePath}`;
      
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', videoFile!);

      const storageResponse = await fetch(storageUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
        body: uploadFormData,
      });

      if (!storageResponse.ok) {
        const errorText = await storageResponse.text();
        let error: any;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText || storageResponse.statusText };
        }

        const fileSizeMB = ((videoFile!.size) / (1024 * 1024)).toFixed(2);
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);

        // Provide helpful error message for size limit errors
        if (error.message?.toLowerCase().includes('maximum allowed size') || error.message?.toLowerCase().includes('exceeded')) {
          return NextResponse.json(
            { 
              error: `File size limit exceeded. Your file is ${fileSizeMB}MB. Please check your Supabase Storage bucket settings - the limit may be smaller than 500MB.`,
              fileSize: videoFile!.size,
              fileSizeMB: fileSizeMB,
              maxSizeMB: maxSizeMB,
              details: error.message
            },
            { status: storageResponse.status }
          );
        }

        return NextResponse.json(
          { 
            error: 'Failed to upload video to storage: ' + (error.message || storageResponse.statusText),
            details: error
          },
          { status: storageResponse.status }
        );
      }

      // Get public URL (we'll use signed URLs for actual access)
      fileUrl = `${supabaseUrl}/storage/v1/object/public/videos/${filePath}`;
    }

    // Deactivate all other versions using REST API
    const deactivateUrl = `${supabaseUrl}/rest/v1/video_versions?project_id=eq.${projectId}`;
    await fetch(deactivateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ is_active: false }),
    });

    // Create video version record using REST API
    const createVersionUrl = `${supabaseUrl}/rest/v1/video_versions`;
    const versionData: any = {
      project_id: projectId,
      version_number: nextVersion,
      file_name: fileName,
      file_url: fileUrl,
      file_size: fileSize,
      is_active: true,
    };

    // Add external source fields if applicable
    if (externalProvider) {
      versionData.external_provider = externalProvider;
      versionData.external_file_id = externalFileId;
      versionData.external_file_url = externalFileUrl;
    }

    const versionResponse = await fetch(createVersionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(versionData),
    });

    if (!versionResponse.ok) {
      const error = await versionResponse.json();
      // Try to clean up the uploaded file using REST API (only for uploaded files)
      if (!externalProvider && videoFile) {
        const fileExtension = videoFile.name.split('.').pop();
        const storageFileName = `v${nextVersion}_${Date.now()}.${fileExtension}`;
        const filePath = `${projectId}/${storageFileName}`;
        const deleteUrl = `${supabaseUrl}/storage/v1/object/videos/${filePath}`;
        await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        });
      }
      return NextResponse.json(
        { error: 'Failed to create version record: ' + (error.message || 'Unknown error') },
        { status: 500 }
      );
    }

    const versions = await versionResponse.json();
    const videoVersion = versions[0]; // Supabase returns array with Prefer header

    return NextResponse.json(videoVersion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Extract access token from cookie
    const cookieHeader = request.headers.get('cookie') ?? '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
    
    if (!authCookie) {
      return NextResponse.json({ error: 'No authentication cookie found' }, { status: 401 });
    }

    // Extract cookie value
    const [, cookieValue] = authCookie.split('=');
    let accessToken: string;
    let userId: string;

    try {
      const decodedValue = decodeURIComponent(cookieValue);
      const cookieData = JSON.parse(decodedValue);
      accessToken = cookieData.access_token;
      userId = cookieData.user?.id;

      if (!accessToken || !userId) {
        throw new Error('Invalid token or user ID');
      }
    } catch (parseError: any) {
      return NextResponse.json({ error: 'Invalid authentication cookie' }, { status: 401 });
    }

    // Verify project ownership using REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectCheckUrl = `${supabaseUrl}/rest/v1/projects?id=eq.${projectId}&owner_id=eq.${userId}&select=id,owner_id`;
    
    const projectCheckResponse = await fetch(projectCheckUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!projectCheckResponse.ok) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const projects = await projectCheckResponse.json();
    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get all video versions using REST API
    const versionsUrl = `${supabaseUrl}/rest/v1/video_versions?project_id=eq.${projectId}&order=version_number.desc`;
    
    const versionsResponse = await fetch(versionsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!versionsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video versions' },
        { status: 500 }
      );
    }

    const versions = await versionsResponse.json();
    return NextResponse.json(versions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

