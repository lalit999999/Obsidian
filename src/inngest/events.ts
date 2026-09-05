import { eventType, staticSchema } from "inngest";

/**
 * Single source of truth for every event this app sends/reacts to.
 *
 * Inngest v4 removed `EventSchemas`/`fromRecord` (present in v3 and in older
 * docs/training data). The v4 replacement is `eventType(name, { schema })`,
 * which returns an `EventType` usable directly as a function trigger
 * (`{ event: documentUploaded }`) and for creating typed sends
 * (`documentUploaded.create(data)`). `staticSchema<T>()` gives compile-time
 * typing with no runtime validation, which is all we need here.
 */

export const documentUploaded = eventType("document/uploaded", {
  schema: staticSchema<{
    documentId: string;
    projectId: string;
    userId: string;
  }>(),
});

export const documentDeleted = eventType("document/deleted", {
  schema: staticSchema<{
    documentId: string;
    userId: string;
    cloudinaryPublicId: string;
  }>(),
});

export const projectDeleted = eventType("project/deleted", {
  schema: staticSchema<{
    projectId: string;
    userId: string;
  }>(),
});

export const chatTitleRequested = eventType("chat/title.requested", {
  schema: staticSchema<{
    chatId: string;
    userId: string;
    firstMessage: string;
  }>(),
});
