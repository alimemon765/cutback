'use client';

import { MessageSquare, Clock } from 'lucide-react';
import type { Database } from '@/types/database';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentsListProps {
  comments: Comment[];
  onCommentClick?: (timestamp: number) => void;
}

export default function CommentsList({ comments, onCommentClick }: CommentsListProps) {
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

  if (comments.length === 0) {
    return (
      <div className="border border-dashed border-border p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 border border-border mb-4">
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          No comments yet. Be the first to add feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border border-border p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
          onClick={() => onCommentClick && onCommentClick(comment.timestamp)}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {comment.client_name || 'Anonymous'}
              </span>
              <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                {formatTime(comment.timestamp)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
          {comment.status !== 'open' && (
            <div className="mt-2">
              <span className={`px-2 py-0.5 text-xs font-mono uppercase tracking-wider border ${
                comment.status === 'resolved'
                  ? 'bg-green-500/20 text-green-600 border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
              }`}>
                {comment.status}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

