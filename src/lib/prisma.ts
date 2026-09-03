import "dotenv/config";

import { Pool } from "pg";

import { NotFoundError, ValidationError } from "@/lib/errors";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const globalForPool = globalThis as typeof globalThis & {
  __obsidianPool?: Pool;
};

const pool = globalForPool.__obsidianPool ?? new Pool({ connectionString });

if (!globalForPool.__obsidianPool) {
  globalForPool.__obsidianPool = pool;
}

type CountSelection = {
  documents?: boolean;
  chats?: boolean;
  messages?: boolean;
};

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type ChatRow = {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type DocumentRow = {
  id: string;
  projectId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  status: string;
  error: string | null;
  chunkCount: number;
  createdAt: string;
  processedAt: string | null;
};

type MessageRow = {
  id: string;
  chatId: string;
  role: string;
  content: string;
  sources: unknown;
  createdAt: string;
};

const toDate = (value: string) => new Date(value);

async function run<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
) {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

async function runOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
) {
  const rows = await run<T>(sql, params);
  return rows[0] ?? null;
}

function withCountsProject(
  row: ProjectRow,
  counts?: { documents?: number; chats?: number },
) {
  return {
    ...row,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
    _count: counts
      ? { documents: counts.documents ?? 0, chats: counts.chats ?? 0 }
      : undefined,
  };
}

function withCountsChat(
  row: ChatRow,
  counts?: { messages?: number },
  messages?: MessageRow[],
  project?: ProjectRow,
) {
  return {
    ...row,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
    _count: counts ? { messages: counts.messages ?? 0 } : undefined,
    messages: messages?.map(withMessage),
    project: project ? withCountsProject(project) : undefined,
  };
}

function withDocument(row: DocumentRow, project?: ProjectRow) {
  return {
    ...row,
    createdAt: toDate(row.createdAt),
    processedAt: row.processedAt ? toDate(row.processedAt) : null,
    project: project ? withCountsProject(project) : undefined,
  };
}

function withMessage(row: MessageRow) {
  return {
    ...row,
    createdAt: toDate(row.createdAt),
  };
}

function normalize<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

const project = {
  async findMany(options?: {
    where?: { userId?: string };
    include?: { _count?: { select?: CountSelection } };
  }) {
    const rows = await run<ProjectRow>(
      `SELECT * FROM "Project"${options?.where?.userId ? ' WHERE "userId" = $1' : ""} ORDER BY "updatedAt" DESC`,
      options?.where?.userId ? [options.where.userId] : [],
    );

    if (!options?.include?._count?.select) {
      return rows.map((row) => withCountsProject(row));
    }

    const select = options.include._count.select;
    return Promise.all(
      rows.map(async (row) => {
        const counts: { documents?: number; chats?: number } = {};
        if (select.documents) {
          const [{ count }] = await run<{ count: string }>(
            'SELECT COUNT(*)::int AS count FROM "Document" WHERE "projectId" = $1',
            [row.id],
          );
          counts.documents = Number(count);
        }
        if (select.chats) {
          const [{ count }] = await run<{ count: string }>(
            'SELECT COUNT(*)::int AS count FROM "Chat" WHERE "projectId" = $1',
            [row.id],
          );
          counts.chats = Number(count);
        }
        return withCountsProject(row, counts);
      }),
    );
  },

  async findFirst(options: {
    where?: { id?: string; userId?: string };
    include?: { _count?: { select?: CountSelection } };
  }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (options.where?.id) {
      params.push(options.where.id);
      conditions.push(`"id" = $${params.length}`);
    }
    if (options.where?.userId) {
      params.push(options.where.userId);
      conditions.push(`"userId" = $${params.length}`);
    }
    const row = await runOne<ProjectRow>(
      `SELECT * FROM "Project"${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""} LIMIT 1`,
      params,
    );
    if (!row) return null;
    if (!options.include?._count?.select) return withCountsProject(row);
    const select = options.include._count.select;
    const counts: { documents?: number; chats?: number } = {};
    if (select.documents) {
      const [{ count }] = await run<{ count: string }>(
        'SELECT COUNT(*)::int AS count FROM "Document" WHERE "projectId" = $1',
        [row.id],
      );
      counts.documents = Number(count);
    }
    if (select.chats) {
      const [{ count }] = await run<{ count: string }>(
        'SELECT COUNT(*)::int AS count FROM "Chat" WHERE "projectId" = $1',
        [row.id],
      );
      counts.chats = Number(count);
    }
    return withCountsProject(row, counts);
  },

  async create(options: {
    data: { name: string; description?: string | null; userId: string };
  }) {
    const row = await runOne<ProjectRow>(
      `INSERT INTO "Project" ("id", "name", "description", "userId", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING *`,
      [
        options.data.name,
        options.data.description ?? null,
        options.data.userId,
      ],
    );
    if (!row) throw new Error("Failed to create project.");
    return withCountsProject(row);
  },

  async update(options: {
    where: { id: string };
    data: { name?: string; description?: string | null };
  }) {
    const data = normalize(options.data);
    const columns = Object.keys(data);
    if (!columns.length)
      throw new ValidationError("No updatable fields were provided.");
    const set = columns
      .map((column, index) => `"${column}" = $${index + 1}`)
      .join(", ");
    const params = columns.map(
      (column) => (data as Record<string, unknown>)[column],
    );
    params.push(options.where.id);
    const row = await runOne<ProjectRow>(
      `UPDATE "Project" SET ${set}, "updatedAt" = NOW() WHERE "id" = $${params.length} RETURNING *`,
      params,
    );
    if (!row) throw new NotFoundError("Project not found.");
    return withCountsProject(row);
  },

  async delete(options: { where: { id: string } }) {
    await run('DELETE FROM "Project" WHERE "id" = $1', [options.where.id]);
  },
};

