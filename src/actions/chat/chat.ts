"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { getOwnedChat, getOwnedProject } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import {
	parseCreateChatInput,
	parseRenameChatInput,
} from "@/lib/validations";

export async function createChatAction(input: unknown) {
	const currentUser = await requireCurrentUser();
	const { projectId, title } = parseCreateChatInput(input);

	await getOwnedProject(projectId, currentUser.id);

	const chat = await prisma.chat.create({
		data: {
			projectId,
			userId: currentUser.id,
			title: title ?? "New chat",
		},
	});

	revalidatePath(`/project/${projectId}`);
	return chat;
}

export async function renameChatAction(chatId: string, input: unknown) {
	const currentUser = await requireCurrentUser();
	const { title } = parseRenameChatInput(input);
	const chat = await getOwnedChat(chatId, currentUser.id);

	const updatedChat = await prisma.chat.update({
		where: { id: chat.id },
		data: { title },
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