import { Suspense } from "react";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { AccountSettings } from "@/components/profile/account-settings";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInformation } from "@/components/profile/profile-information";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { ProfileStats } from "@/components/profile/profile-stats";
import type { User } from "@/types";

async function ProfileDetails({ userId }: { userId: string }) {
  const [dbUser, totalProjects, totalDocuments, totalChats] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.document.count({ where: { userId } }),
      prisma.chat.count({ where: { userId } }),
    ]);

  const user: User = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    createdAt: dbUser.createdAt.toISOString(),
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ProfileInformation user={user} />
        <AccountSettings user={user} />
      </div>
      <ProfileStats
        statistics={{ totalProjects, totalDocuments, totalChats }}
      />
    </>
  );
}

export default async function ProfilePage() {
  const currentUser = await requireCurrentUser();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={currentUser} />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <ProfileHeader user={currentUser} />
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileDetails userId={currentUser.id} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
