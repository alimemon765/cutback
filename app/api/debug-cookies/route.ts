import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const allHeaders = Object.fromEntries(request.headers.entries());
  
  // Parse cookies
  const cookies = cookieHeader
    ? cookieHeader.split(';').map(c => {
        const [name, ...rest] = c.trim().split('=');
        return {
          name: name.trim(),
          value: rest.join('=').substring(0, 50) + (rest.join('=').length > 50 ? '...' : ''),
          fullLength: rest.join('=').length,
        };
      })
    : [];
  
  const sbCookies = cookies.filter(c => c.name.startsWith('sb-'));
  
  return NextResponse.json({
    hasCookie: !!cookieHeader,
    cookieHeader: cookieHeader,
    cookieLength: cookieHeader?.length || 0,
    allCookies: cookies.map(c => c.name),
    supabaseCookies: sbCookies.map(c => ({
      name: c.name,
      valueLength: c.fullLength,
      preview: c.value,
    })),
    cookieCount: cookies.length,
    sbCookieCount: sbCookies.length,
    allHeaders: {
      'user-agent': allHeaders['user-agent'],
      'origin': allHeaders['origin'],
      'referer': allHeaders['referer'],
    },
  });
}

