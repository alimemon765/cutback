'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 [PROTECTED] Checking authentication...');
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      console.log('🔐 [PROTECTED] Session check:', {
        hasSession: !!session,
        hasError: !!error,
        userId: session?.user?.id,
      });

      if (!session) {
        console.log('❌ [PROTECTED] No session, redirecting to login');
        router.push('/login');
      } else {
        console.log('✅ [PROTECTED] Authenticated, rendering page');
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