const chat = {
  async findMany(options?: {
    where?: { projectId?: string; userId?: string };
    include?: { _count?: { select?: CountSelection } };
  }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (options?.where?.projectId) {
      params.push(options.where.projectId);
      conditions.push(`"projectId" = $${params.length}`);
    }
    if (options?.where?.userId) {
      params.push(options.where.userId);
      conditions.push(`"userId" = $${params.length}`);
    }
    const rows = await run<ChatRow>(
      `SELECT * FROM "Chat"${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""} ORDER BY "updatedAt" DESC`,
      params,
    );
    if (!options?.include?._count?.select)
      return rows.map((row) => withCountsChat(row));
    const select = options.include._count.select;
    return Promise.all(
      rows.map(async (row) => {
        const counts: { messages?: number } = {};
        if (select.messages) {
          const [{ count }] = await run<{ count: string }>(
            'SELECT COUNT(*)::int AS count FROM "Message" WHERE "chatId" = $1',
            [row.id],
          );
          counts.messages = Number(count);
        }
        return withCountsChat(row, counts);
      }),
    );
  },

  async findFirst(options: {
    where?: { id?: string; userId?: string };
    include?: {
      project?: boolean;
      messages?: { orderBy?: { createdAt?: "asc" | "desc" } };
      _count?: { select?: CountSelection };
    };
  }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (options.where?.id) {
      params.push(options.where.id);
      conditions.push(`"id" = $${params.length}`);
    }
    if (options.where?.userId) {
      params.push(options.where.userId);
      conditions.push(`"userId" = $${params.length}`);
    }
    const row = await runOne<ChatRow>(
      `SELECT * FROM "Chat"${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""} LIMIT 1`,
      params,
    );
    if (!row) return null;
    const projectRow = options.include?.project
      ? ((await runOne<ProjectRow>('SELECT * FROM "Project" WHERE "id" = $1', [
          row.projectId,
        ])) ?? undefined)
      : undefined;
    const messages = options.include?.messages
      ? await run<MessageRow>(
          'SELECT * FROM "Message" WHERE "chatId" = $1 ORDER BY "createdAt" ASC',
          [row.id],
        )
      : undefined;
    let counts: { messages?: number } | undefined;
    if (options.include?._count?.select?.messages) {
      const [{ count }] = await run<{ count: string }>(
        'SELECT COUNT(*)::int AS count FROM "Message" WHERE "chatId" = $1',
        [row.id],
      );
      counts = { messages: Number(count) };
    }
    return withCountsChat(row, counts, messages, projectRow);
  },

  async create(options: {
    data: { projectId: string; userId: string; title?: string };
  }) {
    const row = await runOne<ChatRow>(
      `INSERT INTO "Chat" ("id", "projectId", "userId", "title", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING *`,
      [
        options.data.projectId,
        options.data.userId,
        options.data.title ?? "New chat",
      ],
    );
    if (!row) throw new Error("Failed to create chat.");
    return withCountsChat(row);
  },

  async update(options: { where: { id: string }; data: { title?: string } }) {
    const data = normalize(options.data);
    const columns = Object.keys(data);
    if (!columns.length)
      throw new ValidationError("No updatable fields were provided.");
    const row = await runOne<ChatRow>(
      `UPDATE "Chat" SET "title" = $1, "updatedAt" = NOW() WHERE "id" = $2 RETURNING *`,
      [data.title, options.where.id],
    );
    if (!row) throw new NotFoundError("Chat not found.");
    return withCountsChat(row);
  },

  async delete(options: { where: { id: string } }) {
    await run('DELETE FROM "Chat" WHERE "id" = $1', [options.where.id]);
  },
};

