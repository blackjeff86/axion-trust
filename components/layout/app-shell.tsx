import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar />
        <main className="w-full px-4 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
