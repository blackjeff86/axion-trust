import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { getDemoAccessProfileById, isDemoAccessEnabled } from "@/lib/dev-access-profiles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Email e senha",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Senha",
          type: "password",
        },
        profileId: {
          label: "Perfil de desenvolvimento",
          type: "text",
        },
      },
      async authorize(credentials) {
        const profileId = typeof credentials?.profileId === "string" ? credentials.profileId.trim() : "";

        if (profileId) {
          if (!isDemoAccessEnabled()) {
            return null;
          }

          const profile = getDemoAccessProfileById(profileId);

          if (!profile) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            company: user.company,
            title: user.title,
            userType: user.userType,
          };
        }

        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const passwordMatches = await compare(password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          title: user.title,
          userType: user.userType,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.company = user.company ?? null;
        token.title = user.title ?? null;
        token.userType = user.userType;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === "string" ? token.userId : "";
        session.user.company = typeof token.company === "string" ? token.company : null;
        session.user.title = typeof token.title === "string" ? token.title : null;
        session.user.userType = token.userType === "internal" ? "internal" : "external";
      }

      return session;
    },
  },
});
