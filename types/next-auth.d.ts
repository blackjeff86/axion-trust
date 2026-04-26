import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      company: string | null;
      title: string | null;
      userType: "internal" | "external";
    };
  }

  interface User {
    company?: string | null;
    title?: string | null;
    userType: "internal" | "external";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    company?: string | null;
    title?: string | null;
    userType?: "internal" | "external";
  }
}
