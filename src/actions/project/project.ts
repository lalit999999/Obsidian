"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { AuthenticationError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
	parseCreateProjectInput,
	parseUpdateProjectInput,
} from "@/lib/validations";

export async function createProjectAction(input: unknown) {
	const currentUser = await requireCurrentUser();
	const { name, description } = parseCreateProjectInput(input);

	const project = await prisma.project.create({
		data: {
			name,
			description: description ?? null,
			userId: currentUser.id,
		},
	});

	revalidatePath("/dashboard");
	return project;
}

export async function updateProjectAction(projectId: string, input: unknown) {
	const currentUser = await requireCurrentUser();

	if (!projectId) {
		throw new NotFoundError("Project not found.");
	}

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId: currentUser.id },
	});

	if (!project) {
		throw new NotFoundError("Project not found.");
	}

	const updates = parseUpdateProjectInput(input);

	const updatedProject = await prisma.project.update({
		where: { id: projectId },
		data: {
			...(updates.name !== undefined ? { name: updates.name } : {}),
			...(updates.description !== undefined
				? { description: updates.description }
				: {}),
		},
	});

	revalidatePath("/dashboard");
	revalidatePath(`/project/${projectId}`);
	return updatedProject;
}

export async function deleteProjectAction(projectId: string) {
	const currentUser = await requireCurrentUser();

	if (!projectId) {
		throw new NotFoundError("Project not found.");
	}

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId: currentUser.id },
	});

	if (!project) {
		throw new NotFoundError("Project not found.");
	}

	await prisma.project.delete({
		where: { id: projectId },
	});

	revalidatePath("/dashboard");
	revalidatePath(`/project/${projectId}`);
}