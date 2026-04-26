"use client";

import { signOut } from "next-auth/react";
import { useSecureShell } from "@/components/layout/secure-shell-context";
import { ThemeModeToggle } from "@/components/theme/theme-mode-toggle";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";

type SecureTopbarProps = {
  placeholder?: string;
};

export function SecureTopbar({ placeholder }: SecureTopbarProps) {
  const normalizedPlaceholder = placeholder ?? "Buscar no sistema...";
  const shell = useSecureShell();
  const profileLabel = shell.organization.title ?? shell.organization.role ?? shell.user.title ?? "Usuario";

  return (
    <header className="ax-topbar-shell sticky top-0 z-50 flex h-16 w-full min-w-0 items-center gap-4 overflow-hidden border-b border-white/5 bg-slate-950/60 px-5 py-2 font-inter text-sm backdrop-blur-xl lg:px-8">
      <div className="ax-topbar-search relative flex h-11 min-w-0 flex-1 items-center rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 shadow-[0_6px_18px_rgba(15,23,35,0.05)]">
        <span className="material-symbols-outlined mr-3 shrink-0 text-outline">search</span>
        <input
          className="min-w-0 flex-1 appearance-none border-none bg-transparent p-0 text-sm text-on-surface shadow-none outline-none ring-0 focus:bg-transparent focus:shadow-none focus:outline-none focus:ring-0"
          placeholder={normalizedPlaceholder}
          type="text"
        />
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2 lg:gap-3">
        <div className="hidden max-w-[13rem] rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-right xl:block">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Tenant</p>
          <p className="truncate text-xs font-semibold text-slate-100">{shell.organization.displayName}</p>
        </div>
        <button
          aria-label="Abrir notificações"
          className="ax-topbar-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest text-slate-400 shadow-[0_6px_18px_rgba(15,23,35,0.05)] transition-colors hover:text-blue-400"
          type="button"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          aria-label="Abrir ajuda"
          className="ax-topbar-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest text-slate-400 shadow-[0_6px_18px_rgba(15,23,35,0.05)] transition-colors hover:text-blue-400"
          type="button"
        >
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <ThemeModeToggle />
        <button
          aria-label={`Abrir menu do usuario ${shell.user.name}`}
          className="ax-topbar-profile group flex h-11 max-w-[11rem] shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-2.5 text-left shadow-[0_6px_18px_rgba(15,23,35,0.05)] transition-colors hover:border-primary/40"
          title={`${shell.user.name} - ${profileLabel}`}
          onClick={() => signOut({ callbackUrl: "/login" })}
          type="button"
        >
          <UserInitialsAvatar name={shell.user.name} size="sm" />
          <div className="hidden min-w-0 text-right 2xl:block">
            <p className="truncate text-xs font-semibold leading-4 text-white">{shell.user.name}</p>
            <p className="truncate text-[10px] uppercase leading-4 tracking-[0.18em] text-slate-500">{profileLabel}</p>
          </div>
          <span className="material-symbols-outlined shrink-0 text-slate-400 group-hover:text-blue-400">logout</span>
        </button>
      </div>
    </header>
  );
}
