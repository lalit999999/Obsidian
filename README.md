# Obsidian

A NotebookLM-style app: create projects, upload `.txt`/`.md` documents, and chat with an
AI assistant that answers grounded in your documents (RAG over Qdrant).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma 7 + Postgres
- Qdrant (vector store)
- OpenAI-compatible API (chat + embeddings)
- Auth.js (NextAuth v5) — Google OAuth only
- Cloudinary (document storage)

## Prerequisites

- [Bun](https://bun.sh)
- [Docker](https://www.docker.com/) (for Qdrant, and optionally Postgres)

## Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Start infrastructure**

   ```bash
   docker compose up -d
   ```

   This starts Qdrant on `localhost:6333`, and a local Postgres on `localhost:5432`
   (user/password/db: `obsidian`). You can point `DATABASE_URL` at this local Postgres,
   or at a hosted Postgres instance (e.g. Neon) instead — either works.

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in `.env`:

   | Variable | Where to get it |
   | --- | --- |
   | `DATABASE_URL` | Local Docker Postgres (`postgresql://obsidian:obsidian@localhost:5432/obsidian`) or a hosted Postgres connection string |
   | `QDRANT_URL` | `http://localhost:6333` for local Docker |
   | `QDRANT_API_KEY` | Leave empty for local Docker |
   | `OPENAI_API_KEY` | An OpenAI API key, or an OpenRouter API key |
   | `OPENAI_BASE_URL` | Leave empty for OpenAI. Set to `https://openrouter.ai/api/v1` to use OpenRouter |
   | `OPENAI_CHAT_MODEL` / `OPENAI_EMBEDDING_MODEL` | e.g. `gpt-4o-mini` / `text-embedding-3-small` (OpenAI), or `openai/gpt-4o-mini` / `openai/text-embedding-3-small` (OpenRouter) |
   | `AUTH_SECRET` | Generate with `bunx auth secret` or `openssl rand -base64 32` |
   | `AUTH_URL` | `http://localhost:3000` for local dev |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | From the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — create an OAuth 2.0 Client ID (Web application) and register `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your [Cloudinary dashboard](https://console.cloudinary.com/) |

4. **Set up the database**

   ```bash
   bun --bun run prisma migrate dev
   bun --bun run prisma generate
   ```

5. **Run the app**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Notes

- Auth is Google OAuth only — no email/password.
- Document ingestion (parsing, chunking, embedding) runs inline in the upload request.
  For local dev this is fine; a production deployment would move this to a background
  queue to avoid serverless timeouts on large documents.
- The in-memory rate limiter in `src/lib/rate-limit.ts` is per-instance and will not
  work correctly across multiple server instances — it should move to Redis before a
  multi-instance deploy.
