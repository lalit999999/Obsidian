import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const PROTECTED_PATH_PREFIXES = ["/dashboard", "/project", "/profile"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const authConfig = {
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ request, auth }) {
      if (!isProtectedPath(request.nextUrl.pathname)) {
        return true;
      }

      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
