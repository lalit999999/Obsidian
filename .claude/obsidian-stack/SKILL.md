---
name: obsidian-stack
description: Version discipline for the Obsidian repo, which runs Next.js 16.3.4, React 19.2.8, Prisma 7.10, TypeScript 7 and Tailwind v4 — all newer than your training data. Use this skill BEFORE writing any code that calls a framework or library API, including route handlers, server actions, Prisma queries, Qdrant calls, React hooks, or any newly installed package. If you are about to write an import, a config option, or a method call from memory, stop and use this skill first.
---

# Obsidian: verify APIs on disk, never from memory

Every version in this repo is ahead of your training data. APIs you "know" have moved, been renamed, or been removed. Writing from memory here produces code that typechecks against nothing and fails at runtime.

## The rule

Before the first call into any library, read its real documentation or type definitions from `node_modules/`. Not a guess, not a recollection, not "this is probably still the same".

## Where to look

| Thing | Read this |
|---|---|
| Next.js routing, `after()`, caching, params, config | `node_modules/next/dist/docs/` (see `AGENTS.md`) |
| Prisma client API, adapters | `node_modules/@prisma/client/`, `prisma/generated/prisma/` |
| Qdrant methods and payload filter shapes | `node_modules/@qdrant/js-client-rest/dist/types/` |
| OpenAI SDK | `node_modules/openai/` |
| Anything you just `bun add`ed | its `README.md` first, then `dist/*.d.ts` |

```bash
ls node_modules/next/dist/docs/
rg -n "export declare function after" node_modules/next/dist/
sed -n '1,120p' node_modules/<pkg>/README.md
```

## Specifics that bite in this repo

- **Route params are Promises.** `{ params }: { params: Promise<{ projectId: string }> }` — you must `await params`. Same for `searchParams` in pages.
- **The React Compiler is on** (`reactCompiler: true` in `next.config.ts`). Do not hand-write `useMemo` / `useCallback` for performance. Write plain code.
- **Prisma client is generated to a custom path**, `prisma/generated/prisma/client`, and used through the `PrismaPg` driver adapter. Never `import { PrismaClient } from "@prisma/client"`.
- **TypeScript 7** is stricter and faster than what you remember. `bunx tsc --noEmit` is the source of truth, not your intuition.
- **`AGENTS.md` contains a `nextjs-agent-rules` block that `next dev` rewrites.** If it shows up dirty in `git status`, commit it with your work rather than reverting it — reverting only makes it come back.

## When the docs contradict this repo's existing code

The existing code wins if it currently builds. Match the pattern already in `src/` and note the discrepancy in your summary. Do not "modernise" working code as a side effect of another task.
