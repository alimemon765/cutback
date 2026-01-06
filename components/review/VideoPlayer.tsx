'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  onAddComment?: (timestamp: number) => void;
  commentTimestamps?: number[];
}

export default function VideoPlayer({
  videoUrl,
  onAddComment,
  commentTimestamps = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Check if this is a Google Drive preview URL (needs iframe) - define early
  const isGoogleDrivePreview = videoUrl.includes('drive.google.com/file/d/') && videoUrl.includes('/preview');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isGoogleDrivePreview) return; // Skip for Google Drive iframe

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      if (!isNaN(time) && time >= 0) {
        setCurrentTime(time);
      }
    };

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isGoogleDrivePreview]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleAddComment = () => {
    if (onAddComment) {
      // For Google Drive iframe, we can't get current time due to CORS restrictions
      // For native video, always get the actual current time directly from the video element
      let timestamp = 0;
      
      if (!isGoogleDrivePreview && videoRef.current) {
        // Get current time directly from video element (most accurate)
        const videoTime = videoRef.current.currentTime;
        timestamp = videoTime || 0;
        
        // Ensure it's a valid number
        if (isNaN(timestamp) || timestamp < 0) {
          timestamp = 0;
        }
        
        console.log('[VideoPlayer] Captured timestamp:', timestamp, 'from video element');
      } else {
        console.log('[VideoPlayer] Google Drive video or no video ref - timestamp will be 0');
      }
      
      // For Google Drive, timestamp will be 0 and user can manually adjust
      onAddComment(timestamp);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const jumpToTimestamp = (timestamp: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = timestamp;
  };
  
  return (
    <div className="relative bg-black group">
      {/* Video Element */}
      {isGoogleDrivePreview ? (
        // Google Drive preview requires iframe
        <iframe
          src={videoUrl}
          className="w-full aspect-video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onClick={togglePlay}
          controls={false}
        />
      )}

      {/* Add Comment Button - Show for both native video and Google Drive */}
      {onAddComment && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={handleAddComment}
            size="sm"
            className="sharp bg-primary hover:bg-primary/90"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            Add Comment
          </Button>
        </div>
      )}

      {/* Controls Overlay - Only show for native video, not iframe */}
      {!isGoogleDrivePreview && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="relative w-full h-2 bg-white/20 cursor-pointer mb-4 rounded-full overflow-hidden"
          onClick={handleProgressClick}
        >
          {/* Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-primary"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Comment Markers */}
          {commentTimestamps.map((timestamp, index) => (
            <div
              key={index}
              className="absolute top-0 w-1 h-full bg-yellow-400 cursor-pointer hover:w-2 transition-all"
              style={{ left: `${(timestamp / duration) * 100}%` }}
              onClick={(e) => {
                e.stopPropagation();
                jumpToTimestamp(timestamp);
              }}
              title={`Comment at ${formatTime(timestamp)}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-primary transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

