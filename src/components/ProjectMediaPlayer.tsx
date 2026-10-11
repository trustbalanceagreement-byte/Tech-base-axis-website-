import React, { useState } from 'react';
import { Skeleton } from './ui/Skeleton';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Film, 
  Image as ImageIcon,
  Instagram,
  Youtube,
  Video
} from 'lucide-react';

interface ProjectMediaPlayerProps {
  imageUrl?: string;
  videoUrl?: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Extract Instagram Post or Reel ID from various URL formats:
 * - https://www.instagram.com/reel/C7abc123/
 * - https://www.instagram.com/reels/C7abc123/
 * - https://www.instagram.com/share/reel/C7abc123/
 * - https://www.instagram.com/p/C7abc123/?utm_source=...
 * - https://instagr.am/reel/C7abc123/
 */
export function extractInstagramId(url?: string): { id: string; type: 'reel' | 'p' } | null {
  if (!url) return null;
  const clean = url.trim();

  const reelMatch = clean.match(/instagram\.com\/(?:reels?|share\/reel)\/([A-Za-z0-9_-]+)/i) || 
                    clean.match(/instagr\.am\/(?:reels?|share\/reel)\/([A-Za-z0-9_-]+)/i);
  if (reelMatch) return { id: reelMatch[1], type: 'reel' };

  const postMatch = clean.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/i) || 
                    clean.match(/instagr\.am\/p\/([A-Za-z0-9_-]+)/i);
  if (postMatch) return { id: postMatch[1], type: 'p' };

  const tvMatch = clean.match(/instagram\.com\/tv\/([A-Za-z0-9_-]+)/i);
  if (tvMatch) return { id: tvMatch[1], type: 'reel' };

  return null;
}

/**
 * Extract YouTube ID (standard videos, shorts, youtu.be)
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

export const ProjectMediaPlayer: React.FC<ProjectMediaPlayerProps> = ({
  imageUrl,
  videoUrl,
  title = 'Project Media',
  compact = false,
  className = ''
}) => {
  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);
  const hasVideo = Boolean(videoUrl && videoUrl.trim().length > 0);

  // If both exist, default to video; if only one exists, pick that
  const [activeMedia, setActiveMedia] = useState<'video' | 'image'>(
    hasVideo ? 'video' : 'image'
  );

  // Sync activeMedia state whenever props change so it never glitches
  React.useEffect(() => {
    if (hasVideo && !hasImage) {
      setActiveMedia('video');
    } else if (hasImage && !hasVideo) {
      setActiveMedia('image');
    } else if (hasVideo && hasImage) {
      // keep current selection if valid, otherwise prefer video
      setActiveMedia((prev) => (prev ? prev : 'video'));
    }
  }, [hasVideo, hasImage, videoUrl, imageUrl]);

  const instagramData = hasVideo ? extractInstagramId(videoUrl) : null;
  const youTubeId = hasVideo ? extractYouTubeId(videoUrl) : null;
  const isDirectVideo = hasVideo && !instagramData && !youTubeId;

  // Native video player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback notice:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // If neither photo nor video is provided
  if (!hasImage && !hasVideo) {
    return null;
  }

  return (
    <div className={`relative w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/80 group ${className}`}>
      {/* Media Type Switcher (if both image and video are provided) */}
      {hasImage && hasVideo && (
        <div className="absolute top-2.5 left-2.5 z-30 flex items-center bg-black/80 backdrop-blur-md rounded-lg p-0.5 border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveMedia('video')}
            className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMedia === 'video'
                ? 'bg-[#e61e2b] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {instagramData ? (
              <>
                <Instagram className="w-3 h-3 text-pink-400" />
                <span>Reel</span>
              </>
            ) : (
              <>
                <Video className="w-3 h-3" />
                <span>Video</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMedia('image')}
            className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMedia === 'image'
                ? 'bg-[#e61e2b] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Photo</span>
          </button>
        </div>
      )}

      {/* 1. INSTAGRAM REEL / POST MEDIA PLAYER - Responsive & Zero Horizontal Scroll Glitch */}
      {activeMedia === 'video' && instagramData && (
        <div 
          className={`relative w-full overflow-hidden flex items-center justify-center bg-black ${
            compact ? 'h-[400px] sm:h-[460px]' : 'h-[440px] sm:h-[540px]'
          }`}
        >
          {/* Instagram Embed Frame */}
          <iframe
            src={`https://www.instagram.com/${instagramData.type}/${instagramData.id}/embed/`}
            className="w-full h-full border-0 pointer-events-auto max-w-full"
            allowFullScreen
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            title={`${title} - Instagram Reel Player`}
          />
        </div>
      )}

      {/* 2. YOUTUBE VIDEO PLAYER */}
      {activeMedia === 'video' && youTubeId && !instagramData && (
        <div className="relative w-full aspect-video bg-black">
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-red-600/30 text-[10px] font-mono text-red-400 pointer-events-none">
            <Youtube className="w-3 h-3" />
            <span>YouTube HD</span>
          </div>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youTubeId}?rel=0&modestbranding=1&playsinline=1`}
            className="w-full h-full border-0 rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      )}

      {/* 3. DIRECT MP4 / WEBM VIDEO PLAYER - Smooth Controls & Mobile Glitch Free */}
      {activeMedia === 'video' && isDirectVideo && (
        <div 
          onClick={handleTogglePlay}
          className={`relative w-full bg-black cursor-pointer overflow-hidden ${
            compact ? 'aspect-video' : 'aspect-video max-h-[460px]'
          }`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={imageUrl}
            playsInline
            muted={isMuted}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />

          {/* Video Player Overlay Controls: Crisp & disappears while playing unless hovered */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-3 transition-opacity duration-300 ${
            isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
          }`}>
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-950/80 text-[#e61e2b] border border-red-600/30 flex items-center gap-1">
                <Film className="w-3 h-3" />
                <span>Media Player</span>
              </span>

              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-neutral-700/50 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Center Play/Pause button when paused */}
            {!isPlaying && (
              <div className="self-center p-3 sm:p-4 rounded-full bg-[#e61e2b]/90 text-white shadow-xl shadow-red-600/40 hover:scale-110 active:scale-95 transition-all">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
              </div>
            )}

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-300">
              <span className="truncate max-w-[180px] sm:max-w-[260px]">{title}</span>
              <span className="text-[10px] text-neutral-400">
                {isPlaying ? 'Click to Pause' : 'Click to Play'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PHOTO / IMAGE DISPLAY */}
      {activeMedia === 'image' && hasImage && (
        <ImageWithSkeleton
          src={imageUrl!}
          alt={`${title} - Architecture and System Engineering by Bikram Ghosh, Tech Base Axis Kolkata`}
          compact={compact}
        />
      )}
    </div>
  );
};

const ImageWithSkeleton: React.FC<{
  src: string;
  alt: string;
  compact?: boolean;
}> = ({ src, alt, compact }) => {
  return (
    <div 
      className={`relative w-full overflow-hidden bg-neutral-900 ${
        compact ? 'aspect-[16/10]' : 'aspect-video max-h-[460px]'
      }`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ease-out opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60 pointer-events-none" />
      {/* Subtle Photo Tag */}
      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-neutral-300 border border-neutral-700/40 backdrop-blur-sm flex items-center gap-1">
        <ImageIcon className="w-3 h-3 text-neutral-400" />
        <span>Architecture Blueprint</span>
      </div>
    </div>
  );
};

