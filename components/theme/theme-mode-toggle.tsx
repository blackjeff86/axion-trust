"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "axion-theme-mode";

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
}

export function ThemeModeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initialMode: ThemeMode = saved === "light" ? "light" : "dark";
    setMode(initialMode);
    applyTheme(initialMode);
  }, []);

  const handleChange = (nextMode: ThemeMode) => {
    setMode(nextMode);
    applyTheme(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-outline-variant/20 bg-surface-container-low p-0.5">
      <button
        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
          mode === "dark" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
        }`}
        onClick={() => handleChange("dark")}
        type="button"
      >
        Dark
      </button>
      <button
        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
          mode === "light" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
        }`}
        onClick={() => handleChange("light")}
        type="button"
      >
        Light
      </button>
    </div>
  );
}
