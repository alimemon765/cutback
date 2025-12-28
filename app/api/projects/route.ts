import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

      if (!accessToken) {
        throw new Error('No access token in cookie');
      }
    } catch (parseError: any) {
      return NextResponse.json(
        { error: 'Invalid authentication cookie' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Make direct REST API call to Supabase with Authorization header
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiUrl = `${supabaseUrl}/rest/v1/projects`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`, // This sets the database session!
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name: name.trim(),
        description: description?.trim() || null,
        owner_id: userId, // Explicitly set owner_id
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
      throw new Error(error.message || 'Failed to create project');
    }

    const projects = await response.json();
    const project = projects[0]; // Supabase returns array with Prefer header

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    // Make REST API call to fetch projects
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiUrl = `${supabaseUrl}/rest/v1/projects?owner_id=eq.${userId}&is_archived=eq.false&order=created_at.desc`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      throw new Error('Failed to fetch projects');
    }

    const projects = await response.json();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

