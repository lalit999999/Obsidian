import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  return project;
}

export async function getOwnedChat(chatId: string, userId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: { project: true },
  });

  if (!chat) {
    throw new NotFoundError("Chat not found.");
  }

  if (chat.project?.userId !== userId) {
    throw new NotFoundError("Chat not found.");
  }

  return chat;
}

export async function getOwnedDocument(documentId: string, userId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { project: true },
  });

  if (!document) {
    throw new NotFoundError("Document not found.");
  }

  if (document.project?.userId !== userId) {
    throw new NotFoundError("Document not found.");
  }

  return document;
}
