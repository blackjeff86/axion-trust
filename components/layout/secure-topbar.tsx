"use client";

import { ThemeModeToggle } from "@/components/theme/theme-mode-toggle";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";

type SecureTopbarProps = {
  placeholder?: string;
};

export function SecureTopbar(_: SecureTopbarProps) {
  const normalizedPlaceholder = "Buscar no sistema...";

  return (
    <header className="ax-topbar-shell sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-950/60 px-8 py-4 font-inter text-sm backdrop-blur-xl">
      <div className="ax-topbar-search relative flex w-[28rem] items-center rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 shadow-[0_6px_18px_rgba(15,23,35,0.05)]">
        <span className="material-symbols-outlined mr-3 text-outline">search</span>
        <input
          className="w-full appearance-none border-none bg-transparent p-0 text-sm text-on-surface shadow-none outline-none ring-0 focus:bg-transparent focus:shadow-none focus:outline-none focus:ring-0"
          placeholder={normalizedPlaceholder}
          type="text"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="ax-topbar-icon rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2.5 text-slate-400 shadow-[0_6px_18px_rgba(15,23,35,0.05)] transition-colors hover:text-blue-400">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="ax-topbar-icon rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2.5 text-slate-400 shadow-[0_6px_18px_rgba(15,23,35,0.05)] transition-colors hover:text-blue-400">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <ThemeModeToggle />
        <div className="ax-topbar-profile group flex cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-2.5 py-2 shadow-[0_6px_18px_rgba(15,23,35,0.05)]">
          <UserInitialsAvatar name="Ricardo Menezes" size="sm" />
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold text-white">Ricardo Menezes</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Admin / CISO</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-400">expand_more</span>
        </div>
      </div>
    </header>
  );
}
