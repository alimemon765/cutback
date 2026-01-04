'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Share2, Video, Clock, FileVideo, Loader2, MessageSquare } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import VideoUpload from '@/components/projects/VideoUpload';
import Link from 'next/link';
import type { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type VideoVersion = Database['public']['Tables']['video_versions']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [videoVersions, setVideoVersions] = useState<VideoVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  const loadProjectData = async () => {
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

      // Get video versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('video_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false });

      if (versionsError) {
        console.error('Error loading video versions:', versionsError);
      } else {
        setVideoVersions(versionsData || []);
        
        // Get comments for active version
        const activeVer = versionsData?.find(v => v.is_active);
        if (activeVer) {
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('video_version_id', activeVer.id)
            .order('timestamp', { ascending: true });
          
          if (!commentsError && commentsData) {
            setComments(commentsData);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId, router]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Project not found'}</p>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="sharp">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const activeVersion = videoVersions.find(v => v.is_active);

  const handleCommentStatusChange = async (commentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update comment status');
      }

      // Reload project data to refresh comments
      await loadProjectData();
    } catch (err) {
      console.error('Error updating comment status:', err);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="sharp">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="editorial-title text-3xl text-foreground">{project.name}</h1>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/project/${projectId}/share`}>
                  <Button variant="outline" className="gap-2 sharp">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </Link>
                <Button className="gap-2 sharp" onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="w-4 h-4" />
                  Upload Video
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-8 py-12">
          {/* Video Versions Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Video Versions
                </h2>
                <p className="text-sm text-muted-foreground">
                  {videoVersions.length} version{videoVersions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {videoVersions.length === 0 ? (
              <div className="border border-dashed border-border p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-6">
                  <FileVideo className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="editorial-title text-2xl text-foreground mb-2">No videos yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Upload your first video version to start collecting feedback from clients.
                </p>
                <Button className="gap-2 sharp" onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="w-4 h-4" />
                  Upload First Video
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {videoVersions.map((version) => (
                  <div
                    key={version.id}
                    className={`border p-6 transition-colors ${
                      version.is_active
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 border border-border flex items-center justify-center flex-shrink-0">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">
                              Version {version.version_number}
                            </h3>
                            {version.is_active && (
                              <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {version.file_name}
                          </p>
                          <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(version.created_at).toLocaleDateString()}
                            </span>
                            {version.file_size && (
                              <span>
                                {(version.file_size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                            {version.duration && (
                              <span>
                                {Math.floor(version.duration / 60)}:{String(Math.floor(version.duration % 60)).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!version.is_active && (
                        <Button variant="outline" size="sm" className="sharp">
                          Set as Active
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          {activeVersion && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Feedback & Comments
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {comments.length} comment{comments.length !== 1 ? 's' : ''} for Version {activeVersion.version_number}
                  </p>
                </div>
                
                {/* Filter Buttons */}
                {comments.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      className="sharp"
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'open' ? 'default' : 'outline'}
                      size="sm"
                      className="sharp"
                      onClick={() => setFilterStatus('open')}
                    >
                      Open
                    </Button>
                    <Button
                      variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                      size="sm"
                      className="sharp"
                      onClick={() => setFilterStatus('in_progress')}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                      size="sm"
                      className="sharp"
                      onClick={() => setFilterStatus('resolved')}
                    >
                      Resolved
                    </Button>
                  </div>
                )}
              </div>

              {comments.length === 0 ? (
                <div className="border border-dashed border-border p-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 border border-border mb-4">
                    <MessageSquare className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No comments yet. Share your project to start receiving feedback.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments
                    .filter(comment => filterStatus === 'all' || comment.status === filterStatus)
                    .map((comment) => (
                      <EditorCommentCard
                        key={comment.id}
                        comment={comment}
                        onStatusChange={async (newStatus) => {
                          await handleCommentStatusChange(comment.id, newStatus);
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Video Upload Modal */}
        <VideoUpload
          projectId={projectId}
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          onSuccess={loadProjectData}
        />
      </div>
    </ProtectedRoute>
  );
}

// Editor Comment Card Component
interface EditorCommentCardProps {
  comment: Comment;
  onStatusChange: (status: string) => void;
}

function EditorCommentCard({ comment, onStatusChange }: EditorCommentCardProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    try {
      await onStatusChange(newStatus);
    } catch (err) {
      // Error is already logged in handleCommentStatusChange
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div className={`border p-4 ${
      comment.status === 'resolved' ? 'border-border bg-secondary/30' : 'border-border bg-card'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground">
            {comment.client_name || 'Anonymous'}
          </span>
          <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-secondary text-foreground border border-border">
            {formatTime(comment.timestamp)}
          </span>
          <span className={`px-2 py-0.5 text-xs font-mono uppercase tracking-wider border ${getStatusColor(comment.status)}`}>
            {comment.status.replace('_', ' ')}
          </span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(comment.created_at)}
        </span>
      </div>
      
      <p className="text-sm text-foreground whitespace-pre-wrap mb-4">
        {comment.content}
      </p>

      <div className="flex gap-2">
        {comment.status !== 'in_progress' && (
          <Button
            variant="outline"
            size="sm"
            className="sharp"
            onClick={() => handleStatusChange('in_progress')}
            disabled={isChangingStatus}
          >
            Mark In Progress
          </Button>
        )}
        {comment.status !== 'resolved' && (
          <Button
            variant="outline"
            size="sm"
            className="sharp"
            onClick={() => handleStatusChange('resolved')}
            disabled={isChangingStatus}
          >
            Mark Resolved
          </Button>
        )}
        {comment.status !== 'open' && (
          <Button
            variant="outline"
            size="sm"
            className="sharp"
            onClick={() => handleStatusChange('open')}
            disabled={isChangingStatus}
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}

