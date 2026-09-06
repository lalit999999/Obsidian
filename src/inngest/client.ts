import dns from "node:dns";
import net from "node:net";

import { Inngest } from "inngest";

// Node's dns.lookup() tries the addresses in whatever order getaddrinfo
// returns, which can put an unreachable AAAA record first on hosts without
// real IPv6 egress (e.g. this repo's Postgres host) — outgoing pg
// connections made from the Inngest function process hit this. Reordering
// alone isn't enough: Happy Eyeballs (autoSelectFamily) still races the
// unreachable IPv6 attempt in parallel, which surfaces as an
// unhandleable "AggregateError" under Bun. Disabling it forces plain
// sequential attempts in dns.lookup()'s (now IPv4-first) order. Both
// settings are process-global, so this only needs to run once from a
// module every Inngest entry point loads.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

// v4's `ClientOptions` has no `schemas` field (that was the v3 `EventSchemas`
// API, removed in v4 — see events.ts). Event typing now lives on each
// `EventType`, not on the client. `INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY`
// are read by the SDK directly from process.env; both are optional locally.
export const inngest = new Inngest({
  id: "obsidian",
  isDev: process.env.NODE_ENV !== "production",
});
