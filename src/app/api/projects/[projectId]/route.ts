/**
 * SINGLE PROJECT API
 *
 * Implement endpoints for one project.
 *
 * GET /api/projects/[projectId]
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Read projectId from route params.
 * 3. Find the project.
 * 4. Verify project.userId matches the authenticated user.
 * 5. Return project details.
 *
 * PATCH /api/projects/[projectId]
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Verify project ownership.
 * 3. Validate editable fields:
 *    - name
 *    - description
 * 4. Update the project.
 * 5. Return the updated project.
 *
 * DELETE /api/projects/[projectId]
 *
 * Responsibilities:
 * 1. Authenticate the user.
 * 2. Verify ownership before deletion.
 * 3. Delete the project.
 *
 * Note:
 * Prisma relations use cascading deletes for database records.
 * Keep external resource cleanup considerations separate.
 *
 * Security rule:
 * Never perform findUnique + delete without checking user ownership.
 */