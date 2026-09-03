"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { AccountSettings } from "@/components/profile/account-settings";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInformation } from "@/components/profile/profile-information";
import { mockUser } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={mockUser} />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <ProfileHeader user={mockUser} />
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <ProfileInformation user={mockUser} />
            <AccountSettings user={mockUser} />
          </div>
        </div>
      </main>
    </div>
  );
}
// Build the profile page.
//
// Compose:
// - DashboardSidebar.
// - ProfileHeader.
// - ProfileInformation.
// - AccountSettings.
//
// Requirements:
// - Use mock user data.
// - Keep this page simple for the MVP.
// - Make the layout responsive.
//
// Important:
// - Do not implement real account updates.
