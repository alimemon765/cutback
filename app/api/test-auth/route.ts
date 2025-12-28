import { createAPIClient } from '@/lib/supabase/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  
  console.log('\n=== TEST AUTH ENDPOINT ===');
  console.log('Cookie header length:', cookieHeader.length);
  console.log('Cookie header preview:', cookieHeader.substring(0, 100));
  
  // Parse cookies manually
  const cookies = cookieHeader
    .split(';')
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => {
      const [name, ...rest] = c.split('=');
      return { name: name.trim(), value: rest.join('=') };
    });
  
  console.log('Parsed cookies:', cookies.length);
  const sbCookies = cookies.filter(c => c.name.startsWith('sb-'));
  console.log('Supabase cookies:', sbCookies.length);
  
  sbCookies.forEach(cookie => {
    console.log(`\nCookie: ${cookie.name}`);
    console.log(`Value length: ${cookie.value.length}`);
    console.log(`First 100 chars: ${cookie.value.substring(0, 100)}`);
  });
  
  const supabase = createAPIClient(request);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('User:', user?.email || 'No user');
  console.log('Error:', error?.message || 'No error');
  console.log('=== END TEST ===\n');
  
  return NextResponse.json({
    cookieHeaderLength: cookieHeader.length,
    cookiesFound: cookies.length,
    supabaseCookies: sbCookies.length,
    cookieNames: sbCookies.map(c => c.name),
    user: user?.email || null,
    error: error?.message || null,
  });
}

