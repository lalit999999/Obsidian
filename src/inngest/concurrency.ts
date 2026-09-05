// One ingestion per user at a time: a 40-page PDF must not starve
// another user's 2-page upload of the embeddings quota.
export const PER_USER_INGEST_CONCURRENCY = { key: "event.data.userId", limit: 1 };

// Global ceiling matched to the embeddings provider's requests-per-minute.
// Tune EMBEDDING_RPM if the provider changes.
export const EMBEDDING_THROTTLE = { limit: 60, period: "1m" as const };
