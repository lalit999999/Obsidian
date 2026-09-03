import { ValidationError } from "@/lib/errors";

export const MAX_PROJECT_NAME_LENGTH = 120;
export const MAX_PROJECT_DESCRIPTION_LENGTH = 500;
export const MAX_CHAT_TITLE_LENGTH = 120;
export const MAX_CHAT_MESSAGE_LENGTH = 5000;

function normalizeOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError("Expected a string value.");
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${field} is required.`);
  }

  return trimmed;
}

function ensureLength(value: string, maxLength: number, field: string): string {
  if (value.length > maxLength) {
    throw new ValidationError(
      `${field} must be ${maxLength} characters or less.`,
    );
  }

  return value;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}

export interface CreateChatInput {
  projectId: string;
  title?: string;
}

export interface RenameChatInput {
  title: string;
}

export interface ChatMessageInput {
  content: string;
}

export function parseCreateProjectInput(input: unknown): CreateProjectInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Request body is required.");
  }

  const record = input as Record<string, unknown>;
  const name = ensureLength(
    normalizeRequiredString(record.name, "Project name"),
    MAX_PROJECT_NAME_LENGTH,
    "Project name",
  );
  const description = normalizeOptionalString(record.description);

  if (description) {
    ensureLength(description, MAX_PROJECT_DESCRIPTION_LENGTH, "Description");
  }

  return { name, description };
}

export function parseUpdateProjectInput(input: unknown): UpdateProjectInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Request body is required.");
  }

  const record = input as Record<string, unknown>;
  const result: UpdateProjectInput = {};

  if (record.name !== undefined) {
    result.name = ensureLength(
      normalizeRequiredString(record.name, "Project name"),
      MAX_PROJECT_NAME_LENGTH,
      "Project name",
    );
  }

  if (record.description !== undefined) {
    const description = normalizeOptionalString(record.description);
    if (description) {
      ensureLength(description, MAX_PROJECT_DESCRIPTION_LENGTH, "Description");
      result.description = description;
    } else {
      result.description = null;
    }
  }

  if (!result.name && result.description === undefined) {
    throw new ValidationError("No updatable fields were provided.");
  }

  return result;
}

export function parseCreateChatInput(input: unknown): CreateChatInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Request body is required.");
  }

  const record = input as Record<string, unknown>;
  const projectId = normalizeRequiredString(record.projectId, "projectId");
  const title = normalizeOptionalString(record.title);

  if (title) {
    ensureLength(title, MAX_CHAT_TITLE_LENGTH, "Title");
  }

  return { projectId, title };
}

export function parseRenameChatInput(input: unknown): RenameChatInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Request body is required.");
  }

  const record = input as Record<string, unknown>;
  const title = ensureLength(
    normalizeRequiredString(record.title, "Title"),
    MAX_CHAT_TITLE_LENGTH,
    "Title",
  );

  return { title };
}

export function parseChatMessageInput(input: unknown): ChatMessageInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Request body is required.");
  }

  const record = input as Record<string, unknown>;
  const content = ensureLength(
    normalizeRequiredString(record.content, "Message content"),
    MAX_CHAT_MESSAGE_LENGTH,
    "Message content",
  );

  return { content };
}

export function validateSupportedDocumentFile(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension === "md" || extension === "txt";
}
/**
 * INPUT VALIDATION
 *
 * Define shared validation schemas.
 *
 * Suggested schemas:
 *
 * createProjectSchema
 * updateProjectSchema
 * createChatSchema
 * renameChatSchema
 * chatMessageSchema
 *
 * Validate:
 * - required fields
 * - string lengths
 * - empty strings after trimming
 *
 * Keep validation rules centralized so API routes and
 * server actions use consistent rules.
 *
 * Return predictable validation errors.
 */
