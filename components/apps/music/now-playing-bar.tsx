"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/music/audio-context";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/music/utils";

interface NowPlayingBarProps {
  isMobileView: boolean;
}

export function NowPlayingBar({ isMobileView }: NowPlayingBarProps) {
  const {
    playbackState,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = useAudio();

  const { currentTrack, isPlaying, progress, volume, isShuffle, repeatMode, duration, queue, queueIndex } =
    playbackState;

  // Don't render if nothing is playing
  if (!currentTrack) return null;

  // Disable navigation when there's only one track in the queue
  const canNavigate = queue.length > 1;
  const canGoPrevious = canNavigate && queueIndex > 0;
  const canGoNext = canNavigate && (queueIndex < queue.length - 1 || repeatMode === "all");

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleVolumeToggle = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.7);
    }
  };

  const currentTime = Math.floor(progress * duration);

  return (
    <div
      className={cn(
        "flex-shrink-0 border-t border-white/10 bg-[#181818]/95 text-white backdrop-blur-sm",
        isMobileView ? "h-16 px-3" : "h-[88px] px-4"
      )}
    >
      <div className="h-full flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-[260px]">
          <div
            className={cn(
              "relative flex-shrink-0 rounded overflow-hidden bg-muted",
              isMobileView ? "w-10 h-10" : "w-12 h-12"
            )}
          >
            <Image
              src={currentTrack.albumArt}
              alt={currentTrack.album}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentTrack.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {!isMobileView && (
              <button
                onClick={toggleShuffle}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isShuffle
                    ? "text-[#1ed760]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={isShuffle ? "Shuffle On" : "Shuffle Off"}
              >
                <Shuffle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={previous}
              disabled={!canGoPrevious}
              className={cn(
                "p-2 rounded-full transition-colors",
                canGoPrevious
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-muted-foreground/30 cursor-not-allowed"
              )}
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
                className="p-2.5 rounded-full bg-white text-black can-hover:hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              disabled={!canGoNext}
              className={cn(
                "p-2 rounded-full transition-colors",
                canGoNext
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-muted-foreground/30 cursor-not-allowed"
              )}
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {!isMobileView && (
              <button
                onClick={toggleRepeat}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  repeatMode !== "off"
                    ? "text-[#1ed760]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {!isMobileView && (
            <div className="w-full max-w-md flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                {formatDuration(currentTime)}
              </span>
              <Slider
                value={[progress * 100]}
                max={100}
                step={0.1}
                onValueChange={([value]) => seek(value / 100)}
                className="flex-1 min-w-[100px]"
              />
              <span className="text-xs text-muted-foreground w-8 tabular-nums">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>

        {/* Volume Control */}
        {!isMobileView && (
          <div className="flex items-center justify-end gap-2 w-[260px]">
            <button aria-label="Now playing view" className="p-2 text-white/70 can-hover:hover:text-white">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleVolumeToggle}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => setVolume(value / 100)}
              className="flex-1"
            />
            <button aria-label="Queue" className="p-2 text-white/70 can-hover:hover:text-white">
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
