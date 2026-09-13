import dns from "node:dns";
import net from "node:net";

// Node's dns.lookup() tries the addresses in whatever order getaddrinfo
// returns, which can put an unreachable AAAA record first on hosts without
// real IPv6 egress (e.g. this repo's Postgres host) — outgoing pg
// connections hit this. Reordering alone isn't enough: Happy Eyeballs
// (autoSelectFamily) still races the unreachable IPv6 attempt in parallel,
// which can surface as an unhandleable "AggregateError" or a dropped
// connection ("Connection terminated unexpectedly"). Disabling it forces
// plain sequential attempts in dns.lookup()'s (now IPv4-first) order.
// Both settings are process-global, so this only needs to run once per
// process — every entry point that opens pg connections (the Next.js
// server via Prisma, and Inngest functions) must import this module.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);
