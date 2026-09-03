/**
 * PROJECT COLLECTION API
 *
 * Implement the project collection endpoints.
 *
 * GET /api/projects
 *
 * Responsibilities:
 * 1. Verify the current user is authenticated.
 * 2. Return only projects owned by the authenticated user.
 * 3. Order projects by updatedAt descending.
 * 4. Include useful counts for the dashboard if needed
 *    (documents and chats).
 * 5. Never expose projects belonging to another user.
 *
 * POST /api/projects
 *
 * Responsibilities:
 * 1. Verify authentication.
 * 2. Parse and validate request body.
 * 3. Expected fields:
 *    - name: required string
 *    - description: optional string
 * 4. Create the project with userId from the authenticated session.
 * 5. Return the newly created project.
 *
 * Error handling:
 * - 401 if unauthenticated.
 * - 400 for invalid input.
 * - 500 for unexpected server errors.
 *
 * Keep business logic clean and use shared validation utilities.
 */