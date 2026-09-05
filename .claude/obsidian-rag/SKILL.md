---
name: obsidian-rag
description: Qdrant, embedding and chunking conventions for the Obsidian RAG pipeline — point ID derivation, payload shape, payload indexes, metadata filters, the split OpenAI clients, and cascade deletion order. Use this skill whenever you touch anything under src/lib/rag/ or src/actions/rag/, add or change a Qdrant payload field, write a retrieval filter, change chunking, generate embeddings, or delete a document. Use it before writing any Qdrant call.
---

# Obsidian: RAG pipeline conventions

Single collection, `knowledge_base`, filtered by payload. **Never create a collection per project or per user.**

## Point IDs

Qdrant accepts only unsigned 64-bit integers or UUIDs. IDs are derived deterministically:

```ts
buildDocumentPointId(documentId, chunkIndex)  // UUIDv5 over `${documentId}:${chunkIndex}`
```

in `src/lib/rag/qdrant-store.ts`. This makes re-ingestion idempotent — same chunk, same point, upsert overwrites. Do not replace it with `randomUUID()`, and do not change the namespace constant; that would orphan every existing vector.

## Payload

Every point carries `userId`, `projectId`, `documentId`, `fileName`, `chunkIndex`, `content`, plus whatever the current contract adds. If you add a field you intend to filter on, you must also create a **keyword payload index** for it in `src/lib/rag/collection.ts` — Qdrant filters without an index work but degrade badly and are the usual cause of "retrieval got slow".

Index creation is idempotent-ish; wrap each call in try/catch with a `console.warn` so a transient failure never blocks ingestion, and memoise the whole bootstrap so it runs at most once per process.

## Filters

Retrieval is always scoped. The base filter is non-negotiable:

```ts
must: [
  { key: "userId",    match: { value: userId } },
  { key: "projectId", match: { value: projectId } },
]
```

Narrowing to a subset of documents adds `{ key: "documentId", match: { any: documentIds } }`. An empty or omitted array means "everything in the project" — never translate it into `match: { any: [] }`, which matches nothing.

Verify method names and filter shapes against `node_modules/@qdrant/js-client-rest/dist/types/` before writing them.

## Embeddings

- Two OpenAI clients exist and they are not interchangeable: `openaiClient` for chat, `openaiEmbeddingClient` for embeddings. OpenRouter (a common `OPENAI_BASE_URL`) has **no** `/v1/embeddings` endpoint, which is why the embedding client has its own base URL and does not fall back to `OPENAI_BASE_URL`.
- Batch size is `RAG_EMBEDDING_BATCH_SIZE` (8). Keep batching; do not embed a 400-chunk document in one call.
- Vector size comes from `RAG_EMBEDDING_DIMENSIONS`. Changing the embedding model changes the vector size, which means the existing collection is invalid — that is a migration, not a config tweak. Say so out loud before doing it.

## Chunking

`RAG_CHUNK_SIZE` 1000, `RAG_CHUNK_OVERLAP` 150, character-based, in `src/lib/rag/chunker.ts`. `chunkIndex` must stay globally sequential across a document even when chunking is done per page or per section, because it is half the point ID.

## Deletion order

Postgres cascades do not reach external stores. Delete in this order, or you strand data:

1. Qdrant vectors (`deleteDocumentVectors`) — **fatal on failure**, do not continue
2. Cloudinary asset — log and continue on failure, a dead asset is recoverable
3. The Postgres row

## Failure behaviour

Retrieval returning zero chunks is a normal state, not an error. It must produce an answer that says nothing relevant was found — never an invented answer, never a 500.
