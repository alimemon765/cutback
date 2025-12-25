import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-2xl">
        <h1 className="editorial-title text-6xl font-bold mb-6 text-foreground">CutBack</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The go-to video feedback and approval tool for solo editors and small creative teams
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="sharp">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="sharp">Sign In</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
