import type { InngestFunction } from "inngest";

import { ingestDocumentFunction } from "@/inngest/functions/ingest-document";
import { purgeDocument } from "@/inngest/functions/purge-document";
import { purgeProject } from "@/inngest/functions/purge-project";

export const functions: InngestFunction.Any[] = [
  ingestDocumentFunction,
  purgeDocument,
  purgeProject,
];
