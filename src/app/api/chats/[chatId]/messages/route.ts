/**
 * AI CHAT MESSAGE API
 *
 * This is the main AI endpoint.
 *
 * POST /api/chats/[chatId]/messages
 *
 * Complete flow:
 *
 * User sends question
 *        ↓
 * Authenticate user
 *        ↓
 * Verify chat ownership
 *        ↓
 * Verify project ownership
 *        ↓
 * Apply rate limit
 *        ↓
 * Validate message
 *        ↓
 * Store USER message
 *        ↓
 * Retrieve relevant chunks using Part 2 RAG
 *        ↓
 * Build grounded AI prompt
 *        ↓
 * Generate assistant response
 *        ↓
 * Store ASSISTANT message
 *        ↓
 * Save retrieval sources
 *        ↓
 * Return response
 *
 * Request body:
 * {
 *   content: string
 * }
 *
 * Validation:
 * - content must not be empty
 * - trim whitespace
 * - enforce a reasonable maximum length
 *
 * Authentication:
 * - Reject unauthenticated users with 401.
 *
 * Ownership:
 * - Verify chat.userId === currentUser.id.
 * - Verify the chat's project belongs to the current user.
 *
 * Rate limiting:
 * - Apply the configured AI rate limit.
 * - Use a per-user identifier.
 * - Return 429 when the limit is exceeded.
 *
 * RAG:
 * - Call the existing Part 2 retrieval function.
 * - Retrieve the top relevant chunks.
 * - Filter retrieval by userId and projectId as supported
 *   by the existing pipeline.
 *
 * AI:
 * - Pass the question and retrieved context to the
 *   knowledge assistant.
 * - Do not send the entire knowledge base.
 *
 * Persistence:
 * - Store USER message before generation.
 * - Store ASSISTANT message after successful generation.
 * - Store source metadata in Message.sources.
 *
 * Error handling:
 * - Do not store a fake assistant answer when generation fails.
 * - Return structured JSON errors.
 *
 * MVP response format:
 * {
 *   userMessage: ...,
 *   assistantMessage: ...,
 *   sources: [...]
 * }
 *
 * Keep orchestration readable by extracting AI generation,
 * prompt construction, ownership checks, and validation
 * into reusable modules.
 */