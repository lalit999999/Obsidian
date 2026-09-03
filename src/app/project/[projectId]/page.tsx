import { notFound } from "next/navigation";

import { ProjectHeader } from "@/components/project/project-header";
import { ProjectWorkspace } from "@/components/project/project-workspace";
import {
  mockChatsByProjectId,
  mockDocumentsByProjectId,
  mockMessagesByChatId,
  mockProjectById,
  mockUser,
} from "@/lib/mock-data";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = mockProjectById[projectId];

  if (!project) {
    notFound();
  }

  const chats = mockChatsByProjectId[project.id] ?? [];
  const documents = mockDocumentsByProjectId[project.id] ?? [];
  const messages = chats.flatMap((chat) => mockMessagesByChatId[chat.id] ?? []);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <ProjectHeader project={project} />
      <ProjectWorkspace
        project={project}
        user={mockUser}
        initialChats={chats}
        initialDocuments={documents}
        initialMessages={messages}
      />
    </main>
  );
}
// Build the dynamic project page.
//
// Requirements:
// - Read projectId from the route params.
// - Load matching project data from lib/mock-data.ts.
// - Show a not-found style state if the mock project does not exist.
// - Compose:
//   - ProjectHeader
//   - ProjectWorkspace
//
// Important:
// - This is a frontend MVP.
// - Use mock data.
// - Do not implement backend requests.
//
// The workspace represents:
//
// Left: Chat history/sidebar
// Center: AI conversation
// Right: Documents panel
