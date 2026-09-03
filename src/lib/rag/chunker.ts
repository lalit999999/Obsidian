/**
 * Split document text into smaller overlapping chunks.
 *
 * MVP strategy:
 * - fixed-size chunks of approximately 1000 characters
 * - approximately 150 characters of overlap
 *
 * The overlap preserves context between adjacent chunks.
 *
 * Return structured chunks instead of plain strings.
 * Each chunk must include:
 * - content
 * - chunkIndex
 *
 * Handle:
 * - empty content
 * - documents smaller than one chunk
 * - final partial chunks
 *
 * Keep the chunking logic deterministic so the same input produces
 * predictable chunk ordering.
 */