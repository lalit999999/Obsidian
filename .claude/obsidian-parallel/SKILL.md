---
name: obsidian-parallel
description: Rules for working in the Obsidian repo while a second Claude session edits it in parallel on another branch — file ownership, shared contract files, migration ownership, and the merge rule. Use this skill at the start of any session that was given a prompt mentioning a parallel session, before editing a file you are unsure you own, before running prisma migrate, and before merging branches. Use it the moment you feel the urge to "just quickly fix" something outside your assigned area.
---

# Obsidian: working alongside a parallel session

Two sessions edit this repo at once on separate branches. Almost all pain comes from one session helpfully editing the other's files.

## Three categories of file

**Yours.** Edit freely.

**Theirs.** Do not open them to edit. If their code is broken or missing, work around it and write the problem in your final summary. A broken import from their side is expected — your branch is not supposed to be feature-complete on its own.

**Contract files.** Both sessions apply the *same agreed text* to these. Apply exactly what the contract says, nothing more. Do not reformat, do not reorder, do not "improve while I'm here" — an extra blank line becomes a merge conflict.

Your prompt lists which files fall in which category. If it does not cover a file, assume it is theirs and ask rather than guessing.

## Migrations have one owner

Only one session runs `prisma migrate dev`. If that is not you:

```bash
bun --bun run prisma generate
bun --bun run prisma db push
```

and never commit anything under `prisma/migrations/`. Two migration folders with different timestamps for the same change is the single worst merge outcome available here.

## Coding against something that does not exist yet

The other session's endpoints and modules are absent from your branch. That is fine:

- API routes are just URL strings — write the fetch, it compiles.
- If you need a *type* they own, it is in the contract; apply the contract text.
- If you need a *function* they own, you are probably out of your lane — re-read the ownership list.

Verify what you can with what exists. State clearly in your summary which paths you could not exercise because they depend on the other branch.

## Merging

Merge the branch that owns the schema and migrations **first**. On the second merge, resolve any conflict inside a contract file by taking the first branch's version wholesale, then re-apply your own additions to that file by hand and re-run the full verification loop.

After merging, before declaring victory:

```bash
bun --bun run prisma migrate status
bunx tsc --noEmit && bun run lint && bun run build
```

Then walk one end-to-end path that crosses both branches' work.
