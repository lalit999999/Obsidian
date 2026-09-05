import { Inngest } from "inngest";

// v4's `ClientOptions` has no `schemas` field (that was the v3 `EventSchemas`
// API, removed in v4 — see events.ts). Event typing now lives on each
// `EventType`, not on the client. `INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY`
// are read by the SDK directly from process.env; both are optional locally.
export const inngest = new Inngest({ id: "obsidian" });
