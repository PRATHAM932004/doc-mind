"use client";

import React from "react";
import { useTheme, ThemeMode } from "@/context/ThemeContext";

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { themeMode, setThemeMode } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: "light", label: "Light", icon: "pi pi-sun" },
    { mode: "system", label: "System", icon: "pi pi-desktop" },
    { mode: "dark", label: "Dark", icon: "pi pi-moon" },
  ];

  if (compact) {
    return (
      <div className="theme-toggle-compact flex align-items-center bg-surface-100 p-1 border-round-2xl border-surface">
        {options.map((opt) => {
          const isActive = themeMode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setThemeMode(opt.mode)}
              title={`${opt.label} Mode`}
              className={`p-link flex align-items-center justify-content-center border-round-xl cursor-pointer transition-all duration-150 ${
                isActive
                  ? "bg-primary text-white shadow-1"
                  : "text-color-secondary hover:text-color hover:bg-surface-200"
              }`}
              style={{
                width: "28px",
                height: "28px",
                border: "none",
                outline: "none",
              }}
            >
              <i className={`${opt.icon} text-sm`}></i>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="theme-toggle flex align-items-center bg-surface-100 p-1 border-round-lg border-1 border-surface">
      {options.map((opt) => {
        const isActive = themeMode === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setThemeMode(opt.mode)}
            className={`p-link flex align-items-center gap-2 px-3 py-1 border-round-md text-xs font-semibold cursor-pointer transition-all duration-150 ${
              isActive
                ? "bg-primary text-white shadow-1"
                : "text-color-secondary hover:text-color hover:bg-surface-200"
            }`}
            style={{
              border: "none",
              outline: "none",
            }}
          >
            <i className={`${opt.icon} text-xs`}></i>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