const document = {
  async findMany(options?: {
    where?: { projectId?: string; userId?: string };
  }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (options?.where?.projectId) {
      params.push(options.where.projectId);
      conditions.push(`"projectId" = $${params.length}`);
    }
    if (options?.where?.userId) {
      params.push(options.where.userId);
      conditions.push(`"userId" = $${params.length}`);
    }
    const rows = await run<DocumentRow>(
      `SELECT * FROM "Document"${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""} ORDER BY "createdAt" DESC`,
      params,
    );
    return rows.map((row) => withDocument(row));
  },

  async findFirst(options: {
    where?: { id?: string; userId?: string };
    include?: { project?: boolean };
  }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (options.where?.id) {
      params.push(options.where.id);
      conditions.push(`"id" = $${params.length}`);
    }
    if (options.where?.userId) {
      params.push(options.where.userId);
      conditions.push(`"userId" = $${params.length}`);
    }
    const row = await runOne<DocumentRow>(
      `SELECT * FROM "Document"${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""} LIMIT 1`,
      params,
    );
    if (!row) return null;
    const projectRow = options.include?.project
      ? ((await runOne<ProjectRow>('SELECT * FROM "Project" WHERE "id" = $1', [
          row.projectId,
        ])) ?? undefined)
      : undefined;
    return withDocument(row, projectRow);
  },

  async create(options: {
    data: {
      projectId: string;
      userId: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      cloudinaryUrl: string;
      cloudinaryPublicId: string;
      status: string;
      error?: string | null;
      chunkCount?: number;
      processedAt?: Date | null;
    };
  }) {
    const row = await runOne<DocumentRow>(
      `INSERT INTO "Document" ("id", "projectId", "userId", "fileName", "fileSize", "mimeType", "cloudinaryUrl", "cloudinaryPublicId", "status", "error", "chunkCount", "createdAt", "processedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11) RETURNING *`,
      [
        options.data.projectId,
        options.data.userId,
        options.data.fileName,
        options.data.fileSize,
        options.data.mimeType,
        options.data.cloudinaryUrl,
        options.data.cloudinaryPublicId,
        options.data.status,
        options.data.error ?? null,
        options.data.chunkCount ?? 0,
        options.data.processedAt ?? null,
      ],
    );
    if (!row) throw new Error("Failed to create document.");
    return withDocument(row);
  },

  async update(options: {
    where: { id: string };
    data: Partial<{
      status: string;
      error: string | null;
      chunkCount: number;
      processedAt: Date | null;
      cloudinaryUrl: string;
      cloudinaryPublicId: string;
    }>;
  }) {
    const data = normalize(options.data);
    const columns = Object.keys(data);
    if (!columns.length)
      throw new ValidationError("No updatable fields were provided.");
    const set = columns
      .map((column, index) => `"${column}" = $${index + 1}`)
      .join(", ");
    const params = columns.map(
      (column) => (data as Record<string, unknown>)[column],
    );
    params.push(options.where.id);
    const row = await runOne<DocumentRow>(
      `UPDATE "Document" SET ${set} WHERE "id" = $${params.length} RETURNING *`,
      params,
    );
    if (!row) throw new NotFoundError("Document not found.");
    return withDocument(row);
  },

  async delete(options: { where: { id: string } }) {
    await run('DELETE FROM "Document" WHERE "id" = $1', [options.where.id]);
  },
};

const message = {
  async create(options: {
    data: { chatId: string; role: string; content: string; sources?: unknown };
  }) {
    const row = await runOne<MessageRow>(
      `INSERT INTO "Message" ("id", "chatId", "role", "content", "sources", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW()) RETURNING *`,
      [
        options.data.chatId,
        options.data.role,
        options.data.content,
        options.data.sources ? JSON.stringify(options.data.sources) : null,
      ],
    );
    if (!row) throw new Error("Failed to create message.");
    return withMessage(row);
  },
};

export const prisma = { project, chat, document, message };
