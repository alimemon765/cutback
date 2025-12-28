import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in API routes.
 * 
 * IMPORTANT: In Next.js App Router API routes, we MUST read cookies from
 * request headers, NOT from cookies() from next/headers. This is because
 * cookies() from next/headers is unreliable for Supabase auth cookies in API routes.
 * 
 * @param request - The Request object from the API route handler
 * @returns A configured Supabase client with proper cookie handling
 */
export function createAPIClient(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';

  // Parse cookies manually - handle values that may contain '=' characters
  const parsedCookies: Array<{ name: string; rawValue: string; decodedValue: string }> = [];
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const trimmed = cookie.trim();
      if (!trimmed) return;
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) return; // Invalid cookie format
      
      const name = trimmed.substring(0, equalIndex).trim();
      const rawValue = trimmed.substring(equalIndex + 1);
      
      parsedCookies.push({
        name,
        rawValue: rawValue,
        decodedValue: decodeURIComponent(rawValue),
      });
    });
  }

  // Debug: Log Supabase cookies
  const sbCookies = parsedCookies.filter(c => c.name.startsWith('sb-'));
  if (sbCookies.length > 0) {
    console.log('[createAPIClient] Found Supabase cookies:', sbCookies.length);
    sbCookies.forEach(cookie => {
      console.log(`[createAPIClient] Cookie: ${cookie.name}`);
      console.log(`[createAPIClient] Raw (encoded) length: ${cookie.rawValue.length}`);
      console.log(`[createAPIClient] Decoded length: ${cookie.decodedValue.length}`);
      
      // Try to parse decoded value as JSON
      try {
        const parsed = JSON.parse(cookie.decodedValue);
        console.log(`[createAPIClient] Decoded value is valid JSON with keys:`, Object.keys(parsed));
      } catch (e) {
        console.log(`[createAPIClient] Decoded value is NOT valid JSON`);
      }
    });
  } else {
    console.log('[createAPIClient] No Supabase cookies found in:', parsedCookies.map(c => c.name));
  }

  // Try both raw and decoded values to see which one works
  // Supabase might expect the cookie exactly as it comes from the browser (URL-encoded)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return cookies in the format that matches NextRequest.cookies.getAll()
          // Use raw (URL-encoded) value - this is how cookies are sent from browser
          const cookies = parsedCookies.map(c => ({
            name: c.name,
            value: c.rawValue, // URL-encoded value as sent from browser
          }));
          
          console.log('[createAPIClient] Returning cookies to Supabase:', cookies.length);
          console.log('[createAPIClient] Cookie names:', cookies.map(c => c.name));
          console.log('[createAPIClient] First cookie value preview:', cookies[0]?.value?.substring(0, 50));
          
          return cookies;
        },
        setAll(cookiesToSet) {
          // Log what Supabase is trying to set (for debugging)
          console.log('[createAPIClient] Supabase trying to set cookies:', cookiesToSet.length);
          // No-op for API routes - we can't set cookies in API route responses
        },
      },
    }
  );
}

