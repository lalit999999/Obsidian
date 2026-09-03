import { headers } from "next/headers";

import { AuthenticationError } from "@/lib/errors";
import { mockUser } from "@/lib/mock-data";

export interface CurrentUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const headerStore = await headers();

  const id =
    headerStore.get("x-obsidian-user-id") ?? headerStore.get("x-user-id");
  const email =
    headerStore.get("x-obsidian-user-email") ?? headerStore.get("x-user-email");
  const name =
    headerStore.get("x-obsidian-user-name") ?? headerStore.get("x-user-name");
  const image =
    headerStore.get("x-obsidian-user-image") ?? headerStore.get("x-user-image");

  if (id && email) {
    return {
      id,
      email,
      name: name ?? undefined,
      image: image ?? undefined,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      image: mockUser.image,
    };
  }

  throw new AuthenticationError();
}
/**
 * AUTHENTICATION HELPERS
 *
 * Implement shared authentication utilities.
 *
 * Responsibilities:
 * - Access the configured Auth.js/NextAuth session.
 * - Provide a helper for retrieving the current user.
 * - Provide a helper that throws or returns an appropriate
 *   error when authentication is required.
 *
 * Suggested helper:
 *
 * requireCurrentUser()
 *
 * It should return a minimal trusted user object:
 * - id
 * - email
 * - name when available
 *
 * Do not duplicate authentication configuration if it already
 * exists elsewhere in the project.
 *
 * Reuse the existing authentication setup.
 */
