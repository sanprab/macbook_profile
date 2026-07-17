"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlbumsViewProps {
  albums: { id: string; name: string; artist: string; albumArt: string; trackCount: number }[];
  isMobileView: boolean;
}

const COVER_PALETTES = [
  ["#1b102e", "#a855f7"],
  ["#0f2d2d", "#14b8a6"],
  ["#341617", "#f97316"],
  ["#10233d", "#38bdf8"],
  ["#33260c", "#facc15"],
];

function AlbumArtwork({ name, artist }: { name: string; artist: string }) {
  const colorIndex = Array.from(`${name}-${artist}`).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0
  ) % COVER_PALETTES.length;
  const [background, accent] = COVER_PALETTES[colorIndex];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      role="img"
      aria-label={`${name} cover art`}
      className="relative flex h-full w-full flex-col justify-end overflow-hidden p-3 text-white"
      style={{ background: `linear-gradient(145deg, ${background}, ${accent})` }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
      <div className="absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-black/20" />
      <span className="relative text-4xl font-black tracking-tight">{initials}</span>
      <span className="relative mt-1 line-clamp-2 text-xs font-semibold leading-tight">{name}</span>
      <span className="relative mt-0.5 truncate text-[10px] text-white/75">{artist}</span>
    </div>
  );
}

export function AlbumsView({ albums, isMobileView }: AlbumsViewProps) {
  return (
    <ScrollArea className="h-full" bottomMargin="0">
      <div className={cn("p-6", isMobileView && "p-4 pb-20")}>
        {!isMobileView && <h2 className="text-lg font-semibold mb-4">Albums</h2>}
        <div
          className={cn(
            "grid gap-4",
            isMobileView ? "grid-cols-2" : "grid-cols-3 desktop:grid-cols-5"
          )}
        >
          {albums.map((album) => (
            <div key={album.id}>
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-muted shadow-md">
                {album.albumArt ? (
                  <img
                    src={album.albumArt}
                    alt={`${album.name} cover art`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AlbumArtwork name={album.name} artist={album.artist} />
                )}
              </div>
              <p className="text-sm font-medium truncate">{album.name}</p>
              <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
