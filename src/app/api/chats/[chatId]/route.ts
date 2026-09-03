/**
 * SINGLE CHAT API
 *
 * GET /api/chats/[chatId]
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Find the chat.
 * 3. Verify chat.userId belongs to the current user.
 * 4. Return chat metadata and messages.
 * 5. Order messages by createdAt ascending.
 *
 * PATCH /api/chats/[chatId]
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Verify chat ownership.
 * 3. Validate title.
 * 4. Update the chat.
 *
 * DELETE /api/chats/[chatId]
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Verify chat ownership.
 * 3. Delete the chat.
 *
 * Messages should be removed through the configured
 * database relation behavior.
 */