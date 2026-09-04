---
name: obsidian-prisma
description: Schema, migration and query conventions for the Obsidian repo's Prisma 7 setup with a custom generated client path, a PrismaPg driver adapter, and prisma7.config.ts. Use this skill whenever you touch prisma/schema.prisma, run any prisma command, add a model or column, write a database query, or hit an error about a missing Prisma client, drifted migration, or DATABASE_URL. Also use it before running migrate in a repo where a second agent session may also be migrating.
---

# Obsidian: Prisma conventions

## Running commands

Prisma is configured through `prisma7.config.ts`, not schema-only defaults. Commands run through bun:

```bash
bun --bun run prisma generate
bun --bun run prisma migrate dev --name <snake_case_name>
bun --bun run prisma migrate status
bun --bun run prisma db push        # dev-only sync, creates NO migration files
bun --bun run prisma studio
```

`generate` does not need a database. `migrate` and `db push` do — `DATABASE_URL` comes from `.env` via `dotenv/config`.

## Importing the client

Always through `src/lib/prisma.ts`:

```ts
import { prisma, type Prisma } from "@/lib/prisma";
```

That module is a singleton guarded on `globalThis` in dev and wires the `PrismaPg` adapter. Never construct a `PrismaClient` anywhere else. Never import from `@prisma/client` directly — the generated client lives at `prisma/generated/prisma/client`.

## Schema conventions already established here

- **UUID ids** (`@default(uuid())`), not cuid — Qdrant point IDs are derived from them and must be valid UUIDs.
- **No `Chunk` table.** Chunk text lives in Qdrant payloads. Do not add one.
- **`userId` is denormalised** onto `Document` and `Chat` so ownership checks and vector filters skip a join. Keep it that way and always set it on create.
- **Long text uses `@db.Text`.** Anything that can exceed a few hundred characters gets it.
- **Cascades are declared** on relations to `User` and `Project`. External stores are NOT cascaded — Qdrant vectors and Cloudinary assets must be deleted manually, in that order, before the row.
- New columns must be nullable or have a default, so existing rows survive the migration.

## Migrations

- Name them descriptively: `multi_format_sources`, not `update`.
- **Read the generated SQL before applying it.** If it drops or retypes a column with data, write the backfill into the migration by hand.
- After a schema edit, `generate` before `tsc --noEmit`, or the type errors you see will be lies.

## When two sessions share this repo

Only one session owns `prisma/migrations/`. If you are not that session:

- Use `bun --bun run prisma db push` to sync your local database.
- Do not create or commit anything under `prisma/migrations/`.
- Apply the agreed schema text **exactly** so the two branches merge without conflict.

If `migrate status` reports drift after a `db push`, that is expected on the non-owning branch and is not something to "fix" by generating a migration.
