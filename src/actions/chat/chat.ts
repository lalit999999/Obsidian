"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { getOwnedChat, getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { parseCreateChatInput, parseUpdateChatInput } from "@/lib/validations";

export async function createChatAction(input: unknown) {
  const currentUser = await requireCurrentUser();
  const { projectId, title, documentIds } = parseCreateChatInput(input);

  await getOwnedProject(projectId, currentUser.id);

  const chat = await prisma.chat.create({
    data: {
      projectId,
      userId: currentUser.id,
      title: title ?? "New chat",
      documentIds: documentIds ?? [],
    },
  });

  revalidatePath(`/project/${projectId}`);
  return chat;
}

export async function updateChatAction(chatId: string, input: unknown) {
  const currentUser = await requireCurrentUser();
  const { title, documentIds } = parseUpdateChatInput(input);
  const chat = await getOwnedChat(chatId, currentUser.id);

  const updatedChat = await prisma.chat.update({
    where: { id: chat.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(documentIds !== undefined ? { documentIds } : {}),
    },
  });

  revalidatePath(`/project/${chat.projectId}`);
  return updatedChat;
}

export async function deleteChatAction(chatId: string) {
  const currentUser = await requireCurrentUser();
  const chat = await getOwnedChat(chatId, currentUser.id);

  await prisma.chat.delete({
    where: { id: chat.id },
  });

  revalidatePath(`/project/${chat.projectId}`);
}
