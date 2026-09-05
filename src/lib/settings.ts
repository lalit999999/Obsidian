import { prisma } from "@/lib/prisma";
import type { UpdateSettingsInput } from "@/lib/validations";
import {
  MAX_RETRIEVAL_LIMIT,
  MIN_RETRIEVAL_LIMIT,
  type UserSettings,
} from "@/types/library";

function clampRetrievalLimit(value: number): number {
  return Math.min(Math.max(value, MIN_RETRIEVAL_LIMIT), MAX_RETRIEVAL_LIMIT);
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { hydeEnabled: true, retrievalLimit: true },
  });

  return {
    hydeEnabled: user.hydeEnabled,
    retrievalLimit: clampRetrievalLimit(user.retrievalLimit),
  };
}

export async function updateUserSettings(
  userId: string,
  input: UpdateSettingsInput,
): Promise<UserSettings> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.hydeEnabled !== undefined
        ? { hydeEnabled: input.hydeEnabled }
        : {}),
      ...(input.retrievalLimit !== undefined
        ? { retrievalLimit: input.retrievalLimit }
        : {}),
    },
    select: { hydeEnabled: true, retrievalLimit: true },
  });

  return {
    hydeEnabled: user.hydeEnabled,
    retrievalLimit: clampRetrievalLimit(user.retrievalLimit),
  };
}
