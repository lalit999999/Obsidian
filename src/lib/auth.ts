import { auth } from "@/auth";
import { AuthenticationError } from "@/lib/errors";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    throw new AuthenticationError();
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
}
