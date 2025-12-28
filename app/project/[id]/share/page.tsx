'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, Link2, Loader2, Check, X } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import type { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type ReviewLink = Database['public']['Tables']['review_links']['Row'] & {
  share_url?: string;
};

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [reviewLinks, setReviewLinks] = useState<ReviewLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Form state
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState<number>(7);

  const loadData = async () => {
    const supabase = createClient();

    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('owner_id', user.id)
        .single();

      if (projectError) {
        console.error('Error loading project:', projectError);
        setError('Project not found or access denied');
        setIsLoading(false);
        return;
      }

      setProject(projectData);

      // Get review links
      const response = await fetch(`/api/projects/${projectId}/share`);
      if (response.ok) {
        const links = await response.json();
        setReviewLinks(links);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, router]);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.trim() || null,
          expiresIn: expiresIn > 0 ? expiresIn : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate link');
      }

      // Reset form
      setPassword('');
      setExpiresIn(7);

      // Reload links
      await loadData();
    } catch (err) {
      console.error('Error generating link:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async (link: ReviewLink) => {
    if (link.share_url) {
      await navigator.clipboard.writeText(link.share_url);
      setCopiedLinkId(link.id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    }
  };

  const handleToggleActive = async (link: ReviewLink) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId: link.id,
          isActive: !link.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update link');
      }

      // Reload links
      await loadData();
    } catch (err) {
      console.error('Error toggling link:', err);
      setError(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="sharp">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const activeLink = reviewLinks.find(link => link.is_active);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="flex items-center gap-4 mb-2">
              <Link href={`/project/${projectId}`}>
                <Button variant="outline" size="sm" className="sharp">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="editorial-title text-3xl text-foreground">Share Project</h1>
            </div>
            {project && (
              <p className="text-sm text-muted-foreground ml-[88px]">{project.name}</p>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-8 py-12">
          {/* Generate New Link Section */}
          <div className="mb-12">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Generate Share Link
            </h2>
            <div className="border border-border p-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">
                    Password Protection (Optional)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                    className="sharp"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a password to restrict access to this link
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expires" className="font-mono text-xs uppercase tracking-wider">
                    Link Expiration (Days)
                  </Label>
                  <Input
                    id="expires"
                    type="number"
                    min="0"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(parseInt(e.target.value) || 0)}
                    className="sharp"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for no expiration
                  </p>
                </div>

                <Button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="w-full sharp"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Generate New Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Active Link Section */}
          {activeLink && (
            <div className="mb-12">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Active Share Link
              </h2>
              <div className="border border-primary bg-primary/5 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                        Active
                      </span>
                      {activeLink.password_hash && (
                        <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-secondary text-foreground border border-border">
                          Password Protected
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-sm text-foreground break-all mb-2">
                      {activeLink.share_url}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created {new Date(activeLink.created_at).toLocaleDateString()}</span>
                      {activeLink.expires_at && (
                        <span>Expires {new Date(activeLink.expires_at).toLocaleDateString()}</span>
                      )}
                      <span>{activeLink.access_count} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyLink(activeLink)}
                    variant="outline"
                    className="sharp flex-1"
                  >
                    {copiedLinkId === activeLink.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(activeLink)}
                    variant="outline"
                    className="sharp"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Previous Links Section */}
          {reviewLinks.filter(link => !link.is_active).length > 0 && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Previous Links
              </h2>
              <div className="space-y-3">
                {reviewLinks
                  .filter(link => !link.is_active)
                  .map((link) => (
                    <div key={link.id} className="border border-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-secondary text-muted-foreground border border-border">
                              Inactive
                            </span>
                            {link.password_hash && (
                              <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-secondary text-foreground border border-border">
                                Password Protected
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-muted-foreground break-all mb-2">
                            {link.share_url}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                            {link.expires_at && (
                              <span>Expired {new Date(link.expires_at).toLocaleDateString()}</span>
                            )}
                            <span>{link.access_count} views</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleToggleActive(link)}
                          variant="outline"
                          size="sm"
                          className="sharp"
                        >
                          Reactivate
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

