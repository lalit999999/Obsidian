import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "@auth/core/adapters";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // @auth/prisma-adapter types PrismaAdapter's parameter against the default
  // `@prisma/client` import path. This schema generates to a custom output
  // (prisma/generated/prisma) instead, so the two PrismaClient types are
  // structurally identical but not nominally the same declaration.
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]) as Adapter,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }

      return session;
    },
  },
});
