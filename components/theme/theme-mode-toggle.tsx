"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "axion-theme-mode";

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
}

export function ThemeModeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initialMode: ThemeMode = saved === "light" ? "light" : "dark";
    setMode(initialMode);
    applyTheme(initialMode);
    setMounted(true);
  }, []);

  const handleChange = (nextMode: ThemeMode) => {
    setMode(nextMode);
    applyTheme(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  };

  return (
    <div className="inline-flex items-center rounded-2xl border border-white/5 bg-surface-container-lowest p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_rgba(15,23,35,0.08)] backdrop-blur-xl">
      <button
        aria-pressed={mounted ? mode === "dark" : undefined}
        className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
          mode === "dark"
            ? "bg-primary text-on-primary shadow-[0_10px_24px_rgba(124,169,255,0.24)]"
            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        }`}
        onClick={() => handleChange("dark")}
        type="button"
      >
        Dark
      </button>
      <button
        aria-pressed={mounted ? mode === "light" : undefined}
        className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
          mode === "light"
            ? "bg-primary text-on-primary shadow-[0_10px_24px_rgba(124,169,255,0.24)]"
            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        }`}
        onClick={() => handleChange("light")}
        type="button"
      >
        Light
      </button>
    </div>
  );
}
