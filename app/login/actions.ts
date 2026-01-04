'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function login(formData: FormData): Promise<{ success: boolean; error?: string }> {
  console.log('🔵 [SERVER ACTION] Login action called');
  
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Type-casting here for convenience
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('🔵 [SERVER ACTION] Attempting login for:', data.email);

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('🔴 [SERVER ACTION] Login error:', error.message);
    return { success: false, error: error.message };
  }

  if (!authData.session) {
    console.error('🔴 [SERVER ACTION] No session in response!');
    return { success: false, error: 'Login failed. No session created.' };
  }

  console.log('✅ [SERVER ACTION] Login successful');
  console.log('✅ [SERVER ACTION] Session created:', !!authData.session);
  console.log('✅ [SERVER ACTION] User ID:', authData.user?.id);
  console.log('✅ [SERVER ACTION] User email:', authData.user?.email);
  
  // Check what cookies exist after login
  const allCookies = cookieStore.getAll();
  console.log('🍪 [SERVER ACTION] Total cookies after login:', allCookies.length);
  const supabaseCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('auth'));
  console.log('🍪 [SERVER ACTION] Supabase cookies:', supabaseCookies.map(c => c.name).join(', '));
  
  // Log cookie details for debugging
  supabaseCookies.forEach(c => {
    console.log(`🍪 [SERVER ACTION] Cookie details: name=${c.name}, value length=${c.value.length}`);
  });

  console.log('✅ [SERVER ACTION] Returning success to client');
  return { success: true };
}

export async function signup(formData: FormData): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> {
  console.log('🔵 [SERVER ACTION] Signup action called');
  
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignore
          }
        },
      },
    }
  );

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('fullName') as string,
      },
    },
  };

  console.log('🔵 [SERVER ACTION] Attempting signup for:', data.email);

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    console.error('🔴 [SERVER ACTION] Signup error:', error.message);
    return { success: false, error: error.message };
  }

  // Check if email confirmation is required
  if (authData.user && !authData.session) {
    console.log('📧 [SERVER ACTION] Email confirmation required');
    return { success: false, needsConfirmation: true };
  }

  if (!authData.session) {
    console.error('🔴 [SERVER ACTION] No session in response!');
    return { success: false, error: 'Signup failed. No session created.' };
  }

  console.log('✅ [SERVER ACTION] Signup successful');
  console.log('✅ [SERVER ACTION] Session created:', !!authData.session);
  console.log('✅ [SERVER ACTION] User ID:', authData.user?.id);

  console.log('✅ [SERVER ACTION] Returning success to client');
  return { success: true };
}

