import type { InngestFunction } from "inngest";

import { purgeDocument } from "@/inngest/functions/purge-document";
import { purgeProject } from "@/inngest/functions/purge-project";

export const functions: InngestFunction.Any[] = [purgeDocument, purgeProject];
