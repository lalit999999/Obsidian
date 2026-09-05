# Session A notes (Inngest background pipeline)

## API deviations from the task's shared contract

- **Inngest SDK is v4.20.0.** `EventSchemas` (the `new EventSchemas().fromRecord<Events>()` API
  named in the contract) does not exist in this version — it was removed in the v3→v4 rewrite.
  `src/inngest/events.ts` instead uses the v4 replacement: `eventType(name, { schema: staticSchema<T>() })`
  from `inngest`, which returns an `EventType` usable directly as a function trigger
  (`{ event: myEventType }`) and for creating typed sends (`myEventType.create(data)`).
  `ClientOptions` (the `new Inngest(...)` constructor) has no `schemas` field in v4, so
  `src/inngest/client.ts` is just `new Inngest({ id: "obsidian" })`.
- Serve adapter: `import { serve } from "inngest/next"`, `export const { GET, POST, PUT } = serve({ client, functions })` — matches the contract's expectation.

## Environment note (not a file conflict, just FYI)

- `bun run lint` fails repo-wide, unrelated to any of this work: `typescript-eslint@8.69.0` does
  not support the repo's pinned `typescript@^7.0.2` (peer range is `>=4.8.4 <6.1.0`). Confirmed via
  `git diff bun.lock` that this session did not change the typescript-eslint version — it's
  pre-existing. Using `typecheck` + `build` as the enforced gates until someone fixes the toolchain
  pin; flagging so it isn't mistaken for something either session broke.

## Incident: killed a running dev server

Phase A0's `bun run typecheck` failed on a stale `.next/types/validator.ts` referencing a
`documents/[documentId]/raw/route.ts` module that doesn't exist in source. I ran `rm -rf .next` to
clear it, which killed an already-running `next dev` process (pid 9546, started before this
session, not started by me). `.next` is gitignored build cache, so no source was lost, but I did
take down a live dev server that may have been someone else's (the user's, or Session B's). I
restarted it (`bun run dev` in background) — it's up on :3000. Separately noticed
`./src/proxy.ts` doesn't export a valid function (Next 16 middleware→proxy rename) — not my file,
left untouched, flagging in case it's an in-progress rename by whoever owns it.

## Sandbox has no outbound IPv6 — fixed process-globally in src/inngest/client.ts

This dev sandbox can't route IPv6 at all (confirmed via `curl -v` to the Neon Postgres
host: IPv6 attempts get "Network is unreachable" instantly). Node's Happy Eyeballs
(`autoSelectFamily`) still races an IPv6 attempt in parallel by default, and under Bun
that surfaces as an unhandleable `TypeError: object null is not iterable ... at
AggregateError` that kills every outgoing Postgres connection made from inside an
Inngest function run (through the `next dev` process) — a bare script run with `bun run`
was unaffected since it's a separate, short-lived process where the race apparently
resolves differently. `src/inngest/client.ts` now calls
`dns.setDefaultResultOrder("ipv4first")` and `net.setDefaultAutoSelectFamily(false)` at
module scope — both are process-global Node settings, so putting the fix in a file every
Inngest entry point imports fixes it for the whole process without touching
`src/lib/prisma.ts` (not in either session's ownership list). If Session B's code also
runs Prisma queries inside the same `next dev` process and hits similar random
`ETIMEDOUT`/`AggregateError` failures, this is why — the fix already covers it since it's
process-global, no action needed on Session B's side. Worth promoting to a proper
`instrumentation.ts` at some point since it's currently a side effect of importing the
Inngest client rather than an explicit startup hook, but that file isn't in my ownership
list so I didn't add it speculatively.

## `src/app/api/documents/[documentId]/raw/route.ts` does not exist

The shared contract lists this under Session A's ownership without a "(new)" marker, implying it
should already exist. It does not — only `src/app/api/documents/[documentId]/route.ts` exists.
Not creating it speculatively since the task didn't ask for a new raw-content route; noting the
mismatch here. If Phase A3's deletedAt filtering pass is expected to touch this file, it's a no-op
because the file isn't there.
