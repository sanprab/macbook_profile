"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Playlist, PlaylistTrack } from "../types";
import { useAudio } from "@/lib/music/audio-context";
import { Play, Pause } from "lucide-react";

interface HomeViewProps {
  playlists: Playlist[];
  songs: PlaylistTrack[];
  onPlaylistSelect: (playlistId: string) => void;
  isMobileView: boolean;
}

export function HomeView({
  playlists,
  songs,
  onPlaylistSelect,
  isMobileView,
}: HomeViewProps) {
  const { playbackState, play, pause } = useAudio();

  const handlePlayPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const isPlayingThisPlaylist =
      playbackState.isPlaying &&
      playbackState.currentTrack &&
      playlist.tracks.some((t) => t.id === playbackState.currentTrack?.id);

    if (isPlayingThisPlaylist) {
      pause();
    } else {
      onPlaylistSelect(playlist.id);
      const firstPlayable = playlist.tracks.find((t) => t.previewUrl);
      if (firstPlayable) {
        play(firstPlayable, playlist.tracks);
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className={cn("px-6 pb-8", isMobileView && "p-4 pb-20")}>
        <h1 className={cn("mb-6 text-2xl font-bold", !isMobileView && "text-3xl")}>Good evening</h1>
        <div className={cn("mb-8 grid gap-2", isMobileView ? "grid-cols-1" : "grid-cols-2 desktop:grid-cols-3")}>
          {playlists.slice(0, 6).map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onPlaylistSelect(playlist.id)}
              className="group flex min-w-0 items-center overflow-hidden rounded-md bg-[#2a2a2a] text-left can-hover:hover:bg-[#3a3a3a]"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden">
                {playlist.tracks[0]?.albumArt && <Image src={playlist.tracks[0].albumArt} alt="" fill className="object-cover" unoptimized />}
              </div>
              <span className="truncate px-3 text-sm font-bold">{playlist.name}</span>
              <span className="ml-auto mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black opacity-0 shadow-lg transition-opacity can-hover:group-hover:opacity-100">
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </span>
            </button>
          ))}
        </div>
        {/* Your Playlists */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Made for you</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {playlists.map((playlist) => {
              const isPlaying =
                playbackState.isPlaying &&
                playbackState.currentTrack &&
                playlist.tracks.some((t) => t.id === playbackState.currentTrack?.id);

              return (
                <div
                  key={playlist.id}
                  onClick={() => onPlaylistSelect(playlist.id)}
                  className="group cursor-pointer flex-shrink-0 w-40 rounded-md p-3 can-hover:hover:bg-[#1f1f1f]"
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-muted">
                    {playlist.tracks[0]?.albumArt ? (
                      <Image
                        src={playlist.tracks[0].albumArt}
                        alt={playlist.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800" />
                    )}
                    <div
                      className="absolute inset-0 bg-black/0 can-hover:group-hover:bg-black/40 transition-colors flex items-center justify-center"
                      onClick={(e) => handlePlayPlaylist(playlist, e)}
                    >
                      {isPlaying ? (
                        <Pause className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <Play className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {playlist.tracks.length} songs
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently played */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recently played</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {songs.map((song) => {
              const isPlaying =
                playbackState.isPlaying &&
                playbackState.currentTrack?.id === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => song.previewUrl && play(song, songs)}
                  className={cn(
                  "group flex-shrink-0 w-40 rounded-md p-3 can-hover:hover:bg-[#1f1f1f]",
                    song.previewUrl && "cursor-pointer"
                  )}
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-muted">
                    <Image
                      src={song.albumArt}
                      alt={song.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {song.previewUrl && (
                      <div className="absolute inset-0 bg-black/0 can-hover:group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Play className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{song.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
