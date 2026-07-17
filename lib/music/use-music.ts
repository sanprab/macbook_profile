"use client";

import { useMemo } from "react";
import { Playlist } from "@/components/apps/music/types";
import {
  DEFAULT_PLAYLISTS,
  getAlbums,
  getArtistsFromAlbums,
  getAllSongs,
} from "@/components/apps/music/data";

interface UseMusicResult {
  playlists: Playlist[];
  albums: ReturnType<typeof getAlbums>;
  artists: ReturnType<typeof getArtistsFromAlbums>;
  songs: ReturnType<typeof getAllSongs>;
}

export function useMusic(): UseMusicResult {
  const playlists = useMemo(() => DEFAULT_PLAYLISTS, []);
  const albums = useMemo(() => getAlbums(), []);
  const artists = useMemo(() => getArtistsFromAlbums(), []);
  const songs = useMemo(() => getAllSongs(), []);

  return {
    playlists,
    albums,
    artists,
    songs,
  };
}
