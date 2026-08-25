"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "docmind-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyTheme = useCallback((mode: ThemeMode) => {
    if (typeof window === "undefined") return;

    const resolved: ResolvedTheme = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(resolved);

    // Apply document classes and attributes
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    // Switch PrimeReact theme link
    let themeLink = document.getElementById("primereact-theme") as HTMLLinkElement | null;
    const targetHref = `/themes/lara-${resolved}-indigo/theme.css`;

    if (themeLink) {
      if (themeLink.getAttribute("href") !== targetHref) {
        themeLink.setAttribute("href", targetHref);
      }
    } else {
      themeLink = document.createElement("link");
      themeLink.id = "primereact-theme";
      themeLink.rel = "stylesheet";
      themeLink.href = targetHref;
      document.head.appendChild(themeLink);
    }
  }, []);

  useEffect(() => {
    // Read saved preference from localStorage
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      const initialMode: ThemeMode = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
      setThemeModeState(initialMode);
      applyTheme(initialMode);
    } catch {
      applyTheme("system");
    }
    setMounted(true);
  }, [applyTheme]);

  // System media query change listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, applyTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
    applyTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
