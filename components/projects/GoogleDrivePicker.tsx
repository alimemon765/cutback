'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, FileVideo, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  webViewLink?: string;
}

interface GoogleDrivePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: DriveFile) => void;
}

export default function GoogleDrivePicker({
  open,
  onOpenChange,
  onSelect,
}: GoogleDrivePickerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Check if user is connected to Google
  useEffect(() => {
    if (open) {
      checkConnection();
    }
  }, [open]);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Check if we have Google token by trying to fetch files
      const response = await fetch('/api/drive/files?q=');
      if (response.ok) {
        setIsConnected(true);
        loadFiles();
      } else if (response.status === 401) {
        setIsConnected(false);
      } else {
        setError('Failed to check Google connection');
      }
    } catch (err) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const connectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const loadFiles = async (query: string = '', pageToken?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL('/api/drive/files', window.location.origin);
      if (query) {
        url.searchParams.set('q', query);
      }
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 401) {
          setIsConnected(false);
          setError('Google authentication expired. Please reconnect.');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load files');
      }

      const data = await response.json();
      setFiles(pageToken ? [...files, ...(data.files || [])] : data.files || []);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  const handleSelect = (file: DriveFile) => {
    onSelect(file);
    onOpenChange(false);
    // Reset state
    setFiles([]);
    setSearchQuery('');
    setError(null);
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="editorial-title text-2xl">Select from Google Drive</DialogTitle>
          <DialogDescription>
            Choose a video file from your Google Drive
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !isConnected ? (
          <div className="py-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-4">
              <ExternalLink className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Connect Google Drive</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Connect your Google account to browse and select videos from Google Drive.
            </p>
            <Button onClick={connectGoogle} className="sharp">
              Connect Google Account
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sharp"
              />
              <Button type="submit" variant="outline" className="sharp" disabled={isLoading}>
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Files List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {isLoading && files.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No video files found</p>
                </div>
              ) : (
                files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file)}
                    className="w-full border border-border p-4 text-left hover:bg-secondary/50 transition-colors rounded-md"
                  >
                    <div className="flex items-start gap-4">
                      {file.thumbnailLink ? (
                        <img
                          src={file.thumbnailLink}
                          alt={file.name}
                          className="w-16 h-12 object-cover border border-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-12 border border-border flex items-center justify-center flex-shrink-0">
                          <FileVideo className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate mb-1">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {file.size && <span>{formatFileSize(file.size)}</span>}
                          {file.modifiedTime && (
                            <span>Modified {formatDate(file.modifiedTime)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Load More */}
            {nextPageToken && (
              <Button
                variant="outline"
                onClick={() => loadFiles(searchQuery, nextPageToken)}
                disabled={isLoading}
                className="sharp w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

