import Link from "next/link";
import { LibraryBig, MessagesSquare, UploadCloud } from "lucide-react";

import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { HelpContact } from "@/components/help/help-contact";
import { HelpFaqBody } from "@/components/help/help-faq-body";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const START_HERE_STEPS = [
  {
    icon: UploadCloud,
    title: "Create a project and add sources",
    description:
      "Start a project, then upload documents — each moves from pending to processing to ready.",
    href: "/dashboard",
  },
  {
    icon: MessagesSquare,
    title: "Ask questions, get cited answers",
    description:
      "Chat with an assistant that only answers from what you uploaded, with links back to the source passage.",
    href: "/dashboard",
  },
  {
    icon: LibraryBig,
    title: "Browse everything in the library",
    description:
      "See every document across your projects in one place, grouped by type or by project.",
    href: "/library",
  },
];

export default async function HelpPage() {
  const session = await auth();
  const user = session?.user?.email
    ? {
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
      }
    : null;

  const content = (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl tracking-[-0.02em] sm:text-4xl">
          Help &amp; FAQ
        </h1>
        <p className="mt-3 text-muted-foreground">
          Answers to common questions about uploading documents, chatting
          over them, and what to do when something looks stuck.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {START_HERE_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Link key={step.title} href={step.href} className="block">
              <SpotlightCard className="h-full p-5">
                <Icon className="size-5 text-foreground" />
                <h3 className="mt-3 text-sm font-medium">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </SpotlightCard>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 space-y-6">
        <h2 className="font-display text-2xl tracking-[-0.02em]">
          Frequently asked questions
        </h2>
        <HelpFaqBody />
      </div>

      <div className="mt-16">
        <HelpContact />
      </div>
    </div>
  );

  if (user) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar user={user} />
        <main className="flex-1">{content}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">{content}</main>
      <Footer />
    </div>
  );
}
