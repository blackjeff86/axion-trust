"use client";

import { createContext, useContext } from "react";
import type { OrganizationRole } from "@prisma/client";

export type SecureShellState = {
  user: {
    id: string;
    name: string;
    email: string;
    title: string | null;
    company: string | null;
    userType: "internal" | "external";
  };
  organization: {
    id: string | null;
    displayName: string;
    role: OrganizationRole | null;
    title: string | null;
  };
  organizations: Array<{
    id: string;
    displayName: string;
    role: OrganizationRole;
    title: string | null;
  }>;
};

const SecureShellContext = createContext<SecureShellState | null>(null);

export function SecureShellProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SecureShellState;
}) {
  return <SecureShellContext.Provider value={value}>{children}</SecureShellContext.Provider>;
}

export function useSecureShell() {
  const value = useContext(SecureShellContext);

  if (!value) {
    throw new Error("Secure shell context indisponivel.");
  }

  return value;
}
