import { ValidationError } from "@/lib/errors";
import { SOURCE_KINDS, type SourceKind } from "@/types";
import {
  LIBRARY_PAGE_SIZE,
  MAX_RETRIEVAL_LIMIT,
  MIN_RETRIEVAL_LIMIT,
} from "@/types/library";
import {
  isLegacyDocFile,
  lookupSourceType,
  supportedFormatsList,
} from "@/lib/documents/registry";
import type { RegistryMatch } from "@/lib/documents/types";

export const MAX_PROJECT_NAME_LENGTH = 120;
export const MAX_PROJECT_DESCRIPTION_LENGTH = 500;
export const MAX_CHAT_TITLE_LENGTH = 120;
export const MAX_CHAT_MESSAGE_LENGTH = 5000;
export const MAX_TEXT_SOURCE_LENGTH = 200_000;
export const MAX_TEXT_SOURCE_TITLE_LENGTH = 120;
export const MAX_CHAT_DOCUMENT_IDS = 50;

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

// documentIds narrows chat scope to a subset of a project's sources — see
// AGENTS.md contract C7/C9. An empty or omitted array means "whole project."
function normalizeDocumentIds(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("documentIds must be an array of strings.");
  }

  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      throw new ValidationError("documentIds must contain non-empty strings.");
    }
    ids.push(item.trim());
  }

  const deduped = Array.from(new Set(ids));
  if (deduped.length > MAX_CHAT_DOCUMENT_IDS) {
    throw new ValidationError(
      `documentIds must contain ${MAX_CHAT_DOCUMENT_IDS} or fewer ids.`,
    );
  }

  return deduped;
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
  documentIds?: string[];
}

export interface RenameChatInput {
  title: string;
}

export interface UpdateChatInput {
  title?: string;
  documentIds?: string[];
}

export interface ChatMessageInput {
  content: string;
  documentIds?: string[];
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

  const documentIds = normalizeDocumentIds(record.documentIds);

  return { projectId, title, documentIds };
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

export function parseUpdateChatInput(input: unknown): UpdateChatInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Request body is required.");
  }

  const record = input as Record<string, unknown>;
  const result: UpdateChatInput = {};

  if (record.title !== undefined) {
    result.title = ensureLength(
      normalizeRequiredString(record.title, "Title"),
      MAX_CHAT_TITLE_LENGTH,
      "Title",
    );
  }

  if (record.documentIds !== undefined) {
    result.documentIds = normalizeDocumentIds(record.documentIds);
  }

  if (result.title === undefined && result.documentIds === undefined) {
    throw new ValidationError("No updatable fields were provided.");
  }

  return result;
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
  const documentIds = normalizeDocumentIds(record.documentIds);

  return { content, documentIds };
}

export interface TextSourceInput {
  text: string;
  title: string;
}

export interface LibraryQuery {
  groupBy: "type" | "project" | null;
  sourceKind: SourceKind | null;
  projectId: string | null;
  cursor: string | null;
  limit: number;
}

export function parseLibraryQuery(params: URLSearchParams): LibraryQuery {
  const groupByRaw = params.get("groupBy");
  if (groupByRaw !== null && groupByRaw !== "type" && groupByRaw !== "project") {
    throw new ValidationError("groupBy must be 'type' or 'project'.");
  }
  const groupBy = groupByRaw;

  const sourceKindRaw = params.get("sourceKind");
  if (
    sourceKindRaw !== null &&
    !SOURCE_KINDS.includes(sourceKindRaw as SourceKind)
  ) {
    throw new ValidationError("sourceKind is not a recognized source kind.");
  }
  const sourceKind = sourceKindRaw as SourceKind | null;

  const projectId = normalizeOptionalString(params.get("projectId")) ?? null;
  const cursor = normalizeOptionalString(params.get("cursor")) ?? null;

  const limitRaw = params.get("limit");
  let limit = LIBRARY_PAGE_SIZE;
  if (limitRaw !== null) {
    const parsed = Number(limitRaw);
    if (!Number.isInteger(parsed)) {
      throw new ValidationError("limit must be an integer.");
    }
    limit = Math.min(Math.max(parsed, 1), LIBRARY_PAGE_SIZE);
  }

  return { groupBy, sourceKind, projectId, cursor, limit };
}

export interface UpdateSettingsInput {
  hydeEnabled?: boolean;
  retrievalLimit?: number;
}

export function parseUpdateSettingsInput(input: unknown): UpdateSettingsInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Request body is required.");
  }

  const record = input as Record<string, unknown>;
  const result: UpdateSettingsInput = {};

  if (record.hydeEnabled !== undefined) {
    if (typeof record.hydeEnabled !== "boolean") {
      throw new ValidationError("hydeEnabled must be a boolean.");
    }
    result.hydeEnabled = record.hydeEnabled;
  }

  if (record.retrievalLimit !== undefined) {
    const value = record.retrievalLimit;
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < MIN_RETRIEVAL_LIMIT ||
      value > MAX_RETRIEVAL_LIMIT
    ) {
      throw new ValidationError(
        `retrievalLimit must be an integer between ${MIN_RETRIEVAL_LIMIT} and ${MAX_RETRIEVAL_LIMIT}.`,
      );
    }
    result.retrievalLimit = value;
  }

  if (result.hydeEnabled === undefined && result.retrievalLimit === undefined) {
    throw new ValidationError("No updatable fields were provided.");
  }

  return result;
}

export function parseTextSourceInput(formData: FormData): TextSourceInput {
  const rawText = formData.get("text");
  if (typeof rawText !== "string" || !rawText.trim()) {
    throw new ValidationError("Text content is required.");
  }

  const text = rawText.trim();
  if (text.length > MAX_TEXT_SOURCE_LENGTH) {
    throw new ValidationError(
      `Text content must be ${MAX_TEXT_SOURCE_LENGTH.toLocaleString()} characters or less.`,
    );
  }

  const rawTitle = formData.get("title");
  let title = "Untitled note";
  if (typeof rawTitle === "string" && rawTitle.trim()) {
    title = rawTitle.trim();
    if (title.length > MAX_TEXT_SOURCE_TITLE_LENGTH) {
      throw new ValidationError(
        `Title must be ${MAX_TEXT_SOURCE_TITLE_LENGTH} characters or less.`,
      );
    }
  }

  return { text, title };
}

export function validateUploadedFile(file: File): RegistryMatch {
  if (isLegacyDocFile(file.name)) {
    throw new ValidationError(
      "Legacy .doc files are not supported. Save the file as .docx and upload again.",
    );
  }

  const match = lookupSourceType(file.name, file.type);
  if (!match) {
    throw new ValidationError(
      `Unsupported file type. Supported formats: ${supportedFormatsList().join(", ")}.`,
    );
  }

  if (file.size > match.maxBytes) {
    const maxMb = (match.maxBytes / (1024 * 1024)).toFixed(0);
    throw new ValidationError(
      `${file.name} is too large. ${match.label} uploads are limited to ${maxMb} MB.`,
    );
  }

  return match;
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
