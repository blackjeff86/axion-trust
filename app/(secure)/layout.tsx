import { Sidebar } from "@/components/layout/sidebar";

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-on-surface">
      <div className="pointer-events-none fixed right-[-12rem] top-[-12rem] z-0 h-[24rem] w-[24rem] rounded-full bg-primary/5 blur-[120px]" />
      <Sidebar />
      <div className="relative z-10 ml-72 min-h-screen">{children}</div>
    </div>
  );
}
