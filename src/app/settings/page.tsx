import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { AccountCard } from "@/components/settings/account-card";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { SettingsView } from "@/components/settings/settings-view";
import { requireCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const currentUser = await requireCurrentUser();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={currentUser} />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Settings
            </h1>
          </div>
          <SettingsView>
            <AppearanceCard />
          </SettingsView>
          <AccountCard user={currentUser} />
        </div>
      </main>
    </div>
  );
}
