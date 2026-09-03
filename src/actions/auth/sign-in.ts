"use server";

import { headers } from "next/headers";

import { signIn } from "@/auth";

const DEFAULT_REDIRECT = "/dashboard";

/**
 * NextAuth's proxy redirects unauthenticated visitors to the login page with
 * `callbackUrl` set to the absolute URL they were headed to. Only honor it
 * when it resolves to a same-origin, relative path, to avoid an open redirect.
 */
async function safeCallbackUrl(callbackUrl: string | undefined): Promise<string> {
  if (!callbackUrl) {
    return DEFAULT_REDIRECT;
  }

  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  try {
    const url = new URL(callbackUrl);
    const requestHost = (await headers()).get("host");

    if (requestHost && url.host === requestHost) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Not a parseable absolute URL — fall through to the default.
  }

  return DEFAULT_REDIRECT;
}

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: await safeCallbackUrl(callbackUrl) });
}
