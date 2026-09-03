import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProjectHeader } from "@/components/project/project-header";
import { ProjectWorkspace } from "@/components/project/project-workspace";
import { ProjectWorkspaceSkeleton } from "@/components/project/project-workspace-skeleton";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  serializeChat,
  serializeDocument,
  serializeMessage,
  serializeProject,
} from "@/lib/serializers";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ chatId?: string }>;
}

async function ProjectContent({
  projectId,
  userId,
  chatIdParam,
}: {
  projectId: string;
  userId: string;
  chatIdParam?: string;
}) {
  const projectRecord = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { _count: { select: { documents: true, chats: true } } },
  });

  if (!projectRecord) {
    notFound();
  }

  const [documentRecords, chatRecords] = await Promise.all([
    prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.chat.findMany({
      where: { projectId },
      include: { _count: { select: { messages: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const activeChatId =
    chatIdParam && chatRecords.some((chat) => chat.id === chatIdParam)
      ? chatIdParam
      : (chatRecords[0]?.id ?? null);

  const messageRecords = activeChatId
    ? await prisma.message.findMany({
        where: { chatId: activeChatId },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const project = serializeProject(projectRecord);

  return (
    <>
      <ProjectHeader project={project} />
      <ProjectWorkspace
        project={project}
        initialChats={chatRecords.map(serializeChat)}
        initialDocuments={documentRecords.map(serializeDocument)}
        initialActiveChatId={activeChatId}
        initialMessages={messageRecords.map(serializeMessage)}
      />
    </>
  );
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const [{ projectId }, { chatId }] = await Promise.all([
    params,
    searchParams,
  ]);
  const currentUser = await requireCurrentUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Suspense fallback={<ProjectWorkspaceSkeleton />}>
        <ProjectContent
          projectId={projectId}
          userId={currentUser.id}
          chatIdParam={chatId}
        />
      </Suspense>
    </main>
  );
}
