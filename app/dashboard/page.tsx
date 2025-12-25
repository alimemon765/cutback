import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your video projects and collaborate with your team.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Projects
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have any projects yet. Create your first project to get started!
          </p>
          <Button>
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}

