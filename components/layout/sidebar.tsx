"use client";

import Image from "next/image";
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
  { label: "Builder do Trust Center", icon: "construction", href: "/builder-trust-center", isAppRoute: true },
  { label: "Due Diligence de Terceiros", icon: "shield_person", href: "/due-diligence-terceiros", isAppRoute: true },
  { label: "Data Room Seguro", icon: "lock", href: "/data-room-seguro", isAppRoute: true },
  { label: "Gestão de Acessos", icon: "manage_accounts", href: "/gestao-acessos", isAppRoute: true },
  { label: "Notificações", icon: "notifications", href: "/notificacoes", isAppRoute: true },
  { label: "Configurações", icon: "settings", href: "/configuracoes", isAppRoute: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="ax-sidebar-shell fixed left-0 top-0 z-[60] flex h-screen w-72 flex-col border-r border-white/5 bg-slate-950/80 px-4 py-6 backdrop-blur-xl">
      <div className="px-2 pb-8">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <Image
              src="/Group 36.svg"
              alt="AXION Trust"
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="font-headline text-xl font-extrabold tracking-tighter text-slate-50">AXION Trust</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400/70">Enterprise Security</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive =
            item.isAppRoute &&
            (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`));
          const classes = `ax-sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 font-manrope text-sm font-semibold tracking-tight transition-all duration-200 ${
            isActive
              ? "ax-sidebar-nav-link-active text-blue-400"
              : "ax-sidebar-nav-link-idle text-slate-400"
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
        <div className="ax-sidebar-profile flex items-center gap-3 rounded-3xl border border-white/5 bg-surface-container-lowest p-4 shadow-[0_8px_20px_rgba(15,23,35,0.06)]">
          <UserInitialsAvatar name="Ricardo Menezes" size="md" />
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-white">Ricardo Menezes</p>
            <p className="truncate text-xs uppercase tracking-[0.18em] text-slate-500">Admin / CISO</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
