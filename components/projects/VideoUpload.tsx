'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileVideo, Loader2, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import GoogleDrivePicker from './GoogleDrivePicker';

interface VideoUploadProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type UploadSource = 'upload' | 'drive';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

export default function VideoUpload({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: VideoUploadProps) {
  const [uploadSource, setUploadSource] = useState<UploadSource>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDriveFile, setSelectedDriveFile] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload MP4, WebM, QuickTime, or AVI files.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 500MB.';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (uploadSource === 'upload' && !selectedFile) return;
    if (uploadSource === 'drive' && !selectedDriveFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (uploadSource === 'upload') {
        // Handle file upload
        const formData = new FormData();
        formData.append('video', selectedFile!);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            console.log('Upload successful');
            setSelectedFile(null);
            onOpenChange(false);
            if (onSuccess) {
              onSuccess();
            }
          } else {
            const response = JSON.parse(xhr.responseText);
            setError(response.error || 'Upload failed');
          }
          setIsUploading(false);
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          setError('Upload failed. Please try again.');
          setIsUploading(false);
        });

        xhr.open('POST', `/api/projects/${projectId}/videos`);
        xhr.send(formData);
      } else {
        // Handle Google Drive file
        const response = await fetch(`/api/projects/${projectId}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            external_provider: 'google_drive',
            external_file_id: selectedDriveFile.id,
            external_file_url: selectedDriveFile.webViewLink,
            file_name: selectedDriveFile.name,
            file_size: selectedDriveFile.size ? parseInt(selectedDriveFile.size) : null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Failed to add Drive video');
          setIsUploading(false);
          return;
        }

        setSelectedDriveFile(null);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
        setIsUploading(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setSelectedDriveFile(null);
      setError(null);
      setUploadProgress(0);
      setUploadSource('upload');
      onOpenChange(false);
    }
  };

  const handleDriveSelect = (file: any) => {
    setSelectedDriveFile(file);
    setShowDrivePicker(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="editorial-title text-2xl">Upload Video</DialogTitle>
          <DialogDescription>
            Upload a new version of your video. Maximum file size: 500MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Selection */}
          {!selectedFile && !selectedDriveFile && (
            <div className="flex gap-2 border-b border-border pb-4">
              <Button
                type="button"
                variant={uploadSource === 'upload' ? 'default' : 'outline'}
                onClick={() => setUploadSource('upload')}
                className="sharp flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                type="button"
                variant={uploadSource === 'drive' ? 'default' : 'outline'}
                onClick={() => setUploadSource('drive')}
                className="sharp flex-1"
              >
                <Cloud className="w-4 h-4 mr-2" />
                Google Drive
              </Button>
            </div>
          )}

          {uploadSource === 'upload' && !selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-md p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-4">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Drop your video here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button
                type="button"
                variant="outline"
                className="sharp"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: MP4, WebM, QuickTime, AVI
              </p>
            </div>
          ) : uploadSource === 'drive' && !selectedDriveFile ? (
            <div className="border-2 border-dashed border-border rounded-md p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-4">
                <Cloud className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Select from Google Drive
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse and select a video from your Google Drive
              </p>
              <Button
                type="button"
                variant="outline"
                className="sharp"
                onClick={() => setShowDrivePicker(true)}
              >
                Browse Drive
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {selectedDriveFile?.thumbnailLink ? (
                    <img
                      src={selectedDriveFile.thumbnailLink}
                      alt={selectedDriveFile.name}
                      className="w-12 h-12 object-cover border border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 border border-border flex items-center justify-center flex-shrink-0">
                      <FileVideo className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {selectedFile?.name || selectedDriveFile?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                        : selectedDriveFile?.size
                        ? `${(parseInt(selectedDriveFile.size) / 1024 / 1024).toFixed(2)} MB`
                        : 'Size unknown'}
                      {selectedDriveFile && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary border border-primary/30">
                          Google Drive
                        </span>
                      )}
                    </p>
                    {isUploading && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            Uploading...
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setSelectedDriveFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="sharp"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={(!selectedFile && !selectedDriveFile) || isUploading}
              className="sharp"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Google Drive Picker */}
        <GoogleDrivePicker
          open={showDrivePicker}
          onOpenChange={setShowDrivePicker}
          onSelect={handleDriveSelect}
        />
      </DialogContent>
    </Dialog>
  );
}

