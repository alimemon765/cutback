'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🔵 [SIGNUP FORM] Form submitted');
    setError(null);
    
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const fullName = formData.get('fullName') as string;
      
      // Signup with client directly - this will set cookies properly
      const supabase = createClient();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/63acc359-d200-4cf4-abe5-60688b560998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/auth/SignupForm.tsx:28',message:'Before signup call',data:{hasSupabaseClient:!!supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      console.log('🔵 [SIGNUP FORM] Auth result:', { 
        hasUser: !!data.user,
        hasSession: !!data.session, 
        hasError: !!authError 
      });

      if (authError) {
        console.error('❌ [SIGNUP FORM] Error:', authError.message);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/63acc359-d200-4cf4-abe5-60688b560998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/auth/SignupForm.tsx:45',message:'Auth error occurred',data:{errorMessage:authError.message,errorStatus:authError.status,errorCode:authError.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setError(authError.message);
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('📧 [SIGNUP FORM] Email confirmation required');
        setError('Please check your email to confirm your account before signing in.');
        return;
      }

      if (data.session) {
        console.log('✅ [SIGNUP FORM] Signup successful!');
        console.log('🚀 [SIGNUP FORM] Redirecting to dashboard...');
        window.location.href = '/dashboard';
      }
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Full name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className="sharp bg-background border-border"
              placeholder="Full name"
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={6}
              className="sharp bg-background border-border"
              placeholder="Password (min 6 characters)"
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </div>
  );
}
