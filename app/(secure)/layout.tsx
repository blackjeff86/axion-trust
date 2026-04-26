import { redirect } from "next/navigation";
import { SecureShellProvider } from "@/components/layout/secure-shell-context";
import { Sidebar } from "@/components/layout/sidebar";
import { getAuthContext } from "@/lib/auth-context";

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
  const authContext = await getAuthContext();

  if (!authContext || !authContext.activeMembership || !authContext.activeOrganization) {
    redirect("/login");
  }

  const shellState = {
    user: authContext.user,
    organization: {
      id: authContext.activeOrganization.id,
      displayName: authContext.activeOrganization.displayName,
      role: authContext.activeMembership.role,
      title: authContext.activeMembership.title,
    },
    organizations: authContext.organizations.map((organization) => ({
      id: organization.id,
      displayName: organization.displayName,
      role: organization.role,
      title: organization.title,
    })),
  };

  return (
    <SecureShellProvider value={shellState}>
      <div className="relative min-h-screen overflow-hidden bg-surface text-on-surface">
        <div className="pointer-events-none fixed right-[-12rem] top-[-12rem] z-0 h-[24rem] w-[24rem] rounded-full bg-primary/5 blur-[120px]" />
        <Sidebar />
        <div className="relative z-10 ml-72 min-h-screen">{children}</div>
      </div>
    </SecureShellProvider>
  );
}
