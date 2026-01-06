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
  const [manualMinutes, setManualMinutes] = useState<number | ''>('');
  const [manualSeconds, setManualSeconds] = useState<number | ''>('');
  const [useManualTimestamp, setUseManualTimestamp] = useState(false);

  useEffect(() => {
    // Load client name from localStorage if available
    const savedName = localStorage.getItem('cutback_client_name');
    if (savedName && !existingClientName) {
      setClientName(savedName);
    }
    // Update timestamp when prop changes (only if not using manual override)
    if (!useManualTimestamp) {
      setCommentTimestamp(timestamp);
      // Update manual inputs to match automatic timestamp
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      setManualMinutes(minutes);
      setManualSeconds(seconds);
    }
  }, [existingClientName, timestamp, useManualTimestamp]);
  
  // Calculate final timestamp: manual if provided, otherwise automatic
  const finalTimestamp = useManualTimestamp && manualMinutes !== '' && manualSeconds !== ''
    ? (Number(manualMinutes) * 60) + Number(manualSeconds)
    : commentTimestamp;

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
        timestamp: finalTimestamp,
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
        {/* Timestamp Section */}
        <div className="grid gap-3 mb-4 p-4 border border-border rounded-md bg-secondary/30">
          <div className="flex items-center justify-between">
            <Label className="font-mono text-xs uppercase tracking-wider">
              Timestamp
            </Label>
            <span className="px-2 py-1 text-sm font-mono bg-primary/20 text-primary border border-primary/30 rounded">
              {formatTime(finalTimestamp)}
            </span>
          </div>
          
          {/* Automatic Timestamp Display */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24">Auto-captured:</span>
            <span className="px-2 py-1 text-sm font-mono bg-background border border-border rounded">
              {formatTime(commentTimestamp)}
            </span>
            {commentTimestamp === 0 && (
              <span className="text-xs text-muted-foreground italic">
                (Click &quot;Add Comment&quot; while video is playing)
              </span>
            )}
          </div>

          {/* Manual Override */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground w-24">Manual override:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  value={manualMinutes}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0);
                    setManualMinutes(val);
                    setUseManualTimestamp(val !== '' || manualSeconds !== '');
                  }}
                  placeholder="MM"
                  className="sharp font-mono w-16 text-center"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-muted-foreground">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={manualSeconds}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
                    setManualSeconds(val);
                    setUseManualTimestamp(val !== '' || manualMinutes !== '');
                  }}
                  placeholder="SS"
                  className="sharp font-mono w-16 text-center"
                  disabled={isSubmitting}
                />
              </div>
              {(manualMinutes !== '' || manualSeconds !== '') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setManualMinutes('');
                    setManualSeconds('');
                    setUseManualTimestamp(false);
                  }}
                  className="text-xs h-7"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {useManualTimestamp && (
            <div className="text-xs text-primary">
              ✓ Using manual timestamp: {formatTime(finalTimestamp)}
            </div>
          )}
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

