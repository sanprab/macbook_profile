"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MusicView, Playlist } from "./types";
import { Home, Search, User, Disc3, Music, ListMusic, Plus, Library, ChevronRight } from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  children: React.ReactNode;
  playlists: Playlist[];
  activeView: MusicView;
  selectedPlaylistId: string | null;
  onViewSelect: (view: MusicView, playlistId?: string) => void;
  isMobileView: boolean;
  onScroll?: (isScrolled: boolean) => void;
}

export function Sidebar({
  children,
  playlists,
  activeView,
  selectedPlaylistId,
  onViewSelect,
  isMobileView,
  onScroll,
}: SidebarProps) {
  return (
    <div
      className={cn("flex h-full flex-col bg-black text-white", !isMobileView && "gap-2")}
    >
      {children}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea
          className="h-full"
          bottomMargin="0"
          onScrollCapture={(e) => {
            const target = e.target as HTMLElement;
            onScroll?.(target.scrollTop > 0);
          }}
        >
          <div className={cn("px-2 pb-2", isMobileView ? "w-full" : "w-[300px]")}>
            {/* Main navigation panel */}
            <div className="mb-2 rounded-lg bg-[#121212] p-2">
              <SidebarItem
                icon={<Home className="w-4 h-4" />}
                label="Home"
                isActive={activeView === "home"}
                onClick={() => onViewSelect("home")}
                isMobileView={isMobileView}
              />
              <SidebarItem
                icon={<Search className="w-4 h-4" />}
                label="Search"
                isActive={activeView === "browse"}
                onClick={() => onViewSelect("browse")}
                isMobileView={isMobileView}
              />
            </div>

            {/* Your Library panel */}
            <div className="rounded-lg bg-[#121212] p-2">
              <div className="mb-3 flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white/90">
                  <Library className="h-5 w-5" />
                  <span>Your Library</span>
                </div>
                <div className="flex items-center gap-1 text-white/70">
                  <button aria-label="Create playlist" className="rounded-full p-1 can-hover:hover:bg-white/10 can-hover:hover:text-white">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button aria-label="Expand library" className="rounded-full p-1 can-hover:hover:bg-white/10 can-hover:hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mb-3 flex gap-2 px-1">
                <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-xs font-medium">Playlists</span>
                <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-xs font-medium">Artists</span>
              </div>
              <SidebarItem
                icon={<User className="w-4 h-4" />}
                label="Artists"
                isActive={activeView === "artists"}
                onClick={() => onViewSelect("artists")}
                isMobileView={isMobileView}
              />
              <SidebarItem
                icon={<Disc3 className="w-4 h-4" />}
                label="Albums"
                isActive={activeView === "albums"}
                onClick={() => onViewSelect("albums")}
                isMobileView={isMobileView}
              />
              <SidebarItem
                icon={<Music className="w-4 h-4" />}
                label="Songs"
                isActive={activeView === "songs"}
                onClick={() => onViewSelect("songs")}
                isMobileView={isMobileView}
              />
            </div>

            {playlists.length > 0 && (
              <div className="mt-2">
                {playlists.map((playlist) => (
                  <SidebarItem
                    key={playlist.id}
                    icon={playlist.tracks[0]?.albumArt ? (
                      <Image src={playlist.tracks[0].albumArt} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" unoptimized />
                    ) : <ListMusic className="w-4 h-4" />}
                    label={playlist.name}
                    isActive={activeView === "playlist" && selectedPlaylistId === playlist.id}
                    onClick={() => onViewSelect("playlist", playlist.id)}
                    isMobileView={isMobileView}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  isActive,
  onClick,
  isMobileView,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isMobileView: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex min-h-10 items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
        isActive && !isMobileView
          ? "bg-[#282828] text-white"
          : "text-white/70 can-hover:hover:bg-[#1f1f1f] can-hover:hover:text-white",
        isMobileView && "py-3"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
