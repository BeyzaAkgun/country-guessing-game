// useDisplayMode.ts - Detects screen size, manages TV/Classroom mode toggle
import { useState, useEffect, useCallback } from "react";

export type DisplayMode = "mobile" | "tablet" | "desktop" | "tv";

export interface DisplayConfig {
  mode: DisplayMode;
  isTV: boolean;
  isMobile: boolean;
  isTouch: boolean;
  width: number;
  height: number;
  isLandscape: boolean;
}

const TV_MODE_KEY = "geogame_tv_mode";

function detectMode(width: number): DisplayMode {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1600) return "desktop";
  return "tv";
}

export function useDisplayMode(): { config: DisplayConfig; toggleTVMode: () => void } {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [isTVMode, setIsTVMode] = useState(() => {
    try { return localStorage.getItem(TV_MODE_KEY) === "true"; } catch { return false; }
  });

  useEffect(() => {
    const handler = () => { setWidth(window.innerWidth); setHeight(window.innerHeight); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const toggleTVMode = useCallback(() => {
    setIsTVMode(prev => {
      const next = !prev;
      try { localStorage.setItem(TV_MODE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const autoMode = detectMode(width);
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const config: DisplayConfig = {
    mode: autoMode,
    isTV: isTVMode || autoMode === "tv",
    isMobile: autoMode === "mobile",
    isTouch, width, height,
    isLandscape: width > height,
  };

  return { config, toggleTVMode };
}