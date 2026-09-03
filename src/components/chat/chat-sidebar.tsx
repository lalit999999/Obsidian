/**
 * CHAT SIDEBAR
 *
 * Make the existing chat sidebar functional.
 *
 * Responsibilities:
 *
 * - Display chats for the current project.
 * - Highlight the active chat.
 * - Create a new chat.
 * - Switch between chats.
 * - Optionally support rename and delete.
 *
 * Data flow:
 *
 * Project ID
 *      ↓
 * Load project chats
 *      ↓
 * Render chat list
 *      ↓
 * User selects chat
 *      ↓
 * Load chat messages
 *
 * New chat flow:
 *
 * Click New Chat
 *      ↓
 * POST /api/chats
 *      ↓
 * Receive new chat
 *      ↓
 * Make it active
 *
 * Keep the component responsive and handle loading states.
 */