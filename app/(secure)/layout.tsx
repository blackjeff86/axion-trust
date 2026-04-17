import { Sidebar } from "@/components/layout/sidebar";

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className="ml-64 min-h-screen">{children}</div>
    </div>
  );
}
