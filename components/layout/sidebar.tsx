"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";

type NavItem = {
  label: string;
  icon: string;
  href: string;
  isAppRoute?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/", isAppRoute: true },
  { label: "Builder do Trust Center", icon: "architecture", href: "#" },
  { label: "Due Diligence de Terceiros", icon: "shield_person", href: "/due-diligence-terceiros", isAppRoute: true },
  { label: "Data Room Seguro", icon: "lock", href: "/data-room-seguro", isAppRoute: true },
  { label: "Gestao de Acessos", icon: "manage_accounts", href: "/gestao-acessos", isAppRoute: true },
  { label: "Notificacoes", icon: "notifications", href: "#" },
  { label: "Configuracoes", icon: "settings", href: "#" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-[60] flex h-screen w-64 flex-col bg-slate-950/80 px-4 py-6 shadow-2xl shadow-blue-500/5 backdrop-blur-xl">
      <div className="px-2 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-container to-primary">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold tracking-tighter text-blue-500">AXION Trust</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">O Curador Digital</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.isAppRoute && pathname === item.href;
          const classes = `flex items-center gap-3 rounded-lg px-4 py-3 font-manrope text-sm tracking-tight transition-all duration-200 ${
            isActive
              ? "border-l-4 border-blue-500 bg-blue-500/10 font-semibold text-blue-400"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          }`;

          if (item.isAppRoute) {
            return (
              <Link key={item.label} href={item.href} className={classes}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <a key={item.label} href={item.href} className={classes}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/50 p-4">
          <UserInitialsAvatar name="Ricardo Menezes" size="md" />
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-white">Ricardo Menezes</p>
            <p className="truncate text-xs text-slate-500">Admin / CISO</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
