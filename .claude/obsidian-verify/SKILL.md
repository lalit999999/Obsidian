---
name: obsidian-verify
description: The mandatory verification and commit loop for the Obsidian repo — typecheck, lint, build, manual browser checks, and what counts as done. Use this skill at the end of every phase or logical unit of work, before telling the user something is finished, before committing, and any time you are about to claim code works. Use it especially when you feel like skipping verification because the change looks small.
---

# Obsidian: verify before you claim

## The loop

```bash
bunx tsc --noEmit     # source of truth for types
bun run lint          # eslint flat config
bun run build         # catches server/client boundary errors nothing else does
```

Run all three. `tsc` passing does not mean `build` passes — the App Router catches `"use client"` violations, server-only imports leaking into client bundles, and invalid route exports only at build time.

If you changed `prisma/schema.prisma`, run `bun --bun run prisma generate` **first**, or every type error you see is stale.

## What is not verification

- "It should work" — no.
- "The types check out" — necessary, not sufficient.
- Deleting a failing check to make the output green — never. If a lint rule is genuinely wrong for one line, disable it inline with a comment explaining why, and mention it in your summary.
- Suppressing an error with `any`, `as unknown as X`, `@ts-ignore`, or `!` on something that can actually be null.

## Manual verification

Typecheck and build prove the code compiles, not that the feature works. For anything user-facing, run `bun run dev` and exercise the actual path in the browser, including at least one failure case: an oversized file, a malformed input, a deleted record, an empty result. Report what you actually clicked, not what you expect would happen.

For backend work with no UI, write a throwaway script under `scripts/` and run it with `bunx tsx scripts/<name>.ts`. Print real output. A parser you have not run on a real file is not a working parser.

## Committing

One commit per completed phase, with a message that says what changed and why. Commit only when all three checks are green. If `AGENTS.md` shows as modified, that is `next dev` regenerating its rules block — commit it with your work rather than reverting it.

## Reporting to the user

Be specific and honest:

- what you changed, by file
- what you verified and how
- **what you could not verify, and why** — this is the most valuable line in your summary
- anything you implemented differently from the instructions, and the reason

Never describe unverified work as working. "Implemented, typechecks, not yet run against a real PDF" is a useful sentence. "Done!" is not.
