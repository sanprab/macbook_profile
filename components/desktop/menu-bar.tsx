"use client";

import { useEffect, useState, useCallback } from "react";
import { useWindowManager } from "@/lib/window-context";
import { getAppById } from "@/lib/app-config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faApple } from "@fortawesome/free-brands-svg-icons";
import { faWifi, faBatteryFull, faSliders } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Bluetooth, Moon, MoonStar, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppleMenu } from "./apple-menu";
import { BatteryMenu, WifiMenu, ControlCenterMenu } from "./status-menus";
import { NotificationCenter } from "./notification-center";
import { AppMenu } from "./app-menu";
import { FileMenu } from "./file-menu";
import { AboutDialog } from "./about-dialog";
import { useFileMenuActions } from "@/lib/file-menu-context";
import { useSystemSettings } from "@/lib/system-settings-context";

type OpenMenu = "apple" | "appMenu" | "fileMenu" | "battery" | "wifi" | "controlCenter" | "notificationCenter" | null;

function SystemMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-8 flex-col justify-center text-[9px] font-medium leading-none text-black/80 dark:text-white/80">
      <span className="leading-none">{label}</span>
      <span className="text-xs font-semibold leading-none">{value}</span>
    </div>
  );
}

interface MenuBarProps {
  onOpenSettings?: () => void;
  onOpenWifiSettings?: () => void;
  onOpenAbout?: () => void;
  onSleep?: () => void;
  onRestart?: () => void;
  onShutdown?: () => void;
  onLockScreen?: () => void;
  onLogout?: () => void;
  onOpenMessagesConversation?: (conversationId: string) => void;
}

