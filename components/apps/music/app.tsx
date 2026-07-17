"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useMusic } from "@/lib/music/use-music";
import { useAudio } from "@/lib/music/audio-context";
import { useWindowFocus } from "@/lib/window-focus-context";
import { loadMusicState, saveMusicState } from "@/lib/sidebar-persistence";
import { MusicView } from "./types";
import { Sidebar } from "./sidebar";
import { Nav } from "./nav";
import { NowPlayingBar } from "./now-playing-bar";
import { ChevronLeft, ChevronRight, Search, Bell, UserRound } from "lucide-react";
import {
  HomeView,
  BrowseView,
  ArtistsView,
  AlbumsView,
  SongsView,
  PlaylistView,
} from "./content-views";

interface AppProps {
  isDesktop?: boolean;
}

// Load initial state once outside component to avoid multiple calls
const getInitialState = () => {
  const saved = loadMusicState();
  return {
    view: saved.view,
    playlistId: saved.playlistId,
    showContent: saved.view !== "home",
  };
};

export default function App({ isDesktop = false }: AppProps) {
  const { playlists, albums, artists, songs } = useMusic();
  const { playbackState, pause, resume, next, previous } = useAudio();

  const [initialState] = useState(getInitialState);
  const [activeView, setActiveView] = useState<MusicView>(initialState.view);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(initialState.playlistId);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showContent, setShowContent] = useState(initialState.showContent);

  const containerRef = useRef<HTMLDivElement>(null);
  const windowFocus = useWindowFocus();
  const inShell = !!(isDesktop && windowFocus);

  // Mobile layout is determined by shell context, not viewport width
  useEffect(() => {
    setIsMobileView(!isDesktop);
    setIsLayoutInitialized(true);
  }, [isDesktop]);

  // Persist sidebar/view state
  useEffect(() => {
    saveMusicState(activeView, selectedPlaylistId);
  }, [activeView, selectedPlaylistId]);

  // Handle view selection
  const handleViewSelect = useCallback((view: MusicView, playlistId?: string) => {
    setActiveView(view);
    if (view === "playlist" && playlistId) {
      setSelectedPlaylistId(playlistId);
    } else {
      setSelectedPlaylistId(null);
    }
    setShowContent(true);
  }, []);

  // Handle back to sidebar on mobile
  const handleBack = useCallback(() => {
    setShowContent(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if not focused in shell mode
      if (inShell && windowFocus && !windowFocus.isFocused) return;

      // Don't handle if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (playbackState.isPlaying) {
            pause();
          } else {
            resume();
          }
          break;
        case "ArrowRight":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            next();
          }
          break;
        case "ArrowLeft":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            previous();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inShell, windowFocus, playbackState.isPlaying, pause, resume, next, previous]);

  // Get selected playlist
  const selectedPlaylist = selectedPlaylistId
    ? playlists.find((p) => p.id === selectedPlaylistId)
    : null;

  // Get title and subtitle for mobile header
  const mobileHeader = (() => {
    switch (activeView) {
      case "browse":
        return { title: "Browse", subtitle: "Top Charts" };
      case "artists":
        return { title: "Artists", subtitle: `${artists.length} artists` };
      case "albums":
        return { title: "Albums", subtitle: `${albums.length} albums` };
      case "songs":
        return { title: "Songs", subtitle: `${songs.length} songs` };
      default:
        return { title: "", subtitle: null };
    }
  })();

  if (!isLayoutInitialized) {
    return <div className="h-full bg-background" />;
  }

  // Mobile: show either sidebar or content
  // Desktop: show both side by side
  const showSidebar = !isMobileView || !showContent;
  const showMainContent = !isMobileView || showContent;

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return (
          <HomeView
            albums={albums}
            artists={artists}
            songs={songs}
            isMobileView={isMobileView}
          />
        );
      case "browse":
        return <BrowseView isMobileView={isMobileView} />;
      case "artists":
        return (
          <ArtistsView
            artists={artists}
            isMobileView={isMobileView}
          />
        );
      case "albums":
        return <AlbumsView albums={albums} isMobileView={isMobileView} />;
      case "songs":
        return (
          <SongsView
            songs={songs}
            isMobileView={isMobileView}
          />
        );
      case "playlist":
        return selectedPlaylist ? (
          <PlaylistView playlist={selectedPlaylist} isMobileView={isMobileView} />
        ) : (
          <HomeView
            albums={albums}
            artists={artists}
            songs={songs}
            isMobileView={isMobileView}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      data-app="music"
      tabIndex={-1}
      onMouseDown={() => containerRef.current?.focus()}
      className="music-app dark h-full flex flex-col bg-[#121212] text-white outline-none overflow-hidden"
    >
      <main className={cn(
        "flex-1 flex min-h-0 overflow-hidden",
        !isMobileView && "gap-2 bg-black p-2"
      )}>
        {/* Sidebar */}
        <div
          className={cn(
            "h-full flex-shrink-0 overflow-hidden",
            showSidebar
              ? isMobileView
                ? "block w-full"
                : "block w-[300px]"
              : "hidden"
          )}
        >
          <Sidebar
            playlists={playlists}
            activeView={activeView}
            selectedPlaylistId={selectedPlaylistId}
            onViewSelect={handleViewSelect}
            isMobileView={isMobileView}
            onScroll={setIsScrolled}
          >
            <Nav
              isMobileView={isMobileView}
              isScrolled={isScrolled}
              isDesktop={isDesktop}
            />
          </Sidebar>
        </div>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative",
            !isMobileView && "rounded-lg bg-[#121212]",
            showMainContent ? "block" : "hidden"
          )}
        >
          {/* Mobile content header with back button */}
          {isMobileView && (
            <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-[1] select-none bg-[#121212]">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#282828] can-hover:hover:bg-[#3e3e3e] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {activeView !== "playlist" && activeView !== "home" && activeView !== "browse" && (
                <div>
                  <h1 className="text-lg font-semibold">{mobileHeader.title}</h1>
                  {mobileHeader.subtitle && (
                    <p className="text-xs text-muted-foreground">{mobileHeader.subtitle}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Spotify-style desktop toolbar */}
          {!isMobileView && (
            <div
              className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-4 px-6 select-none"
              onMouseDown={inShell && windowFocus ? windowFocus.onDragStart : undefined}
            >
              <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                <button
                  aria-label="Back"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white/70 can-hover:hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Forward"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white/40"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleViewSelect("browse")}
                  className="ml-2 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black desktop:flex"
                >
                  <Search className="h-4 w-4" />
                  Explore
                </button>
              </div>
              <div className="flex items-center gap-3" onMouseDown={(e) => e.stopPropagation()}>
                <button aria-label="Notifications" className="text-white/70 can-hover:hover:text-white">
                  <Bell className="h-4 w-4" />
                </button>
                <button aria-label="Profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#535353] text-white">
                  <UserRound className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {renderContent()}
        </div>
      </main>

      {/* Now Playing Bar */}
      <NowPlayingBar isMobileView={isMobileView} />
    </div>
  );
}
