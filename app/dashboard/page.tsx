'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Video, Clock, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('🏠 [DASHBOARD] Loading data...');
      const supabase = createClient();

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🏠 [DASHBOARD] User:', user?.email);

      if (user) {
        // Get projects
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        setProjects(projectsData || []);
        console.log('🏠 [DASHBOARD] Loaded', projectsData?.length || 0, 'projects');
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="editorial-title text-3xl text-foreground">CutBack</h1>
            </div>
            
            <Button className="gap-2 sharp">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-8 py-12">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Your Projects
              </h2>
              <p className="text-sm text-muted-foreground">
                {projects.length} active project{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="border border-dashed border-border p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-6">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="editorial-title text-2xl text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first project to start collecting feedback on your video edits.
              </p>
              <Button className="gap-2 sharp">
                <Plus className="w-4 h-4" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative bg-card hover:bg-secondary/50 transition-colors"
                >
                  {/* Index Number */}
                  <span className="absolute top-4 left-4 index-number z-10">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Thumbnail */}
                  <div className="aspect-video relative overflow-hidden">
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Video className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 border-t border-border">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="editorial-title text-xl text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