export function MenuBar({
  onOpenSettings,
  onOpenWifiSettings,
  onOpenAbout,
  onSleep,
  onRestart,
  onShutdown,
  onLockScreen,
  onLogout,
  onOpenMessagesConversation,
}: MenuBarProps) {
  const fileMenuActions = useFileMenuActions();
  const { getFocusedAppId, closeApp, state, setMenuOpen } = useWindowManager();
  const { focusMode } = useSystemSettings();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

  // Sync menu open state to window context (used to prevent window focus when menu is open)
  useEffect(() => {
    setMenuOpen(!!openMenu);
  }, [openMenu, setMenuOpen]);

  const focusedAppId = getFocusedAppId(); // This returns the base app ID (e.g., "textedit")
  const focusedApp = focusedAppId ? getAppById(focusedAppId) : null;
  const focusedWindowId = state.focusedWindowId; // This is the actual window ID (e.g., "textedit-0")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
      const month = now.toLocaleDateString("en-US", { month: "short" });
      const day = now.getDate();
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      setCurrentTime(`${weekday} ${month} ${day} ${time}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to quit the focused app (quits all windows for multi-window apps)
  // Storage is cleared automatically by closeApp → clearAppState
  const quitFocusedApp = useCallback(() => {
    if (!focusedAppId) return;
    closeApp(focusedAppId);
  }, [focusedAppId, closeApp]);

  // Q shortcut to quit the focused app (closes all windows for multi-window apps)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Q key when not in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Finder can be closed but not quit
      if (e.key.toLowerCase() === "q" && focusedWindowId && focusedAppId !== "finder") {
        e.preventDefault();
        quitFocusedApp();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedWindowId, focusedAppId, quitFocusedApp]);

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-white/20 dark:bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-[70] select-none">
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleMenu("apple")}
          className={cn(
            "flex items-center justify-center w-8 h-7 -ml-1 rounded transition-colors",
            openMenu === "apple" ? "bg-blue-500" : "can-hover:hover:bg-white/10"
          )}
        >
          <FontAwesomeIcon
            icon={faApple as IconProp}
            className={cn(
              "w-4 h-4",
              openMenu === "apple" ? "text-white" : "text-black dark:text-white"
            )}
          />
        </button>
        <button
          onClick={() => toggleMenu("appMenu")}
          className={cn(
            "text-sm font-semibold px-1.5 py-1 rounded transition-colors",
            openMenu === "appMenu"
              ? "bg-blue-500 text-white"
              : "text-black dark:text-white can-hover:hover:bg-white/10"
          )}
        >
          {focusedApp?.menuBarTitle || "Finder"}
        </button>
        {(focusedAppId === "notes" || focusedAppId === "messages") && (
          <button
            onClick={() => toggleMenu("fileMenu")}
            className={cn(
                "text-sm px-1.5 py-1 rounded transition-colors",
              openMenu === "fileMenu"
                ? "bg-blue-500 text-white"
                : "text-black dark:text-white can-hover:hover:bg-white/10"
            )}
          >
            File
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-1 hidden shrink-0 items-center gap-5 lg:flex">
          <SystemMetric label="CPU" value="5%" />
          <SystemMetric label="RAM" value="69%" />
          <SystemMetric label="SSD" value="13%" />
          <SystemMetric label="Sensor" value="6W" />
          <div className="flex h-8 flex-col justify-center text-xs font-semibold leading-none text-black/80 dark:text-white/80">
            <span>●</span>
            <span>●</span>
          </div>
          <div className="flex h-8 flex-col justify-center whitespace-nowrap text-[9px] leading-none text-black/80 dark:text-white/80">
            <span>0 KB/s</span>
            <span>0 KB/s</span>
          </div>
        </div>

        <div className="hidden items-center gap-1 px-1 text-sm font-semibold text-black dark:text-white lg:flex">
          <MoonStar className="h-4 w-4 fill-current" strokeWidth={2.25} />
          <span>61°F</span>
        </div>

        <Bluetooth className="hidden h-4 w-4 text-black dark:text-white lg:block" />

        <div
          aria-label="Focus"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded",
            focusMode === "off" ? "" : "bg-white/30 dark:bg-white/20"
          )}
        >
          <Moon className="h-4 w-4 fill-current text-black dark:text-white" />
        </div>

        {/* Wi-Fi */}
        <button
          onClick={() => toggleMenu("wifi")}
          className={cn(
            "flex items-center justify-center w-8 h-7 rounded transition-colors",
            openMenu === "wifi" ? "bg-white/30 dark:bg-white/20" : "can-hover:hover:bg-white/10"
          )}
        >
          <FontAwesomeIcon icon={faWifi} className="w-4 h-4 text-black dark:text-white" />
        </button>

        {/* Battery */}
        <button
          onClick={() => toggleMenu("battery")}
          className={cn(
            "flex h-7 items-center justify-center gap-1 rounded px-1.5 transition-colors",
            openMenu === "battery" ? "bg-white/30 dark:bg-white/20" : "can-hover:hover:bg-white/10"
          )}
        >
          <span className="hidden whitespace-nowrap text-xs font-semibold text-black dark:text-white lg:inline">97%</span>
          <FontAwesomeIcon icon={faBatteryFull} className="w-5 h-3 text-black dark:text-white" />
        </button>

        <Search className="hidden h-4 w-4 text-black dark:text-white lg:block" />

        {/* Control Center */}
        <button
          onClick={() => toggleMenu("controlCenter")}
          className={cn(
            "flex items-center justify-center w-8 h-7 rounded transition-colors",
            openMenu === "controlCenter" ? "bg-white/30 dark:bg-white/20" : "can-hover:hover:bg-white/10"
          )}
        >
          <FontAwesomeIcon icon={faSliders} className="w-4 h-4 text-black dark:text-white" />
        </button>

        {/* Date/Time */}
        <button
          onClick={() => toggleMenu("notificationCenter")}
          className={cn(
            "whitespace-nowrap text-sm px-2 py-1 rounded transition-colors ml-1",
            openMenu === "notificationCenter"
              ? "bg-white/30 dark:bg-white/20"
              : "can-hover:hover:bg-white/10",
            "text-black dark:text-white"
          )}
        >
          {currentTime}
        </button>
      </div>

      {/* Menus */}
      <AppleMenu
        isOpen={openMenu === "apple"}
        onClose={closeMenu}
        onAboutThisMac={() => onOpenAbout?.()}
        onSystemSettings={() => onOpenSettings?.()}
        onSleep={() => onSleep?.()}
        onRestart={() => onRestart?.()}
        onShutdown={() => onShutdown?.()}
        onLockScreen={() => onLockScreen?.()}
        onLogout={() => onLogout?.()}
      />

      <BatteryMenu
        isOpen={openMenu === "battery"}
        onClose={closeMenu}
        onOpenSettings={onOpenSettings}
      />

      <WifiMenu
        isOpen={openMenu === "wifi"}
        onClose={closeMenu}
        onOpenWifiSettings={onOpenWifiSettings}
      />

      <ControlCenterMenu
        isOpen={openMenu === "controlCenter"}
        onClose={closeMenu}
        onOpenSettings={onOpenSettings}
      />

      <AppMenu
        isOpen={openMenu === "appMenu"}
        onClose={closeMenu}
        appId={focusedAppId || "finder"}
        appName={focusedApp?.menuBarTitle || "Finder"}
        onAbout={() => setAboutDialogOpen(true)}
        onQuit={quitFocusedApp}
      />

      <FileMenu
        isOpen={openMenu === "fileMenu"}
        onClose={closeMenu}
        appId={focusedAppId || ""}
        onNewNote={fileMenuActions.onNewNote}
        onPinNote={fileMenuActions.onPinNote}
        onDeleteNote={fileMenuActions.onDeleteNote}
        noteIsPinned={fileMenuActions.noteIsPinned}
        onNewChat={fileMenuActions.onNewChat}
        onPinChat={fileMenuActions.onPinChat}
        onHideAlerts={fileMenuActions.onHideAlerts}
        onDeleteChat={fileMenuActions.onDeleteChat}
        chatIsPinned={fileMenuActions.chatIsPinned}
        hideAlertsActive={fileMenuActions.hideAlertsActive}
      />

      <NotificationCenter
        isOpen={openMenu === "notificationCenter"}
        onClose={closeMenu}
        onOpenMessagesConversation={onOpenMessagesConversation}
      />

      <AboutDialog
        isOpen={aboutDialogOpen}
        onClose={() => setAboutDialogOpen(false)}
        appName={focusedApp?.menuBarTitle || "Finder"}
        appId={focusedAppId || "finder"}
      />
    </div>
  );
}
