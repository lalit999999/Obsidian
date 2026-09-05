"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { inngest } from "@/inngest/client";
import { projectDeleted } from "@/inngest/events";
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
    where: { id: projectId, userId: currentUser.id, deletedAt: null },
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
    where: { id: projectId, userId: currentUser.id, deletedAt: null },
  });

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  // Postgres cascades would destroy Document rows (and every
  // cloudinaryPublicId with them) before anything gets a chance to clean up
  // the Qdrant vectors and Cloudinary assets they point to. Soft-delete here
  // and let purge-project.ts do the real deletion in dependency order.
  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });

  await inngest.send(
    projectDeleted.create({ projectId, userId: currentUser.id }),
  );

  revalidatePath("/dashboard");
  revalidatePath(`/project/${projectId}`);
}
