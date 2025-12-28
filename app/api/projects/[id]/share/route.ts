import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract access token from cookie
    const cookieHeader = request.headers.get('cookie') ?? '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
    
    if (!authCookie) {
      return NextResponse.json(
        { error: 'No authentication cookie found' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'Invalid authentication cookie' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Verify project ownership using REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectResponse = await fetch(
      `${supabaseUrl}/rest/v1/projects?id=eq.${projectId}&owner_id=eq.${userId}&select=id,owner_id,name`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!projectResponse.ok) {
      if (projectResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
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
      expiresAt = expiresAt.toISOString();
    }

    // Create review link using REST API
    const linkResponse = await fetch(
      `${supabaseUrl}/rest/v1/review_links`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          project_id: projectId,
          password_hash: passwordHash,
          expires_at: expiresAt,
          created_by: userId,
        }),
      }
    );

    if (!linkResponse.ok) {
      const error = await linkResponse.json();
      console.error('Error creating review link:', error);
      
      if (linkResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }

    const reviewLinks = await linkResponse.json();
    const reviewLink = reviewLinks[0]; // Supabase returns array with Prefer header

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
  } catch (error: any) {
    console.error('Unexpected error:', error);
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
    // Extract access token from cookie
    const cookieHeader = request.headers.get('cookie') ?? '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
    
    if (!authCookie) {
      return NextResponse.json(
        { error: 'No authentication cookie found' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'Invalid authentication cookie' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Verify project ownership using REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectResponse = await fetch(
      `${supabaseUrl}/rest/v1/projects?id=eq.${projectId}&owner_id=eq.${userId}&select=id,owner_id`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!projectResponse.ok) {
      if (projectResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
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

    // Get all review links for this project using REST API
    const linksResponse = await fetch(
      `${supabaseUrl}/rest/v1/review_links?project_id=eq.${projectId}&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!linksResponse.ok) {
      console.error('Error fetching review links:', linksResponse.statusText);
      
      if (linksResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch share links' },
        { status: 500 }
      );
    }

    const reviewLinks = await linksResponse.json();

    // Add full URLs to each link
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const linksWithUrls = reviewLinks.map((link: any) => ({
      ...link,
      share_url: `${baseUrl}/review/${link.token}`,
    }));

    return NextResponse.json(linksWithUrls);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract access token from cookie
    const cookieHeader = request.headers.get('cookie') ?? '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
    
    if (!authCookie) {
      return NextResponse.json(
        { error: 'No authentication cookie found' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'Invalid authentication cookie' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Verify project ownership using REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectResponse = await fetch(
      `${supabaseUrl}/rest/v1/projects?id=eq.${projectId}&owner_id=eq.${userId}&select=id,owner_id`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!projectResponse.ok) {
      if (projectResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
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
    const { linkId, isActive } = body;

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Update link status using REST API
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/review_links?id=eq.${linkId}&project_id=eq.${projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          is_active: isActive,
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('Error updating review link:', error);
      
      if (updateResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update share link' },
        { status: 500 }
      );
    }

    const updatedLinks = await updateResponse.json();
    const updatedLink = updatedLinks[0]; // Supabase returns array with Prefer header

    return NextResponse.json(updatedLink);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
