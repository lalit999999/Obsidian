import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { HelpContact } from "@/components/help/help-contact";
import { HelpFaq } from "@/components/help/help-faq";
import { HelpIntro } from "@/components/help/help-intro";

export default async function HelpPage() {
  const session = await auth();
  const user = session?.user?.email
    ? {
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
      }
    : null;

  return (
    <div className="flex min-h-screen bg-background">
      {user ? <DashboardSidebar user={user} /> : null}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <HelpIntro />
          <HelpFaq />
          <HelpContact />
        </div>
      </main>
    </div>
  );
}
