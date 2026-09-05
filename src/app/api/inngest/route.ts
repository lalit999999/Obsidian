import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

// Pulls in Prisma's pg adapter transitively via the functions it serves —
// must run on the Node runtime, not edge.
export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({ client: inngest, functions });
