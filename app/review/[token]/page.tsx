'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import VideoPlayer from '@/components/review/VideoPlayer';
import CommentsList from '@/components/review/CommentsList';
import AddCommentForm from '@/components/review/AddCommentForm';
import PasswordModal from '@/components/review/PasswordModal';
import type { Database } from '@/types/database';

type Comment = Database['public']['Tables']['comments']['Row'];
type VideoVersion = Database['public']['Tables']['video_versions']['Row'] & {
  signed_url?: string;
};

interface ProjectData {
  id: string;
  name: string;
}

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [videoVersion, setVideoVersion] = useState<VideoVersion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [clientName, setClientName] = useState<string>('');
  
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentTimestamp, setCommentTimestamp] = useState(0);

  const verifyToken = async (password?: string) => {
    try {
      const response = await fetch(`/api/review/${token}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setIsLoading(false);
          return false;
        }
        throw new Error(data.error || 'Failed to verify link');
      }

      setProject(data.project);
      setVideoVersion(data.videoVersion);
      setIsPasswordVerified(true);
      setRequiresPassword(false);
      
      // Load comments
      await loadComments();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error verifying token:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
      setIsLoading(false);
      return false;
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/review/${token}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  useEffect(() => {
    verifyToken();
    
    // Load saved client name
    const savedName = localStorage.getItem('cutback_client_name');
    if (savedName) {
      setClientName(savedName);
    }
  }, [token]);

  const handlePasswordSubmit = async (password: string) => {
    return await verifyToken(password);
  };

  const handleAddComment = (timestamp: number) => {
    setCommentTimestamp(timestamp);
    setShowCommentForm(true);
  };

  const handleSubmitComment = async (data: {
    clientName: string;
    content: string;
    timestamp: number;
  }) => {
    try {
      const response = await fetch(`/api/review/${token}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      // Save client name for future comments
      setClientName(data.clientName);
      
      // Reload comments
      await loadComments();
      
      // Close form
      setShowCommentForm(false);
    } catch (err) {
      console.error('Error submitting comment:', err);
      throw err;
    }
  };

  const handleCommentClick = (timestamp: number) => {
    // This will be handled by the video player
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = timestamp;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requiresPassword && !isPasswordVerified) {
    return (
      <div className="min-h-screen bg-background">
        <PasswordModal open={true} onSubmit={handlePasswordSubmit} />
      </div>
    );
  }

  if (error || !project || !videoVersion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="editorial-title text-3xl text-foreground mb-4">
            {error ? 'Error' : 'Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || 'This review link is invalid or has expired.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact the project owner for a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="editorial-title text-3xl text-foreground mb-1">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Video Review - Version {videoVersion.version_number}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Video
              </h2>
              {videoVersion.signed_url && (
                <VideoPlayer
                  videoUrl={videoVersion.signed_url}
                  onAddComment={handleAddComment}
                  commentTimestamps={comments.map(c => c.timestamp)}
                />
              )}
            </div>

            {/* Add Comment Form */}
            {showCommentForm && (
              <div className="mb-6">
                <AddCommentForm
                  timestamp={commentTimestamp}
                  onSubmit={handleSubmitComment}
                  onCancel={() => setShowCommentForm(false)}
                  existingClientName={clientName}
                />
              </div>
            )}
          </div>

          {/* Comments Sidebar - Takes 1 column */}
          <div>
            <div className="sticky top-8">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Comments ({comments.length})
              </h2>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <CommentsList
                  comments={comments}
                  onCommentClick={handleCommentClick}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

