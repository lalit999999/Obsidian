import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Account details
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Review your basic account info and make frontend-only edits for the
          MVP.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-3xl border bg-card px-4 py-3">
        <Avatar>
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </header>
  );
}
// Create the profile page header.
//
// Include:
// - Page title: Profile.
// - Short description.
// - Optional user avatar.
//
// Keep the component simple and reusable.
