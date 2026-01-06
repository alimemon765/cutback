'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';

interface AddCommentFormProps {
  timestamp: number;
  onSubmit: (data: { clientName: string; content: string; timestamp: number }) => Promise<void>;
  onCancel: () => void;
  existingClientName?: string;
}

export default function AddCommentForm({
  timestamp,
  onSubmit,
  onCancel,
  existingClientName,
}: AddCommentFormProps) {
  const [clientName, setClientName] = useState(existingClientName || '');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentTimestamp, setCommentTimestamp] = useState(timestamp);

  useEffect(() => {
    // Load client name from localStorage if available
    const savedName = localStorage.getItem('cutback_client_name');
    if (savedName && !existingClientName) {
      setClientName(savedName);
    }
    // Update timestamp when prop changes
    setCommentTimestamp(timestamp);
  }, [existingClientName, timestamp]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Save client name to localStorage
      if (clientName.trim()) {
        localStorage.setItem('cutback_client_name', clientName.trim());
      }

      await onSubmit({
        clientName: clientName.trim(),
        content: content.trim(),
        timestamp: commentTimestamp,
      });

      // Reset form
      setContent('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-primary bg-primary/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Add Comment</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Timestamp:</span>
          <span className="px-2 py-1 text-sm font-mono bg-primary/20 text-primary border border-primary/30">
            {formatTime(commentTimestamp)}
          </span>
          {commentTimestamp === 0 && (
            <span className="text-xs text-muted-foreground">
              (Click video to set timestamp, or edit manually)
            </span>
          )}
        </div>
        
        {/* Manual timestamp editor - only show if timestamp is 0 or user wants to adjust */}
        <div className="grid gap-2 mb-4">
          <Label htmlFor="timestamp" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Adjust Timestamp (Optional - MM:SS format)
          </Label>
          <Input
            id="timestamp"
            type="text"
            value={formatTime(commentTimestamp)}
            onChange={(e) => {
              // Parse MM:SS format
              const value = e.target.value.trim();
              const match = value.match(/^(\d+):(\d{2})$/);
              if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const totalSeconds = minutes * 60 + seconds;
                setCommentTimestamp(totalSeconds);
              } else if (value === '' || value === '0:00') {
                setCommentTimestamp(0);
              }
            }}
            placeholder="0:00"
            className="sharp font-mono w-32"
            disabled={isSubmitting}
          />
          <span className="text-xs text-muted-foreground">
            Format: MM:SS (e.g., 1:23 for 1 minute 23 seconds)
          </span>
        </div>

        {!existingClientName && (
          <div className="grid gap-2">
            <Label htmlFor="clientName" className="font-mono text-xs uppercase tracking-wider">
              Your Name *
            </Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter your name"
              required
              className="sharp"
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="content" className="font-mono text-xs uppercase tracking-wider">
            Comment *
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your feedback here..."
            required
            rows={4}
            className="sharp"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="sharp flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim() || !clientName.trim()}
            className="sharp flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Comment'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

