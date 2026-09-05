import type { InngestFunction } from "inngest";

import { generateChatTitle } from "@/inngest/functions/generate-chat-title";
import { ingestDocumentFunction } from "@/inngest/functions/ingest-document";
import { purgeDocument } from "@/inngest/functions/purge-document";
import { purgeProject } from "@/inngest/functions/purge-project";
import { sweepStuckDocuments } from "@/inngest/functions/sweep-stuck-documents";

export const functions: InngestFunction.Any[] = [
  ingestDocumentFunction,
  purgeDocument,
  purgeProject,
  sweepStuckDocuments,
  generateChatTitle,
];
