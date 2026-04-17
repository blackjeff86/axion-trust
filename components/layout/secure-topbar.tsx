"use client";

import { ThemeModeToggle } from "@/components/theme/theme-mode-toggle";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";

type SecureTopbarProps = {
  placeholder?: string;
};

export function SecureTopbar({ placeholder = "Buscar solicitações ou usuários..." }: SecureTopbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-950/60 px-8 py-4 font-inter text-sm backdrop-blur-md">
      <div className="flex w-96 items-center rounded-full border border-outline-variant/10 bg-surface-container-low px-4 py-2">
        <span className="material-symbols-outlined mr-2 text-outline">search</span>
        <input
          className="w-full border-none bg-transparent p-0 text-sm text-on-surface focus:ring-0"
          placeholder={placeholder}
          type="text"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-400 transition-colors hover:text-blue-400">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <ThemeModeToggle />
        <div className="group flex cursor-pointer items-center gap-3">
          <UserInitialsAvatar name="Ricardo Menezes" size="sm" />
          <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-400">account_circle</span>
        </div>
      </div>
    </header>
  );
}
