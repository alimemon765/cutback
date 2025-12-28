'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🔵 [LOGIN FORM] Form submitted');
    setError(null);
    
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      // Login with client directly - this will set cookies properly
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔵 [LOGIN FORM] Auth result:', { 
        hasSession: !!data.session, 
        hasError: !!authError 
      });

      if (authError) {
        console.error('❌ [LOGIN FORM] Error:', authError.message);
        setError(authError.message);
        return;
      }

      if (data.session) {
        console.log('✅ [LOGIN FORM] Login successful!');
        console.log('🔐 [LOGIN FORM] Session:', {
          hasSession: !!data.session,
          hasUser: !!data.user,
          userId: data.user?.id,
          userEmail: data.user?.email,
        });
        
        // Check cookies after login
        const allCookies = document.cookie;
        console.log('🍪 [LOGIN FORM] All cookies:', allCookies);
        
        // Check for Supabase cookies specifically
        const hasSupabaseCookie = allCookies.includes('sb-');
        console.log('🍪 [LOGIN FORM] Has Supabase cookie:', hasSupabaseCookie);
        
        if (hasSupabaseCookie) {
          const sbCookies = allCookies.split(';').filter(c => c.trim().startsWith('sb-'));
          console.log('🍪 [LOGIN FORM] Supabase cookies found:', sbCookies.length);
          sbCookies.forEach(cookie => {
            const [name] = cookie.trim().split('=');
            console.log(`🍪 [LOGIN FORM] Cookie: ${name}`);
          });
        } else {
          console.warn('⚠️ [LOGIN FORM] WARNING: No Supabase cookies found after login!');
        }
        
        console.log('🚀 [LOGIN FORM] Redirecting to dashboard...');
        
        // Small delay to ensure cookies are set
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="sharp bg-background border-border"
              placeholder="Email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="sharp bg-background border-border"
              placeholder="Password"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full sharp"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  );
}
