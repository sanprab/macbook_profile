"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaylistTrack } from "../types";
import { useAudio } from "@/lib/music/audio-context";
import { Pause, Play } from "lucide-react";

interface HomeViewProps {
  albums: { id: string; name: string; artist: string; albumArt: string }[];
  artists: { id: string; name: string; image: string; albumCount: number }[];
  songs: PlaylistTrack[];
  isMobileView: boolean;
}

function PlayButton({ isPlaying }: { isPlaying: boolean }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg opacity-0 transition-opacity can-hover:group-hover:opacity-100">
      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
    </span>
  );
}

export function HomeView({ albums, artists, songs, isMobileView }: HomeViewProps) {
  const { playbackState, play, pause, resume } = useAudio();

  const handlePlay = (song: PlaylistTrack) => {
    if (playbackState.currentTrack?.id === song.id && playbackState.isPlaying) {
      pause();
    } else if (playbackState.currentTrack?.id === song.id) {
      resume();
    } else {
      play(song, songs);
    }
  };

  const currentSongId = playbackState.currentTrack?.id;

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className={cn("px-6 pb-10", isMobileView && "p-4 pb-20")}>
        <h1 className={cn("mb-6 text-2xl font-bold", !isMobileView && "text-3xl")}>Good evening</h1>

        <div className={cn("mb-9 grid gap-2", isMobileView ? "grid-cols-1" : "grid-cols-2 desktop:grid-cols-3")}>
          {songs.slice(0, 6).map((song) => {
            const isPlaying = currentSongId === song.id && playbackState.isPlaying;
            return (
              <button
                key={song.id}
                onClick={() => handlePlay(song)}
                className="group flex min-w-0 items-center overflow-hidden rounded-md bg-[#2a2a2a] text-left can-hover:hover:bg-[#3a3a3a]"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[#333]">
                  <Image src={song.albumArt} alt={song.album} fill className="object-cover" unoptimized />
                </div>
                <span className="truncate px-3 text-sm font-bold">{song.name}</span>
                <span className="ml-auto mr-2"><PlayButton isPlaying={isPlaying} /></span>
              </button>
            );
          })}
        </div>

        <section className="mb-9">
          <h2 className="mb-4 text-2xl font-bold">Recently played</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {songs.slice(0, 10).map((song) => {
              const isPlaying = currentSongId === song.id && playbackState.isPlaying;
              return (
                <button
                  key={song.id}
                  onClick={() => handlePlay(song)}
                  className="group w-40 shrink-0 rounded-md p-3 text-left can-hover:hover:bg-[#1f1f1f]"
                >
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                    <Image src={song.albumArt} alt={song.album} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors can-hover:group-hover:bg-black/40">
                      <PlayButton isPlaying={isPlaying} />
                    </div>
                  </div>
                  <p className="truncate text-sm font-medium">{song.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-9">
          <h2 className="mb-4 text-2xl font-bold">Albums for you</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {albums.slice(0, 10).map((album) => (
              <div key={album.id} className="w-40 shrink-0 rounded-md p-3 can-hover:hover:bg-[#1f1f1f]">
                <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                  <Image src={album.albumArt} alt={album.name} fill className="object-cover" unoptimized />
                </div>
                <p className="truncate text-sm font-medium">{album.name}</p>
                <p className="truncate text-xs text-muted-foreground">{album.artist}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Artists you may like</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {artists.slice(0, 10).map((artist) => (
              <div key={artist.id} className="w-40 shrink-0 rounded-md p-3 text-center can-hover:hover:bg-[#1f1f1f]">
                <div className="relative mx-auto mb-3 aspect-square overflow-hidden rounded-full bg-muted">
                  {artist.image ? (
                    <Image src={artist.image} alt={artist.name} fill className="object-cover" unoptimized />
                  ) : (
                    <span className="flex h-full items-center justify-center text-3xl font-semibold">{artist.name.charAt(0)}</span>
                  )}
                </div>
                <p className="truncate text-sm font-medium">{artist.name}</p>
                <p className="text-xs text-muted-foreground">Artist</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
