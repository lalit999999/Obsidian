/**
 * CHAT COLLECTION API
 *
 * GET /api/chats?projectId=...
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Validate projectId from query parameters.
 * 3. Verify the project belongs to the current user.
 * 4. Return chats belonging to the project.
 * 5. Order chats by updatedAt descending.
 *
 * POST /api/chats
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Validate request body.
 * 3. Required:
 *    - projectId
 * 4. Optional:
 *    - title
 * 5. Verify project ownership.
 * 6. Create a chat with:
 *    - projectId
 *    - userId from the authenticated user
 *    - default title when no title is provided
 * 7. Return the new chat.
 *
 * A chat must always belong to a project owned by the current user.
 */